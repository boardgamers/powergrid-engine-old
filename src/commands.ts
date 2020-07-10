import { RoundPhase } from "./enums/phases";
import { MoveName } from "./enums/moves";
import type { Engine } from "./engine";
import type { Player } from "./player";
import type { CommandStruct, Command as BaseCommand } from "./utils/commands";
import { GameEventName } from "./log";
import Resource from "./enums/resource";
import { fromPairs, inRange } from "lodash";

export interface AvailableCommandArguments {
  [MoveName.Auction]: {plants: number[]};
  [MoveName.Bid]: {range: [number, number]};
  [MoveName.Buy]: {bundles: Array<{price: number, count: number, resource: Resource}>};
}

export interface CommandArguments {
  [MoveName.Auction]: {plant: number};
  [MoveName.Bid]: {bid: number};
  [MoveName.Buy]: {resource: Resource, price: number, count: number};
}

const commands: CommandStruct<RoundPhase, MoveName, Player, Engine, AvailableCommandArguments, CommandArguments> = {
  [RoundPhase.PlantAuction]: {
    moves: {
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
    started(engine: Engine) {
      engine.addEvent(GameEventName.CurrentPlayer, {player: engine.turnorder[0]});
    }
  },
  [RoundPhase.CommoditiesTrading]: {
    moves: {
      [MoveName.Pass]: {
        exec(engine: Engine) {
          engine.switchToNextPlayer();
        }
      },
      [MoveName.Buy]: {
        available(engine: Engine, player: Player) {
          const ret: {bundles: Array<{resource: Resource, price: number, count: number}>} = {bundles: []};

          const space = fromPairs(Resource.values().map(res => [res, player.availableSpace(res)]).filter(x => x[1] > 0));

          for (const pricePoint of engine.board.commodities) {
            if (pricePoint.price > player.money) {
              break;
            }
            for (const res of Object.keys(space) as Resource[]) {
              if (pricePoint.resources.current[res] ?? 0 > 0) {
                ret.bundles.push({price: pricePoint.price, count: Math.min(pricePoint.resources[res]!, space[res]!, Math.floor(player.money / pricePoint.price)), resource: res});
              }
            }
          }

          if (!ret.bundles.length) {
            return false;
          }
          return ret;
        },
        valid(move, available) {
          const bundle = available.bundles.find(bundle => bundle.price === move.price && bundle.resource === move.resource);

          if (!bundle) {
            return false;
          }
          if (!inRange(move.count, 1, bundle.count)) {
            return false;
          }
          return true;
        },
        exec(engine, player, move) {
          player.money -= move.data.count * move.data.price;
          player.resources[move.data.resource] += move.data.count;
        }
      }
    },
    started(engine: Engine) {
      engine.addEvent(GameEventName.CurrentPlayer, {player: engine.turnorder.slice(-1)[0]});
    }
  },
  [RoundPhase.Bureaucracy]: {

  }
}

export type Command = BaseCommand<MoveName, CommandArguments>;

export default commands;