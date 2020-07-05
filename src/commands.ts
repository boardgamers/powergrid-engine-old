import { TurnPhase } from "./enums/phases";
import { MoveName } from "./enums/moves";
import type { Engine } from "./engine";
import type { Player } from "./player";
import Plant from "./plant";

const commands = {
  [TurnPhase.PlantAuction]: {
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
      match (move: {bid: number}, available: {range: [number, number]}) {
        return move.bid >= available.range[0] && move.bid <= available.range[1] && Math.floor(move.bid) === move.bid;
      }
    }
  },
  [TurnPhase.Bureaucracy]: {

  }
}

export default commands;