import { Player } from "./player";
import type PlayerColor from "./enums/player-color";

class Engine {
  round: number = 0;
  players: Player[];
  turnorder: PlayerColor[];
}