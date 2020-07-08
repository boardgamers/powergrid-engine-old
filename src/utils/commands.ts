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
    [move in MoveName]?: {
      available: (engine: Engine, player: Player) => _AvailableCommandHelper<MoveName, AvailableCommandData, move>,
      valid?: (move: _CommandHelper<MoveName, CommandData, move>, available: _AvailableCommandHelper<MoveName, AvailableCommandData, move>) => boolean
    }
  }
}

export type BaseCommandData<MoveName extends string> = {[key in MoveName]?: any};

export type AvailableCommands<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, PlayerId = number> = {
  [move in MoveName]: _AvailableCommand<MoveName, AvailableCommandData, move, PlayerId>;
}

export type AvailableCommand<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, PlayerId = number> = AvailableCommands<MoveName, AvailableCommandData, PlayerId>[MoveName];

export type MoveNameWithoutData<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>> = Exclude<MoveName, Exclude<_MoveNameWithData<MoveName, AvailableCommandData>[MoveName], undefined>>;
export type MoveNameWithData<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>> = Exclude<MoveName, MoveNameWithoutData<MoveName, AvailableCommandData>>;

type _CommandHelper<MoveName extends string, CommandData extends BaseCommandData<MoveName>, move extends MoveName> = move extends keyof CommandData ? CommandData[move] : undefined;
type _AvailableCommandHelper<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, move extends MoveName> = move extends keyof AvailableCommandData ? AvailableCommandData[move] | AvailableCommandData[move][] | false : boolean;

type _AvailableCommand<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>, move extends MoveName, PlayerId = number> = _CommandHelper<MoveName, AvailableCommandData, move> extends undefined ? {move: move, player: PlayerId} : {move: move, player: PlayerId, data: _AvailableCommandHelper<MoveName, AvailableCommandData, move>};

type _MoveNameWithData<MoveName extends string, AvailableCommandData extends BaseCommandData<MoveName>> = {
  [key in MoveName]:_AvailableCommandHelper<MoveName, AvailableCommandData, key> extends undefined ? undefined : key
};
