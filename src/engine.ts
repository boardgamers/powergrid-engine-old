import { Player } from "./player";
import type PlayerColor from "./enums/player-color";
import Board from "./board";
import { shuffle } from "./utils/random";
import { MajorPhase, RoundPhase } from "./enums/phases";
import { LogItem, GameEventName, GameEventData, GameEvent } from "./log";
import { memoize } from "./utils/memoize";
import Plant from "./plant";
import BaseEngine from "./utils/base-engine";
import { MoveName } from "./enums/moves";
import commands from './commands';
import { omit } from "lodash";

export class Engine extends BaseEngine<Player, RoundPhase, MoveName, GameEventName, LogItem, PlayerColor> {
  turnorder: PlayerColor[];

  auction?: {
    participants: PlayerColor[],
    current: PlayerColor,
    plant: Plant,
    bid?: number,
  }

  board: Board;
  majorPhase: MajorPhase;

  init (players: number, seed: string) {
    this.seed = seed;
    this.board = new Board();
    this.board.init(players, this.rng);
    this.players = [];
    this.round = 0;

    const colors: PlayerColor[] = shuffle(["red", "blue", "brown", "green", "purple", "yellow"] as PlayerColor[], this.rng).slice(0, players);

    for (let i = 0; i < players; i++) {
      this.players.push(new Player(colors[i]));
    }

    for (const player of this.players) {
      player.on("event", (event, data) => this.addEvent(event.name, {...data, player: player.color}));
    }
    this.board.on("event", (event, data) => this.addEvent(event.name, data));

    this.addEvent(GameEventName.GameStart);
    this.addEvent(GameEventName.MajorPhaseChange, {phase: MajorPhase.Step1});

    this.roundStart();
    this.generateAvailableCommands();
  }

  roundStart() {
    this.addEvent(GameEventName.RoundStart, {round: this.round + 1});
    this.addEvent(GameEventName.TurnOrder, {turnorder: this.players.map(player => player.color)});
    this.addEvent(GameEventName.PhaseChange, {phase: RoundPhase.PlantAuction});
  }

  switchToNextPlayer() {
    const currentIndex = this.turnorder.indexOf(this.currentPlayer);

    if (this.phase === RoundPhase.Bureaucracy || this.phase === RoundPhase.PlantAuction) {
      if (currentIndex + 1 === this.turnorder.length) {
        this.switchToNextPhase();
      } else {
        this.currentPlayer = this.turnorder[currentIndex + 1];
      }
    } else {
      if (currentIndex === 0) {
        this.switchToNextPhase();
      } else {
        this.currentPlayer = this.turnorder[currentIndex - 1];
      }
    }
  }

  switchToNextPhase() {
    switch (this.phase) {
      case RoundPhase.PlantAuction: this.addEvent(GameEventName.PhaseChange, {phase: RoundPhase.CommoditiesTrading}); break;
      case RoundPhase.CommoditiesTrading: this.addEvent(GameEventName.PhaseChange, {phase: RoundPhase.Construction}); break;
      case RoundPhase.Construction: this.addEvent(GameEventName.PhaseChange, {phase: RoundPhase.Bureaucracy}); break;
      case RoundPhase.Bureaucracy: this.roundStart(); break;
    }
  }

  addEvent<name extends GameEventName>(name: name, data?: name extends keyof GameEventData ? GameEventData[name] : undefined) {
    this.addLog({kind: "event", event: {name, ...(data ?? {})} as GameEvent})
  }

  processLogItem(item: LogItem) {
    switch (item.kind) {
      case "event":
        const event = item.event;
        switch (event.name) {
          case GameEventName.RoundStart:
            this.round = event.round;
            for (const player of this.players) {
              player.beginRound();
            }
            break;
          case GameEventName.MajorPhaseChange:
            this.majorPhase = event.phase;
            break;
          case GameEventName.PhaseChange:
            this.phase = event.phase;
            break;
          case GameEventName.TurnOrder:
            this.turnorder = event.turnorder;
            break;
          case GameEventName.CurrentPlayer:
            this.currentPlayer = event.player;
            break;
          case GameEventName.AcquirePlant:
            this.player(event.player).money -= event.cost;
            this.player(event.player).plants.push(event.plant);
            this.player(event.player).acquiredPlant = true;
            break;
          case GameEventName.DrawPlant:
            this.board.market.current.plants.push(event.plant);
            this.board.reorderMarkets();
            break;
          case GameEventName.GainMoney:
            this.player(event.player).money += event.money;
            break;
          case GameEventName.UseResources:
            for (const [resource, number] of Object.entries(event.resources)) {
              this.player(event.player).resources[resource] -= number!;
              this.board.pool.resources[resource] += number!;
            }
            break;
          case GameEventName.FillResources:
            for (const [price, resources] of Object.entries(omit(event, 'name'))) {
              const item = this.board.commodities.find(item => item.price === +price)!;

              for (const [resource, count] of Object.entries(resources)) {
                item.resources[resource] += count;
              }
            }
            break;
        }
        break;
      case "move":
        const move = item.move;
        switch (move.name) {
          case MoveName.Buy:
            const player = this.player(item.player);
            player.money -= move.data.count * move.data.price;
            player.resources[move.data.resource] += move.data.count;
            this.board.commodities.find(comm => comm.price === move.data.price)!.resources[move.data.resource] -= move.data.count;
            break;
        }
        break;
    }
  }

  drawPlant() {
    const plant = this.board.drawPlant();

    if (plant) {
      this.addEvent(GameEventName.DrawPlant, {plant});
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

  commands() {
    return commands;
  }

  @memoize()
  player(color: PlayerColor) {
    return this.players.find(pl => pl.color === color)!;
  }

  @memoize()
  formattedLinks() {
    return this.board.mapLinks();
  }

  get maxCitiesPerLocation() {
    if (this.majorPhase === MajorPhase.Step1) {
      return 1;
    }
    if (this.majorPhase === MajorPhase.Step2) {
      return 2;
    }
    return 3;
  }
}
