import { DMChannel, GuildMember, NewsChannel, TextChannel } from 'discord.js';
import { ConnectPromise } from "../client/get_db_connection";
import { random } from '../../helpers/rng_helpers';
import { is_type_one } from "../../helpers/general_helpers";
import {
    get_lootbox_item_fn,
    get_lootbox_loot_fn,
    LootAggregate,
    LootboxItem,
    OpenLootbox
} from "../../helpers/lootbox_helpers";
import { item_colors } from "../discomon/item-image-generator";

interface StatStringReturn {
    hp: string;
    damage: string;
    special: string;
}

const get_rarity_value = (rarity_chance: number) => {
    if (rarity_chance > 99.95) {
        return 4;
    } else if (rarity_chance > 99.5) {
        return 3;
    } else if (rarity_chance > 97) {
        return 2;
    } else if (rarity_chance > 92) {
        return 1;
    } else {
        return 0;
    }
};

function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}

const get_rarity = (rarity_chance: number, boss = false) => {
    const rarity = get_rarity_value(rarity_chance) + (boss ? 1 : 0);
    // console.log(`${rarity_chance} :: ${rarity}`);
    return clamp(rarity, 0, 4);
};

export type ItemRarities = 'legendary' | 'mythic' | 'epic' | 'rare' | 'common';
export const item_rarity_colour_switch = (rarity: number) => {
    switch (rarity) {
        case 4:
            return item_colors[4];
        case 3:
            return item_colors[3];
        case 2:
            return item_colors[2];
        case 1:
            return item_colors[1];
        case 0:
            return item_colors[0];
        default: {
            console.log(`attempted to get an item colour by a rarity: ${ rarity } that doesn't exist!`);
            return "";
        }
    }
};


export type LootboxCommand = (user: GuildMember, channel: TextChannel | DMChannel | NewsChannel, boss: boolean, lootbox_args: OpenLootbox, num_items_owned: number, num_iters?: number | null) => Promise<OpenLootbox>;

const should_end_opening = (num_items_owned: number, opened_items?: LootboxItem) => (
    (opened_items != null ? opened_items.image_params.length : 0) + num_items_owned >= 9
);

export default function open_lootbox(db: ConnectPromise): LootboxCommand {
    const lootbox_item = get_lootbox_item_fn(db);
    const lootbox_loot = get_lootbox_loot_fn();
    return async (user: GuildMember, channel: TextChannel | DMChannel | NewsChannel, boss: boolean, lootbox_args: OpenLootbox, num_items_owned: number, num_iters: number | null = null): Promise<OpenLootbox> => {
        const seed = random(1, 9999999);
        const rarity = get_rarity(random(0, 99, false), boss);
        const box_name = boss ? "Runebox" : "Lootbox";
        const colour = rarity > lootbox_args.highest_rarity ? item_rarity_colour_switch(rarity) : lootbox_args.colour;
        const result = rarity !== 0
            ? await lootbox_item(user, seed, rarity, box_name, colour, lootbox_args?.items)
            : await lootbox_loot(user, box_name, lootbox_args?.loot_aggregate);
        if (num_iters == null) {
            console.log(`${ user.displayName } opened a lootbox and rolled a ${ rarity }`);
        }
        if (is_type_one<LootboxItem, LootAggregate>(result, "image_params" in result)) {
            const should_end = should_end_opening(num_items_owned, result);
            return {
                highest_rarity: rarity > lootbox_args.highest_rarity ? rarity : lootbox_args.highest_rarity,
                items: result,
                loot_aggregate: lootbox_args?.loot_aggregate,
                colour,
                should_end
            };
        }
        return {
            highest_rarity: rarity > lootbox_args.highest_rarity ? rarity : lootbox_args.highest_rarity,
            items: lootbox_args?.items,
            loot_aggregate: result,
            colour,
            should_end: false
        };
    };
}
