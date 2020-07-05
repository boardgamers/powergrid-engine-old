import { sortBy } from "lodash";
import type PlayerColor from "./enums/player-color";
import type Resource from "./enums/resource";
import type Plant from "./plant";
import { shuffle } from "./utils";
import plants from "./data/plants";
import maps from "./maps";

class Board {
  map: {
    model: "us";

    cities: {[city: string]: {players: PlayerColor[]}};
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
  ];;

  draw: {
    plants: {
      current: Plant[];
      future: Plant[];
    }
  }

  constructor(seed: string) {
    this.draw = {
      plants: {
        current: [plants.find(plant => plant.price === 13)!, ...shuffle(plants.filter(plant => plant.price > 10 && plant.price !== 13), seed)],
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
      cities: ([] as string[]).concat(...maps.us.zones.map(zone => zone.cities)).reduce((acc, city) => ({...acc, [city]: []}), {})
    };
  }

  reorderMarkets() {
    const marketPlants = sortBy([...this.market.current.plants, ...this.market.future.plants], "price");
    this.market.current.plants = marketPlants.slice(0, this.market.current.max);
    this.market.future.plants = marketPlants.slice(this.market.current.max, this.market.current.max + this.market.future.max);
  }
}

export default Board;