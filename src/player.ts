import type Resource from "./enums/resource";
import type Plant from "./plant";
import type PlayerColor from "./enums/player-color";

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
  auctionDone = false;
  name?: string;

  plants: Plant[] = [];
  cities: string[] = [];

  constructor (public color: PlayerColor) {

  }

  beginRound() {
    this.auctionDone = false;
  }
}