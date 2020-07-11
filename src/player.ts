import type Resource from "./enums/resource";
import type Plant from "./plant";
import type PlayerColor from "./enums/player-color";
import { sumBy } from "lodash";

export class Player {
  resources: {
    [key in Resource]: number
  } = {
    uranium: 0,
    oil: 0,
    coal: 0,
    garbage: 0
  };
  money: number = 50;
  // To reset every round
  acquiredPlant = false;
  name?: string;

  plants: Plant[] = [];
  cities: string[] = [];

  constructor (public color: PlayerColor) {

  }

  beginRound() {
    this.acquiredPlant = false;
  }

  totalSpace(resource: Resource) {
    return sumBy(this.plantsForResource(resource), "intake") * 2;
  }

  plantsForResource(resource: Resource) {
    return this.plants.filter(plant => plant.energy.includes(resource));
  }

  plant(plantId: number) {
    return this.plants.find(plant => plant.price === plantId);
  }

  getCityRewards(cities: number) {

  }

  availableSpace(resource: Resource) {
    const maxSpace = this.totalSpace(resource) - this.resources[resource];

    if (maxSpace <= 0) {
      return 0;
    }

    const sharedPlants = this.plantsForResource(resource).filter(plant => plant.energy.length === 2);

    const sharedSpace = sumBy(sharedPlants, "intake") * 2;
    const privateSpace = sharedSpace > maxSpace ? 0 : maxSpace - sharedSpace;

    if (sharedSpace === 0) {
      return privateSpace;
    }

    // Assumption: resource only shares space with one energy, and that energy only shares space with resource
    const sharedEnergy = sharedPlants[0].energy.find(res => res !== resource)!;

    const otherMaxSpace = this.totalSpace(sharedEnergy) - this.resources[sharedEnergy];
    const encroachingSpace = sharedSpace - otherMaxSpace;

    return privateSpace + (encroachingSpace > 0 ? sharedSpace - encroachingSpace : sharedSpace);
  }
}