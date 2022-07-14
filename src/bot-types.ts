import { ResolvedDbFns, UnresolvedDbFns } from "./tools/database";
import { CommandsMap } from "./commands";
import { DiscordNotNull } from "./helpers/discomon_helpers";

export type IdKey = { [id: string]: number };

export interface BattleTrackers {
    servers: IdKey,
    channels: IdKey,
    players: IdKey
}

export type ClientOperator = ClientOperatorGeneric<ResolvedDbFns>;

export interface ClientOperatorGeneric<DbFns> {
    discord: DiscordNotNull
    prefix: string,
    db_fns: DbFns
    commands: CommandsMap
    battles: BattleTrackers
    logo: string,
}


export type UnresolvedClientOperator = ClientOperatorGeneric<UnresolvedDbFns>;
