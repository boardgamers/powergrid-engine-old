import { TurnPhase, MajorPhase } from "./enums/phases";
import Plant from "./plant";

export enum GameEventName {
  GameStart,
  RoundStart,
  PhaseChange,
  MajorPhaseChange,
  DrawPlant,
  GameEnd
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
  phase: TurnPhase
} | {
  name: GameEventName.MajorPhaseChange,
  phase: MajorPhase
} | {
  name: GameEventName.DrawPlant,
  plant: Plant
}

export interface LogItem {
  event: GameEvent
};