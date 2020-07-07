import { Player } from "./player";
import type PlayerColor from "./enums/player-color";
import Board from "./board";
import { shuffle } from "./utils/random";
import { MajorPhase, RoundPhase } from "./enums/phases";
import { LogItem, GameEventName } from "./log";
import { memoize } from "./utils/memoize";
import Plant from "./plant";
import BaseEngine from "./utils/base-engine";
import { MoveName } from "./enums/moves";
import commands from './commands';

export class Engine extends BaseEngine<Player, GameEventName, MoveName, LogItem, PlayerColor> {
  turnorder: PlayerColor[];

  auction?: {
    participants: PlayerColor[],
    current: PlayerColor,
    plant: Plant,
    bid?: number,
    bidder?: number
  }

  board: Board;
  majorPhase: MajorPhase;
  minorPhase: RoundPhase;
  availableCommands: Array<{move: MoveName, player: PlayerColor} & any>;

  init (players: number, seed: string) {
    this.seed = seed;
    this.board = new Board(this.rng);
    this.players = [];
    this.round = 0;

    const colors: PlayerColor[] = shuffle(["red", "blue", "brown", "green", "purple", "yellow"] as PlayerColor[], this.rng).slice(0, players);
    this.turnorder = colors;

    for (let i = 0; i < players; i++) {
      this.players.push(new Player(colors[i]));
    }

    this.log.push({event: {name: GameEventName.GameStart}, kind: "event"});

    this.roundStart();
  }

  roundStart() {
    this.addLog({event: {name: GameEventName.MajorPhaseChange, phase: MajorPhase.Step1}, kind: "event"});
    this.addLog({event: {name: GameEventName.PhaseChange, phase: RoundPhase.PlantAuction}, kind: "event"});
    this.addLog({event: {name: GameEventName.RoundStart, round: this.round + 1}, kind: "event"});

    for (const player of this.players) {
      player.beginRound();
    }

    this.currentPlayer = this.turnorder[0];

    this.generateAvailableCommands();
  }

  processLogItem(item: LogItem) {
    switch (item.event.name) {
      case GameEventName.RoundStart:
        this.round = item.event.round;
        break;
      case GameEventName.MajorPhaseChange:
        this.majorPhase = item.event.phase;
        break;
      case GameEventName.PhaseChange:
        this.minorPhase = item.event.phase;
        break;
    }
  }

  get currentPlayer() {
    if (this.auction) {
      return this.auction.current;
    }

    return super.currentPlayer;
  }

  set currentPlayer(color: PlayerColor) {
    super.currentPlayer = color;
  }

  generateAvailableCommands() {
    const functions = commands[this.minorPhase]!;

    const availableCommands: any[] = [];

    for (const [move, obj] of Object.entries(functions)) {
      if (!obj) {
        continue;
      }

      const availTest = obj.available(this, this.player(this.currentPlayer));

      if (availTest) {
        const base = {move, player: this.currentPlayer};
        if (availTest === true) {
          availableCommands.push(base);
        } else if (Array.isArray(availTest)) {
          availableCommands.push(...availTest.map(x => ({...x, ...base})));
        } else {
          availableCommands.push({...availTest, ...base});
        }
      }
    }

    this.availableCommands = availableCommands;
  }

  @memoize()
  player(color: PlayerColor) {
    return this.players.find(pl => pl.color === color)!;
  }
}