import { RoundPhase, MajorPhase } from "./enums/phases";
import type Plant from "./plant";
import type PlayerColor from "./enums/player-color";
import type { Command } from "./commands";
import { MoveName } from "./enums/moves";
import Resource from "./enums/resource";

export enum GameEventName {
  GameStart = "gamestart",
  RoundStart = "roundstart",
  TurnOrder = "turnorder",
  CurrentPlayer = "currentplayer",
  AcquirePlant = "acquireplant",
  PhaseChange = "phasechange",
  MajorPhaseChange = "majorphasechange",
  DrawPlant = "drawplant",
  GameEnd = "gameend",
  GainMoney = "gainmoney",
  UseResources = "useresources",
  FillResources = "refill"
}

export interface GameEventData {
  [GameEventName.RoundStart]: {round: number},
  [GameEventName.PhaseChange]: {phase: RoundPhase},
  [GameEventName.MajorPhaseChange]: {phase: MajorPhase},
  [GameEventName.DrawPlant]: {plant: Plant},
  [GameEventName.TurnOrder]: {turnorder: PlayerColor[]},
  [GameEventName.CurrentPlayer]: {player: PlayerColor},
  [GameEventName.AcquirePlant]: {player: PlayerColor, plant: Plant, cost: number},
  [GameEventName.GainMoney]: {player: PlayerColor, money: number},
  [GameEventName.UseResources]: {player: PlayerColor, resources: {[resource in Resource]?: number}},
  [GameEventName.FillResources]: {[key: number]: {[resource in Resource]?: number}}
}

export type GameEvents = {[key in GameEventName]: key extends keyof GameEventData ? {name: key} & GameEventData[key] : {name: key}};

export type GameEvent = GameEvents[GameEventName];

type Distribute<U> = U extends {move: MoveName} ? Omit<U, "move"> & {name: U["move"]} : never;

export type LogItem = {
  kind: "event",
  event: GameEvent
} | {
  kind: "move",
  player: PlayerColor,
  move: Distribute<Command>
};