import { RoundPhase } from "./enums/phases";
import { MoveName } from "./enums/moves";
import type { Engine } from "./engine";
import type { Player } from "./player";
import PlayerColor from "./enums/player-color";

type AvailableCommandArgument<move> = (move extends keyof AvailableCommandArguments ? AvailableCommandArguments[move] : undefined);
type CommandArgument<move> = (move extends keyof CommandArguments ? CommandArguments[move] : {});

type CommandStruct = {
  [phase in RoundPhase]?: {
    [move in MoveName]?: {
      available: (engine: Engine, player: Player) => Exclude<boolean | AvailableCommandArgument<move> | AvailableCommandArgument<move>[], undefined[] | (AvailableCommandArgument<move> extends undefined ? undefined : true)>,
      valid?: (move: CommandArgument<move>, available: AvailableCommandArgument<move> | AvailableCommandArgument<move>[]) => boolean
    }
  }
}

export type AvailableCommandArguments = {
  [MoveName.Auction]: {plants: number[]};
  [MoveName.Bid]: {range: [number, number]};
}

type _AvailableCommand<move extends MoveName> = AvailableCommandArgument<move> extends undefined ? {move: move, player: PlayerColor} : {move: move, player: PlayerColor, data: AvailableCommandArgument<move>};
export type AvailableCommands = {
  [key in MoveName]: _AvailableCommand<key>;
}

type _MoveNameWithArguments = {
  [key in MoveName]: AvailableCommandArgument<key> extends undefined ? undefined : key
};

export type MoveNameWithoutArguments = Exclude<MoveName, Exclude<_MoveNameWithArguments[MoveName], undefined>>;
export type MoveNameWithArguments = Exclude<MoveName, MoveNameWithoutArguments>;

export type AvailableCommand = AvailableCommands[MoveName];

interface CommandArguments {
  [MoveName.Auction]: {plant: number};
  [MoveName.Bid]: {bid: number};
}

const commands: CommandStruct = {
  [RoundPhase.PlantAuction]: {
    [MoveName.Pass]: {
      available(engine: Engine, player: Player) {
        if (engine.round === 1 && !engine?.auction && !player.auctionDone) {
          // This is the first round, the player hasn't selected a central to auction and he needs
          // to select one
          return false;
        }

        if (engine.auction && !engine.auction.bid) {
          // When putting a plant up for auction, need to make a bid
          return false;
        }

        // Otherwise the player can decide to pass whenever during the auction
        return true;
      }
    },
    [MoveName.Auction]: {
      available(engine: Engine, player: Player) {
        if (player.auctionDone) {
          return false;
        }

        if (engine.auction) {
          // Auction already started
          return false;
        }

        const plants = engine.board.market.current.plants.filter(plant => plant.price <= player.money).map(plant => plant.price);

        // No plant cheap enough for player
        if (plants.length === 0) {
          return false;
        }

        return {
          plants
        };
      },
      valid(move: {plant: number}, available: {plants: number[]}) {
        return available.plants.includes(move.plant);
      }
    },
    [MoveName.Bid]: {
      available(engine: Engine, player: Player) {
        if (player.auctionDone || !engine.auction) {
          return false;
        }

        if ((engine.auction.bid ?? 0) >= player.money || engine.auction.plant.price > player.money) {
          return false;
        }

        return {
          range: [Math.max(engine.auction.plant.price, (engine.auction.bid ?? 0) + 1), player.money]
        };
      },
      valid (move: {bid: number}, available: {range: [number, number]}) {
        return move.bid >= available.range[0] && move.bid <= available.range[1] && Math.floor(move.bid) === move.bid;
      }
    }
  },
  [RoundPhase.Bureaucracy]: {

  }
}

export default commands;