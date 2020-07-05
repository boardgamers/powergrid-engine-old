import { Player } from "./player";
import type PlayerColor from "./enums/player-color";
import Board from "./board";
import { shuffle } from "./utils";
import { MajorPhase, TurnPhase as RoundPhase } from "./enums/phases";
import { LogItem, GameEventName } from "./log";
import { memoize } from "./utils/memoize";
import Plant from "./plant";

export class Engine {
  seed: string;
  round: number;
  players: Player[];

  turnorder: PlayerColor[];
  currentPlayer: PlayerColor;

  auction?: {
    participants: PlayerColor[],
    current: PlayerColor,
    plant: Plant,
    bid?: number,
    bidder?: number
  }

  log: LogItem[];
  board: Board;
  majorPhase: MajorPhase;
  minorPhase: RoundPhase;

  init (players: number, seed: string) {
    this.board = new Board(seed);
    this.players = [];
    this.round = 0;

    const colors: PlayerColor[] = shuffle(["red", "blue", "brown", "green", "purple", "yellow"] as PlayerColor[], seed).slice(0, players);
    this.turnorder = colors;

    for (let i = 0; i < players; i++) {
      this.players.push(new Player(colors[i]));
    }

    this.log.push({event: {name: GameEventName.GameStart}});

    this.roundStart();
  }

  roundStart() {
    this.addLog({event: {name: GameEventName.MajorPhaseChange, phase: MajorPhase.Step1}});
    this.addLog({event: {name: GameEventName.PhaseChange, phase: RoundPhase.PlantAuction}});
    this.addLog({event: {name: GameEventName.RoundStart, round: this.round + 1}});

    for (const player of this.players) {
      player.beginRound();
    }

    // TODO: generate available commands
  }

  addLog(item: LogItem) {
    this.log.push(item);

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
    return this.players.find(pl => pl.color === color);
  }
}