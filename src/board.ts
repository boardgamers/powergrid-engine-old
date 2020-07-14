import { sortBy } from "lodash";
import type PlayerColor from "./enums/player-color";
import Resource from "./enums/resource";
import type Plant from "./plant";
import { shuffle } from "./utils/random";
import plants from "./data/plants";
import maps from "./maps";
import { MajorPhase } from "./enums/phases";
import { EventEmitter } from "events";
import { GameEventName } from "./log";

class Board extends EventEmitter {
  map: {
    model: "us";

    cities: {[city: string]: {players: PlayerColor[]}};
    links: {nodes: [string, string], cost: number}[];
  };

  pool: {
    resources: {[key in Resource]: number};
  } = {
    resources: {
      oil: 24,
      coal: 24,
      garbage: 24,
      uranium: 12
    }
  };

  market: {
    current: {
      plants: Plant[];
      max: number;
    };
    future: {
      plants: Plant[];
      max: number;
    };
  };

  commodities: Array<{
    price: number,
    resources: {
      current: {[key in Resource]?: number},
      max: {[key in Resource]?: number}
    }
  }> = [
    {price: 1, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 0, uranium: 0, garbage: 0}}},
    {price: 2, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 0, uranium: 0, garbage: 0}}},
    {price: 3, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 3, uranium: 0, garbage: 0}}},
    {price: 4, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 3, uranium: 0, garbage: 0}}},
    {price: 5, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 3, uranium: 0, garbage: 0}}},
    {price: 6, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 3, uranium: 0, garbage: 0}}},
    {price: 7, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 3, uranium: 0, garbage: 3}}},
    {price: 8, resources: {max: {coal: 3, oil: 3, uranium: 1, garbage: 3}, current: {coal: 3, oil: 3, uranium: 0, garbage: 3}}},
    {price: 10, resources: {max: {uranium: 1}, current: {uranium: 0}}},
    {price: 12, resources: {max: {uranium: 1}, current: {uranium: 0}}},
    {price: 14, resources: {max: {uranium: 1}, current: {uranium: 1}}},
    {price: 16, resources: {max: {uranium: 1}, current: {uranium: 1}}},
  ];

  draw: {
    plants: {
      current: Plant[];
      future: Plant[];
    }
  }

  constructor(rng: () => number) {
    super();

    this.draw = {
      plants: {
        current: [plants.find(plant => plant.price === 13)!, ...shuffle(plants.filter(plant => plant.price > 10 && plant.price !== 13), rng)],
        future: []
      }
    };

    this.market = {
      current: {
        plants: plants.slice(0, 4),
        max: 4
      },
      future: {
        plants: plants.slice(4, 8),
        max: 4
      }
    };

    this.map = {
      model: "us",
      cities: ([] as string[]).concat(...maps.us.zones.map(zone => zone.cities)).reduce((acc, city) => ({...acc, [city]: []}), {}),
      links: maps.us.links
    };
  }

  reorderMarkets() {
    const marketPlants = sortBy([...this.market.current.plants, ...this.market.future.plants], "price");
    this.market.current.plants = marketPlants.slice(0, this.market.current.max);
    this.market.future.plants = marketPlants.slice(this.market.current.max, this.market.current.max + this.market.future.max);
  }

  refillResources(players :number, step: MajorPhase) {
    const ret: {[price: number]: {[resource in Resource]?: number}} = {};

    for (const resource of Resource.values()) {
      let avail = Math.min(this.pool.resources[resource], refill[players - 2][step][resource]);
      for (const item of this.commodities.filter(item => !!item.resources.max[resource] && item.resources.current[resource]! < item.resources.max[resource]!).reverse()) {
        const x = Math.min(avail, item.resources.max[resource]! - item.resources.current[resource]!);

        ret[item.price] = ret[item.price] || {};
        ret[item.price][resource] = x;

        avail -= x;

        if (avail <= 0) {
          break;
        }
      }
    }

    this.emit("event", GameEventName.FillResources, ret);
  }

  drawPlant(): Plant | undefined {
    return this.draw.plants.current.shift();
  }
}

const refill = [{
  [MajorPhase.Step1]: {
    garbage: 1,
    oil: 2,
    uranium: 1,
    coal: 3
  },
  [MajorPhase.Step2]: {
    garbage: 2,
    oil: 2,
    uranium: 1,
    coal: 4
  },
  [MajorPhase.Step3]: {
    garbage: 3,
    oil: 4,
    uranium: 1,
    coal: 3
  }
}, {
  [MajorPhase.Step1]: {
    garbage: 1,
    oil: 2,
    uranium: 1,
    coal: 4
  },
  [MajorPhase.Step2]: {
    garbage: 2,
    oil: 3,
    uranium: 1,
    coal: 5
  },
  [MajorPhase.Step3]: {
    garbage: 3,
    oil: 4,
    uranium: 1,
    coal: 3
  }
}, {
  [MajorPhase.Step1]: {
    garbage: 2,
    oil: 3,
    uranium: 1,
    coal: 5
  },
  [MajorPhase.Step2]: {
    garbage: 3,
    oil: 4,
    uranium: 2,
    coal: 6
  },
  [MajorPhase.Step3]: {
    garbage: 4,
    oil: 5,
    uranium: 2,
    coal: 4
  }
}, {
  [MajorPhase.Step1]: {
    garbage: 3,
    oil: 4,
    uranium: 2,
    coal: 5
  },
  [MajorPhase.Step2]: {
    garbage: 3,
    oil: 5,
    uranium: 3,
    coal: 7
  },
  [MajorPhase.Step3]: {
    garbage: 5,
    oil: 6,
    uranium: 2,
    coal: 5
  }
}, {
  [MajorPhase.Step1]: {
    garbage: 3,
    oil: 5,
    uranium: 2,
    coal: 7
  },
  [MajorPhase.Step2]: {
    garbage: 5,
    oil: 6,
    uranium: 3,
    coal: 9
  },
  [MajorPhase.Step3]: {
    garbage: 6,
    oil: 7,
    uranium: 3,
    coal: 6
  }
}];

export default Board;