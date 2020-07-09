import { RoundPhase } from "./enums/phases";
import { MoveName } from "./enums/moves";
import type { Engine } from "./engine";
import type { Player } from "./player";
import type { CommandStruct, Command as BaseCommand } from "./utils/commands";
import { GameEventName } from "./log";

export interface AvailableCommandArguments {
  [MoveName.Auction]: {plants: number[]};
  [MoveName.Bid]: {range: [number, number]};
}

export interface CommandArguments {
  [MoveName.Auction]: {plant: number};
  [MoveName.Bid]: {bid: number};
}

const commands: CommandStruct<RoundPhase, MoveName, Player, Engine, AvailableCommandArguments, CommandArguments> = {
  [RoundPhase.PlantAuction]: {
    [MoveName.Pass]: {
      available(engine: Engine, player: Player) {
        if (engine.round === 1 && !engine?.auction && !player.acquiredPlant) {
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
      },
      exec(engine, player) {
        if (engine.auction) {
          engine.auction.current = engine.auction.participants[engine.auction.participants.indexOf(player.color) + 1 % engine.auction.participants.length];
          engine.auction.participants = engine.auction.participants.filter(p => p !== player.color);

          if (engine.auction.participants.length === 1) {
            engine.addEvent(GameEventName.AcquirePlant, {player: engine.auction.current, plant: engine.auction.plant, cost: engine.auction.bid!});
            engine.drawPlant();
            delete engine.auction;
            engine.switchToNextPlayer();
          }
        } else {
          engine.switchToNextPlayer();
        }
      }
    },
    [MoveName.Auction]: {
      available(engine: Engine, player: Player) {
        if (player.acquiredPlant) {
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
      },
      exec(engine, player, move) {
        engine.auction = {
          participants: engine.turnorder.slice(engine.turnorder.indexOf(player.color)).filter(color => !engine.player(color).acquiredPlant),
          current: player.color,
          plant: engine.board.market.current.plants.find(plant => plant.price === move.data.plant)!
        }
      }
    },
    [MoveName.Bid]: {
      available(engine: Engine, player: Player) {
        if (player.acquiredPlant || !engine.auction) {
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
      },
      exec(engine, player, move) {
        engine.auction!.bid = move.data.bid;
        engine.auction!.current = engine.auction!.participants[engine.auction!.participants.indexOf(player.color) + 1 % engine.auction!.participants.length];
      }
    }
  },
  [RoundPhase.Bureaucracy]: {

  }
}

export type Command = BaseCommand<MoveName, CommandArguments>;

export default commands;