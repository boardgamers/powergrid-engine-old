import type BaseEngine from "./base-engine";

export type CommandStruct<
  Phase extends string,
  MoveName extends string,
  Player,
  Engine extends BaseEngine<Player, string, string, string, any, any> = BaseEngine<Player>,
  AvailableCommandData extends BaseCommandData<MoveName> = BaseCommandData<MoveName>,
  CommandData extends BaseCommandData<MoveName> = BaseCommandData<MoveName>,
> = {
  [phase in Phase]?: {
    moves?: {
      [move in MoveName]?: {
        available?: (engine: Engine, player: Player) => _AvailableCommandHelper<MoveName, AvailableCommandData, move>,
        valid?: (move: _CommandHelper<MoveName, CommandData, move>, available: _CommandHelper<MoveName, AvailableCommandData, move>, engine: Engine, player: Player) => boolean,
        exec?: (engine: Engine, player: Player, move: _CommandHelper<MoveName, CommandData, move>) => void
      }
    },
    started?: (engine: Engine) => void,
    ended?: (engine: Engine) => void,
  }
}

export type BaseCommandData<MoveName extends string> = {[key in MoveName]?: any};

export type AvailableCommands<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, PlayerId = number> = {
  [move in MoveName]: _AvailableCommand<MoveName, AvailableCommandData, move, PlayerId>;
}

export type Commands<MoveName extends string, CommandData extends BaseCommandData<MoveName>> = {
  [move in MoveName]: _Command<MoveName, CommandData, move>;
}

export type AvailableCommand<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, PlayerId = number> = AvailableCommands<MoveName, AvailableCommandData, PlayerId>[MoveName];
export type Command<MoveName extends string, CommandData extends BaseCommandData<MoveName>> = Commands<MoveName, CommandData>[MoveName];

export type MoveNameWithoutData<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>> = Exclude<MoveName, Exclude<_MoveNameWithData<MoveName, AvailableCommandData>[MoveName], never>>;
export type MoveNameWithData<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>> = Exclude<MoveName, MoveNameWithoutData<MoveName, AvailableCommandData>>;

type _CommandHelper<MoveName extends string, CommandData extends BaseCommandData<MoveName>, move extends MoveName> = move extends keyof CommandData ? CommandData[move] : never;
type _AvailableCommandHelper<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, move extends MoveName> = move extends keyof AvailableCommandData ? AvailableCommandData[move] | AvailableCommandData[move][] | false : boolean;

type _AvailableCommand<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, move extends MoveName, PlayerId = number> = _CommandHelper<MoveName, AvailableCommandData, move> extends never ? {move: move, player: PlayerId} : {move: move, player: PlayerId, data: _CommandHelper<MoveName, AvailableCommandData, move>};

type _Command<MoveName extends string, CommandData extends BaseCommandData<MoveName>, move extends MoveName> = _CommandHelper<MoveName, CommandData, move> extends never ? {move: move} : {move: move, data: _CommandHelper<MoveName, CommandData, move>};

type _MoveNameWithData<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>> = {
  [key in MoveName]:_CommandHelper<MoveName, AvailableCommandData, key> extends never ? never : key
};
