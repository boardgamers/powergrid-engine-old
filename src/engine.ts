import { Player } from "./player";
import type PlayerColor from "./enums/player-color";
import Board from "./board";
import { shuffle } from "./utils/random";
import { MajorPhase, TurnPhase as RoundPhase } from "./enums/phases";
import { LogItem, GameEventName } from "./log";
import { memoize } from "./utils/memoize";
import Plant from "./plant";
import BaseEngine from "./utils/base-engine";
import { MoveName } from "./enums/moves";

export class Engine extends BaseEngine<Player, GameEventName, MoveName, LogItem, PlayerColor> {
  turnorder: PlayerColor[];
  currentPlayer: PlayerColor;

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

    // TODO: generate available commands
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

  @memoize()
  player(color: PlayerColor) {
    return this.players.find(pl => pl.color === color)!;
  }
}