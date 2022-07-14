import { Connection } from "mariadb";
import { lootbox_item_image } from "../tools/discomon/item-image-generator";
import { random } from "./rng_helpers";
import { DMChannel, GuildMember, MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { ResolvedDbFns } from "../tools/database";
import { get_discord_sender } from "./discomon_helpers";
import { first, is_array, second } from "./array_helpers";

export interface OpenLootbox {
    items?: LootboxItem;
    loot_aggregate?: LootAggregate;
    colour: string;
    highest_rarity: number;
    should_end: boolean;
}

export function get_lootbox_item_fn(db: Connection) {
    return async (user: GuildMember, seed: number, rarity: number, box_name: 'Runebox' | 'Lootbox', colour: string, prev_item_args?: LootboxItem): Promise<LootboxItem> => {
        await db.query(`INSERT INTO items(seed, rarity, owner) VALUES(${ seed }, ${ rarity }, ${ user.id })`);
        return prev_item_args == null ? {
            title: 'RUNE',
            author: `${ user.displayName } opened a ${ box_name }`,
            image_params: [ { seed, rarity } ]
        } : {
            ...prev_item_args,
            author: `${ user.displayName } opened ${ prev_item_args.image_params.length } items lootboxes`,
            image_params: [
                ...prev_item_args.image_params,
                { seed, rarity }
            ]
        };
    };
}

export interface LootboxItem {
    title: string;
    author: string;
    image_params: {
        seed: number
        rarity: number
    }[];
}

export interface LootAggregate {
    author: string;
    candy: number;
    dust: number;
    tokens: number;
    credits: number;
    count: number;
}

export interface OpenLootboxResults {
    open_lootbox: OpenLootbox,
    num_opened: number,
    num_requested: number
}


export function get_lootbox_loot_fn() {
    return (user: GuildMember, box_name: 'Runebox' | 'Lootbox', prev_loot_result?: LootAggregate): LootAggregate => {
        const tokens = random(0, 1);
        const candy = random(0, 1);
        const dust = random(0, 1);
        const credits = random(1, 10);
        return prev_loot_result == null ? {
            author: `${ user.displayName } opened a ${ box_name }`,
            candy,
            dust,
            tokens,
            credits,
            count: 1
        } : {
            ...prev_loot_result,
            author: `${ user.displayName } opened ${ prev_loot_result.count + 1 } ${ box_name === "Lootbox" ? "Lootboxes" : "Runeboxes" }`,
            candy: candy + prev_loot_result.candy,
            dust: dust + prev_loot_result.dust,
            tokens: tokens + prev_loot_result.tokens,
            credits: credits + prev_loot_result.credits,
            count: prev_loot_result.count + 1
        };
    };
}

type AuthorFieldReturn = string | [ string, string ];
const get_author_field = (num_opened: number, num_requested: number, username: string, is_runebox: boolean): AuthorFieldReturn => {
    const one_opened = num_opened === 1;
    if (num_requested !== num_opened) {
        return [
            `${ username } opened ${ one_opened ? "a" : num_opened } ${ !is_runebox ? one_opened ? "lootbox" : "lootboxes" : one_opened ? "runebox" : "runeboxes" }!`,
            `*You do not have room for more items so only ${ num_opened } out of the ${ num_requested } requested were opened!*`
        ];
    } else {
        return `${ username } opened ${ one_opened ? "a" : num_opened } ${ !is_runebox ? one_opened ? "lootbox" : "lootboxes" : one_opened ? "runebox" : "runeboxes" }!`;
    }
};

export async function combined_lootbox_embed({
                                                 loot_aggregate,
                                                 items,
                                                 colour
                                             }: OpenLootbox, author_field: string | [ string, string ]): Promise<MessageEmbed> {
    const is_author_field_array = is_array(author_field);
    const embed = new MessageEmbed()
        .setAuthor(!is_author_field_array ? author_field : first(author_field as [ string, string ]));
    if (is_author_field_array) {
        embed.setDescription(second(author_field as [ string, string ]));
    }
    if (loot_aggregate) {
        embed.addField('**Common Loot**', '```🎟️tokens: ' + loot_aggregate?.tokens +
            '\n🍬candy: ' + loot_aggregate?.candy +
            '\n💸credits: ' + loot_aggregate?.credits +
            '\n☄️dust: ' + loot_aggregate?.dust + '```'
        );
    }
    embed.setColor(colour);
    if (items) {
        const filename = `${ Date.now() }.png`;
        const image = await lootbox_item_image(items);
        embed.attachFiles([ { 'name': filename, 'attachment': image } ])
            .addField('Runes', '\u200b')
            .setImage(`attachment://${ filename }`);
    }
    return embed;
}


export const is_property_not_null = (v?: LootboxItem | LootAggregate): v is NonNullable<LootboxItem | LootAggregate> => {
    return v != null;
};


export const do_increment_for_lootbox_fn = async (db_fns: ResolvedDbFns, id: string, result: LootAggregate) => {
    await db_fns.increment_inventory(id, 'token', result.tokens);
    await db_fns.increment_inventory(id, 'candy', result.candy);
    await db_fns.increment_inventory(id, 'dust', result.dust);
    await db_fns.increment_inventory(id, 'credits', result.credits);
};

export const send_lootbox = async (
    db_fns: ResolvedDbFns,
    id: string,
    channel: TextChannel | DMChannel | NewsChannel,
    get_loot_boxes_fn: () => Promise<OpenLootboxResults>,
    is_runebox: boolean,
    username: string
) => {
    const sender = get_discord_sender(channel);
    const result = await get_loot_boxes_fn();
    await db_fns.increment_inventory(id, !is_runebox ? 'lootbox' : 'runebox', -result.num_opened);
    if (is_property_not_null(result?.open_lootbox.loot_aggregate)) {
        await do_increment_for_lootbox_fn(db_fns, id, result.open_lootbox.loot_aggregate);
    }
    const author_field = get_author_field(result.num_opened, result.num_requested, username, is_runebox);
    const embed = await combined_lootbox_embed(result.open_lootbox, author_field);
    sender({ embed });
};
