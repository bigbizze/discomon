import { Client, Message } from 'discord.js';
import { Indexer, WithProperty } from "./utility_types";
import { MentionsWithMembers, NotNullProps } from "../commands/battle";
import { is_null } from "./general_helpers";

import cc from 'color-convert';
import { Colour, Item, ItemAbility, ItemType } from "../scaffold/type_scaffolding";
import { ItemRarities } from "../tools/database/open_lootbox";
import { BattleMon } from "../tools/battles/resolvers";
import { choice } from "./rng_helpers";
import fs from 'fs';
import { withDb } from "../tools/client/get_db_connection";
import { DbDiscomon, DbItem } from "../scaffold/database_types";
import get_mon_active_items from "../tools/database/get_mon_active_items";
import { ClientOperator } from "../bot-types";
import { CommandTypeTyped } from "../commands";
import send_help_embed from "../tools/discord/send_help_embed";
import icon_manager from "../icon-manager";
import { first } from "./array_helpers";
import { ResolvedDbFns } from "../tools/database";
import { app_root_path } from "../constants";


export const check_not_null_props = (message_in: Message, discord_in: Client): NotNullProps | void => {
    const message = check_message_props_not_null(message_in);
    if (message == null) {
        return;
    }
    const discord = check_discord_client_user_not_null(discord_in, message);
    if (discord == null) {
        return;
    }
    return { message, discord };
};

export type SenderType<A> = (values: A) => void;

export const get_discord_sender = <A>(sender?: WithProperty<'send'>): SenderType<A> => (values: A): void => {
    send_to_discord(sender, values);
};


export const calculate_xp_to_next_level = (level: number) => (
    Math.floor(((level) / 0.3) ** 2) + 1
);

export const get_xp_from_level = (level: number) => (
    Math.round(((level - 1) / 0.3) ** 2) + 1
);

export const calculate_level = (experience?: number): number => (
    Math.floor(Math.sqrt(experience != null ? experience : 0) * 0.3 + 1)
);


