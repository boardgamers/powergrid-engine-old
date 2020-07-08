import { RoundPhase, MajorPhase } from "./enums/phases";
import Plant from "./plant";

export enum GameEventName {
  GameStart = "gamestart",
  RoundStart = "roundstart",
  PhaseChange = "phasechange",
  MajorPhaseChange = "majorphasechange",
  DrawPlant = "drawplant",
  GameEnd = "gameend"
}

export type GameEvent = {
  name: GameEventName.GameEnd
} | {
  name: GameEventName.GameStart
} | {
  name: GameEventName.RoundStart,
  round: number
} | {
  name: GameEventName.PhaseChange,
  phase: RoundPhase
} | {
  name: GameEventName.MajorPhaseChange,
  phase: MajorPhase
} | {
  name: GameEventName.DrawPlant,
  plant: Plant
}

export interface LogItem {
  kind: "event",
  event: GameEvent
};