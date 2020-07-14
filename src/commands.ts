import { RoundPhase } from "./enums/phases";
import { MoveName } from "./enums/moves";
import type { Engine } from "./engine";
import type { Player } from "./player";
import type { CommandStruct, Command as BaseCommand } from "./utils/commands";
import { GameEventName } from "./log";
import Resource from "./enums/resource";
import { fromPairs, inRange, sum, sumBy } from "lodash";
import shortestPath from "./utils/shortest-path";
import { link } from "fs";

export interface AvailableCommandArguments {
  [MoveName.Auction]: {plants: number[]};
  [MoveName.Bid]: {range: [number, number]};
  [MoveName.Buy]: {bundles: Array<{price: number, count: number, resource: Resource}>};
  [MoveName.Build]: {cities: Array<{city: string, cost: number}>};
}

export interface CommandArguments {
  [MoveName.Auction]: {plant: number};
  [MoveName.Bid]: {bid: number};
  [MoveName.Buy]: {resource: Resource, price: number, count: number};
  [MoveName.Build]: {city: string, cost: number};
  [MoveName.PowerPlant]: {plants: Array<{plant: number, resources: Resource[]}>};
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
        exec(engine, player, data) {
          engine.auction = {
            participants: engine.turnorder.slice(engine.turnorder.indexOf(player.color)).filter(color => !engine.player(color).acquiredPlant),
            current: player.color,
            plant: engine.board.market.current.plants.find(plant => plant.price === data.plant)!
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
        exec(engine, player, data) {
          engine.auction!.bid = data.bid;
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
        }
      }
    }
  },
  [RoundPhase.Construction]: {
    moves: {
      [MoveName.Pass]: {
        exec(engine: Engine) {
          engine.switchToNextPlayer();
        }
      },
      [MoveName.Build]: {
        available(engine, player) {
          const maxCities = engine.maxCitiesPerLocation;
          const cities = Object.entries(engine.board.map.cities).filter(entry => entry[1].players.length < maxCities && 10 + 5 * entry[1].players.length <= player.money && !entry[1].players.includes(player.color)).map(entry => ({city: entry[0], cost: 10 + 5 * entry[1].players.length}));

          if (player.cities.length === 0) {
            return {cities};
          }

          const selectedCities: typeof cities = [];

          for (const city of cities) {
            const path = shortestPath(player.cities, [city.city], engine.formattedLinks(), player.money - city.cost);

            if (!path) {
              continue;
            }
            selectedCities.push({city: city.city, cost: city.cost + path.cost});
          }

          return false;
        },
        valid(move, available) {
          return available.cities.some(x => x.city === move.city && x.cost === move.cost);
        },
        exec(engine, player, data) {
          engine.board.map.cities[data.city].players.push(player.color);
          player.cities.push(data.city);
          player.money -= data.cost;
        }
      }
    },
    started(engine: Engine) {
      engine.addEvent(GameEventName.CurrentPlayer, {player: engine.turnorder.slice(-1)[0]});
    }
  },
  [RoundPhase.Bureaucracy]: {
    moves: {
      [MoveName.Pass]: {
        exec(engine, player) {
          player.getCityRewards(0);
          engine.switchToNextPlayer();
        }
      },
      [MoveName.PowerPlant]: {
        available(engine, player) {
          return player.plants.some(plant => sum(plant.energy.map(energy => player.resources[energy])) >= plant.intake);
        },
        valid(move, avail, engine, player) {
          const resources: Resource[] = [];
          const totals = {...player.resources};
          for (const plantData of move.plants) {
            const plant = player.plant(plantData.plant);

            if (!plant) {
              return false;
            }
            if (plant.intake !== plantData.resources.length) {
              return false;
            }
            if (!plantData.resources.every(resource => plant.energy.includes(resource))) {
              return false;
            }
            for (const resource of resources) {
              totals[resource] -= 1;

              if (totals[resource] < 0) {
                return false;
              }
            }
          }

          return true;
        },
        exec(engine, player, move) {
          const totalPower = sumBy(move.plants.map(plant => player.plant(plant.plant)), "power");
          engine.addEvent(GameEventName.UseResources, {player: player.color, resources: ([] as Resource[]).concat(...move.plants.map(plant => plant.resources)).reduce((acc, resource) => ({...acc, [resource]: (acc[resource] ?? 0) + 1}), {})});
          player.getCityRewards(Math.min(totalPower, player.cities.length));
          engine.switchToNextPlayer();
        }
      }
    }, ended(engine) {
      engine.board.refillResources(engine.players.length, engine.majorPhase);
    }
  }
}

export type Command = BaseCommand<MoveName, CommandArguments>;

export default commands;