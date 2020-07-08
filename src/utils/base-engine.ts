import { memoize } from "./memoize";
import seedrandom from "seedrandom";
import assert from "assert";
import { asserts } from './index';
import { BaseCommandData, AvailableCommand, CommandStruct, MoveNameWithData, MoveNameWithoutData, Command } from "./commands";

export default abstract class BaseEngine<
  Player,
  Phase extends string = string,
  MoveName extends string = string,
  GameEventName extends string = string,
  LogItem extends {kind: "event", event: {name: GameEventName}} | {kind: "move", move: {name: MoveName}} = {kind: "event", event: {name: GameEventName}} | {kind: "move", move: {name: MoveName}},
  PlayerId = number,
  AvailableCommandData extends BaseCommandData<MoveName> = BaseCommandData<MoveName>,
  CommandData extends BaseCommandData<MoveName> = BaseCommandData<MoveName>> {

  phase: Phase;
  players: Player[];
  round: number = 0;
  log: LogItem[] = [];
  availableCommands?: AvailableCommand<MoveName, AvailableCommandData, PlayerId>[];
  ended = false;

  addLog(item: LogItem) {
    this.log.push(item);
    this.processLogItem(item);
  }

  abstract commands(): CommandStruct<Phase, MoveName, Player, this, AvailableCommandData, CommandData>;

  generateAvailableCommands() {
    const functions = this.commands()[this.phase]!;

    const availableCommands: AvailableCommand<MoveName, AvailableCommandData, PlayerId>[] = [];

    for (const [move, obj] of Object.entries(functions)) {
      if (!obj) {
        continue;
      }

      asserts<NonNullable<NonNullable<(ReturnType<this["commands"]>)[Phase]>[MoveName]>>(obj);
      asserts<MoveName>(move);

      if (!obj.available) {
        availableCommands.push({move, player: this.currentPlayer} as AvailableCommand<MoveName, AvailableCommandData, PlayerId>);
        continue;
      }

      const availTest = obj.available!(this, this.player(this.currentPlayer));

      if (availTest) {
        if (availTest === true) {
          asserts<MoveNameWithoutData<MoveName, AvailableCommandData>>(move);
          availableCommands.push({move, player: this.currentPlayer} as unknown as AvailableCommand<MoveName, AvailableCommandData, PlayerId>);
        } else if (Array.isArray(availTest)) {
          asserts<MoveNameWithData<MoveName, AvailableCommandData>>(move);
          availableCommands.push(...(availTest as any[]).map(x => ({data: x, move, player: this.currentPlayer}) as unknown as AvailableCommand<MoveName, AvailableCommandData, PlayerId>));
        } else {
          availableCommands.push({...availTest as any, move, player: this.currentPlayer});
        }
      }
    }

    this.availableCommands = availableCommands;
  }

  move(player: PlayerId, move: Command<MoveName, CommandData>) {
    let avail = this.availableCommands?.filter(av => av.player === player);

    assert(avail?.length ?? 0 > 0, `It's not the turn of player ${player}`);

    avail = avail?.filter(av => av.move === move.move, `Player ${player} can't execute command ${move.move}`);

    this.commands()[this.phase]![move.move]?.exec(this, this.player(player), move);

    this.afterMove();
  }

  afterMove() {
    if (!this.ended) {
      this.generateAvailableCommands();
    }
  }

  /**
   * Change state by executing given log item
   *
   * Useful to replay a game just from log. Ideally log items are enough to fully reproduce a game
   * @param item
   */
  abstract processLogItem(item: LogItem): void;

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
      phase: this.phase,
      availableCommands: this.availableCommands
    }
  }

  fromJSON(data: ReturnType<this["toJSON"]>) {
    this.log = data.log;
    this.round = data.round;
    this.seed = data.seed;
    this.#rng = seedrandom("", {state: data.rngState});
    this.players = data.players;
    this.phase = data.phase;
    this.availableCommands = data.availableCommands;
  }

  get currentPlayer() {
    return this.#currentPlayer;
  }

  set currentPlayer(val: PlayerId) {
    this.#currentPlayer = val;
  }

  #rng?: seedrandom.prng;
  #seed = "";
  #currentPlayer: PlayerId;
}