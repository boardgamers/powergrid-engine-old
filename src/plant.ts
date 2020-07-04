import type Resource from "./enums/resource";

export default interface Plant {
  price: number;
  energy: Resource[];
  intake: number;
  power: number;
}