export function deprecate_command_notice(new_command: CommandTypeTyped<any>, title: string, deprecation_reason: string) {
    return async (client: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<any> => {
        send_help_embed(message, `${ icon_manager("command_deprecation") }${ deprecation_reason }`, title);
        return await new_command(client, message, ...args);
    };
}

export const get_open_slot = async (db_fns: ResolvedDbFns, message: MessageNonNull, kind: "party" | "box", box_number?: number): Promise<number | void | null> => {
    if (kind === "box" && !box_number) {
        throw new Error("Have attempted to get open slot from a box but did not provide a box number!");
    }
    const mons = await db_fns.get_mons(message.member.id, kind, box_number);
    if (kind === "party" && mons.length >= 3) {
        return send_to_discord(message.channel, `${ icon_manager("error") }\`You have too many discomon in your party.\``);
    } else if (kind === "box" && mons.length >= 6) {
        return send_to_discord(message.channel, `${ icon_manager("error") }\`You have too many discomon in this box.\``);
    }
    return first(mons.reduce((obj, y) => obj.filter(v => v !== y.slot), kind === "party" ? [ 1, 2, 3 ] : [ 1, 2, 3, 4, 5, 6 ]));
};

export const get_mon_by_slot = (mons: DbDiscomon[], slot: number) => (
    first(mons.filter(x => x.slot === slot))
);

export const get_mon_from_slots_by_id = (mons: DbDiscomon[], id: number) => (
    first(mons.filter(x => x.id === id))
);

export const get_mon_in_other_slots_by_id = (mons: DbDiscomon[], id: number) => (
    first(mons.filter(x => x.id !== id))
);

export const send_to_discord = <A>(sender: WithProperty<"send"> | undefined, values: A): void => {
    sender != null
        ? sender.send(values)
            .then()
            .catch(err => console.log(err))
        : (() => {
            throw new Error("provided sender is null!");
        })();
};
export const get_item_name = (item_rarity: number, item_type: string) => (
    `${ item_rarity } ${ item_type } rune.`
);

export interface DiscordNotNull extends Client {
    user: NonNullable<Client["user"]>;
}

export interface MessageNonNull extends Message {
    guild: NonNullable<Message["guild"]>;
    member: NonNullable<Message["member"]>;
    mentions: MentionsWithMembers;
}


export const check_message_props_not_null = (message: Message): MessageNonNull | void => {
    const sender = get_discord_sender(message.channel);
    if (is_null(message?.guild)) {
        return sender("we couldn't find this guild.");
    } else if (is_null(message.member?.id)) {
        return sender("we couldn't find this member.");
    } else if (is_null(message?.mentions?.members)) {
        return sender("we couldn't find this member in mentions.");
    }
    return message as MessageNonNull;
};

export const check_discord_client_user_not_null = (discord: Client, message?: MessageNonNull): DiscordNotNull | void => {
    if (is_null(discord.user) && message) {
        return send_to_discord(message.channel, "we couldn't find this guild.");
    }
    return discord as DiscordNotNull;
};

export default function get_formatted_hsl({ hue, lum, sat }: Colour): string {
    return `#${ cc.hsl.hex([ hue, sat, lum ]) }`;
}

const is_modifier = (item_type: ItemType, item_value: ItemAbility | number): item_value is ItemAbility => (
    item_type === "modifier"
);

export function aitm(items: Item[], battle_mon: BattleMon & Indexer): BattleMon & Indexer {
    const i_modifiers = [];
    const i_stats = {
        hp: 0,
        damage: 0,
        special: 0,
        none: 0
    };
    for (const item of items) {
        item.type === 'modifier' ? i_modifiers.push(item.value) : i_stats[item.type] = i_stats[item.type] + Number(item.value);
    }
    return {
        ...battle_mon,
        stats: {
            hp: battle_mon.stats.hp + Math.floor(battle_mon.stats.hp / 100 * i_stats.hp),
            damage: battle_mon.stats.damage + Math.floor(battle_mon.stats.damage / 100 * i_stats.damage),
            special_chance: battle_mon.stats.special + i_stats.special
        },
        modifier: i_modifiers as ItemAbility[]
    };
}

export const apply_items_to_mon = (items: Item[], battle_mon: BattleMon & Indexer): BattleMon & Indexer => (
    items.reduce((obj, item) => {
        if (is_modifier(item.type, item.value)) {
            return {
                ...obj,
                modifier: [
                    ...obj.modifier,
                    item.value
                ]
            };
        }
        const is_not_special = item.type !== "special";
        const increment_by = is_not_special ? Math.floor(obj.stats[item.type] / 100 * item.value) : item.value;
        const item_type = is_not_special ? item.type : "special_chance";
        return {
            ...obj,
            stats: {
                ...obj.stats,
                [item_type]: obj.stats[item_type] + increment_by
            }
        };
    }, battle_mon)
);

export interface ItemResolved extends Indexer {
    hp: number;
    damage: number;
    special_chance: number;
    modifier: Array<string | number>;
}

export const get_item_values = (items: Item[]): ItemResolved => (
    items.reduce((obj, item) => {
        if (is_modifier(item.type, item.value)) {
            return {
                ...obj,
                modifier: [
                    ...obj.modifier,
                    item.value
                ]
            };
        }
        const is_not_special = item.type !== "special";
        const increment_by = item.value;
        const item_type = is_not_special ? item.type : "special_chance";
        return {
            ...obj,
            [item_type]: obj[item_type] + increment_by
        };
    }, {
        hp: 0,
        damage: 0,
        special_chance: 0,
        modifier: []
    } as ItemResolved)
);

export const item_rarity_lookup = (rarity: number) => ({
    [0]: "common",
    [1]: "rare",
    [2]: "epic",
    [3]: "mythic",
    [4]: "legendary"
} as { [key: number]: ItemRarities })[rarity];

// require("../../data/monster-names.json")
export const get_random_boss_name = async () => (
    choice<string>(JSON.parse(await fs.promises.readFile(`${ app_root_path }/data/monster-names.json`, "utf-8")).names)
);

export async function item_array_from_party(party: DbDiscomon[]): Promise<DbItem[][]> {
    const items = await withDb(async db => {
        const items: DbItem[][] = [];
        for (let i = 0; i < party.length; i++) {
            const slot = party[i];
            if (party[i]) {
                const mon_items = await get_mon_active_items(db)(slot.id);
                items.push(mon_items);
            } else {
                items.push([]);
            }
        }
        return items;
    });
    if (!items) {
        throw new Error("didn't get DbItem[][]!");
    }
    return items;
}

export function map_db_mon_to_party(db_mon: DbDiscomon[], max_slots: number): DbDiscomon[] {
    const res = [];
    for (let i = 0; i < max_slots; i++) {
        const found = db_mon.find(x => x.slot === (i + 1));
        if (found) {
            res[i] = found;
        }
    }
    return res;
}
