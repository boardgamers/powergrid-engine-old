import { memoize } from "./memoize";
import seedrandom from "seedrandom";
import assert from "assert";

export default class AbstractEngine<
  Player,
  GameEventName = string,
  MoveName = string,
  LogItem extends {kind: "event", event: {name: GameEventName}} | {kind: "move", move: {name: MoveName}} = {kind: "event", event: {name: GameEventName}} | {kind: "move", move: {name: MoveName}},
  PlayerId = number> {
  players: Player[];
  round: number = 0;
  log: LogItem[] = [];

  #rng?: seedrandom.prng;
  #seed = "";

  get seed() {
    return this.#seed;
  }
  set seed(newSeed: string) {
    this.#seed = newSeed;
    this.#rng = undefined;
  }
  get rng(): seedrandom.prng {
    if (!this.#rng) {
      this.#rng = seedrandom(this.seed, {state: true});
    }
    return this.#rng;
  }

  @memoize()
  player(id: PlayerId) {
    assert(typeof id === "number", "You need to override AbstractEngine.player if you use a custom player id");
    return this.players[id];
  }

  toJSON() {
    return {
      log: this.log,
      round: this.round,
      seed: this.seed,
      rngState : this.rng.state(),
      players: this.players,
    }
  }

  fromJSON(data: ReturnType<this["toJSON"]>) {
    this.log = data.log;
    this.round = data.round;
    this.seed = data.seed;
    this.#rng = seedrandom("", {state: data.rngState});
    this.players = data.players;
  }
}