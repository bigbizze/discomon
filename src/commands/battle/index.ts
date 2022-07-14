import { Client, MessageMentions } from 'discord.js';
import { DbBoss, DbDiscomon, DbInventory, DbPlayer } from "../../scaffold/database_types";
import { DiscordNotNull, MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";
import { map_to_battle_users } from "./mappers";
import { on_battle_error } from "./battle_trackers";
import { validate_state_resolve_sides } from "./resolvers";

import { ResolvedDbFns } from "../../tools/database";
import { ItemAbility } from "../../scaffold/type_scaffolding";
import do_battle, { BattleEndState } from "../../tools/battles";
import battle_embed from "../../tools/battles/battle_embed";
import { get_battle_img } from "../../tools/discomon/image-generator/get-battle-image";
import { ClientOperator } from "../../bot-types";
import { is_type_one } from "../../helpers/general_helpers";
import match from "../match";
import { increment_battle_trackers } from "../../tools/client/battle-trackers";

export interface UserDiscomonBattle extends DbDiscomon {
    level: number;
    modifiers: ItemAbility[];
}

export interface BossDiscomonBattle extends DbBoss {
    level: number;
    modifiers: ItemAbility[];
}

export interface PlayerBattle extends DbPlayer {
    nickname: string;
    display_name: string;
    mon: UserDiscomonBattle;
}

export interface AttackerBattle extends PlayerBattle {
    inventory: DbInventory;
}

export interface BossBattle {
    nickname: string;
    id: string;
    display_name: string;
    mon: BossDiscomonBattle;
}

export interface AttackerDefenderUser {
    attacker: AttackerBattle;
    defender: PlayerBattle | BossBattle;
    is_pve: boolean;
}

export interface MentionsWithMembers extends MessageMentions {
    members: NonNullable<MessageMentions["members"]>;
}

export interface NotNullProps {
    discord: DiscordNotNull;
    message: MessageNonNull;
}

export type Battler = AttackerBattle | PlayerBattle | BossBattle;

export interface GenericBattler extends PlayerBattle {
    mon: BossDiscomonBattle & UserDiscomonBattle;
}

export type StandardBattler = GenericBattler;

export async function before_battle(db_fns: ResolvedDbFns, id: string, display_name: string, message: MessageNonNull) {
    if (await db_fns.has_shield(id)) {
        send_to_discord(message.channel, `\`${ display_name }\``);
        await db_fns.set_inventory_value(id, 'shield', 0);
    }
    await db_fns.increment_inventory(id, 'token', (-1));
}

export const do_regular_battle = async (resolved_values: AttackerDefenderUser, discord: Client, db_fns: ResolvedDbFns, is_matchmaking: boolean): Promise<BattleEndState> => {
    const battle_users = await map_to_battle_users(resolved_values, db_fns);
    return await do_battle(battle_users, discord, db_fns, false, is_matchmaking);
};

export const do_boss_battle = async (resolved_values: AttackerDefenderUser, discord: Client, db_fns: ResolvedDbFns, is_matchmaking: boolean): Promise<BattleEndState> => {
    const battle_users = await map_to_battle_users(resolved_values, db_fns);
    return await do_battle(battle_users, discord, db_fns, true, is_matchmaking);
};

export async function do_image_embed_on_battle_end(results: BattleEndState, client: ClientOperator, message: MessageNonNull) {
    if (results.attacker.mon_state != null && results.defender.mon_state != null) {
        const attacker_items = results.attacker.mon.items
            ? results.attacker.mon.items
            : null;
        const defender_items = results.attacker.mon.items
            ? results.defender.mon.items
            : null;
        const image_buffer = await get_battle_img(results.attacker.mon_state, results.defender.mon_state, attacker_items, defender_items);
        await battle_embed(client, results, image_buffer, message);
    }
}

async function map_to_and_do_battle(client: ClientOperator, resolved_values: AttackerDefenderUser, message: MessageNonNull, discord: DiscordNotNull): Promise<BattleEndState | undefined> {
    try {
        const results = !resolved_values.is_pve
            ? await do_regular_battle(resolved_values, discord, client.db_fns, false)
            : await do_boss_battle(resolved_values, discord, client.db_fns, false);
        await do_image_embed_on_battle_end(results, client, message);
        return results;
    } catch (error) {
        on_battle_error(error, message, client.battles, resolved_values);
    }
}

export type BattleReturn = BattleEndState | "never_finished" | void;
export default async function (client: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<BattleReturn> {
    const validated_args = await validate_state_resolve_sides(client.discord, message, client.db_fns, ...args);
    if (validated_args == null) {
        return;
    }
    if (is_type_one<"matchmaking", AttackerDefenderUser>(validated_args, validated_args === "matchmaking")) {
        const decrement_battle_trackers = await increment_battle_trackers(message);
        if (decrement_battle_trackers == null) {
            return;
        }
        return await match(client, message, decrement_battle_trackers, ...args);
    } else {
        const decrement_battle_trackers = await increment_battle_trackers(message, message.mentions.members.first()?.id);
        if (decrement_battle_trackers == null) {
            return;
        }
        await before_battle(client.db_fns, validated_args.attacker.id, validated_args.attacker.display_name, message);
        const battle_results = await map_to_and_do_battle(client, validated_args, message, client.discord);
        await decrement_battle_trackers();
        if (battle_results == null) {
            return "never_finished";
        }
        return battle_results;
    }
}
