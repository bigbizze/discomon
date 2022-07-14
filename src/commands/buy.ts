import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import { ShopItem } from "../scaffold/type_scaffolding";
import { get_shop_img } from "../tools/discomon/image-generator/embed_images";
import { ItemAmountResolved, items, purchase_embed, shop_embed } from "./buy/shop_items";
import { ResolvedDbFns } from "../tools/database";
import { get_premium_tier } from "../tools/misc/premium_tiers";


function do_shopping(item_amount_resolved: ItemAmountResolved, shop: ShopItem[]): ShopItem | string {
    const { item, amount } = item_amount_resolved;
    const shopping = shop.filter(x => x.keywords.includes(item))[0];
    if (!shopping) {
        return '`no such item.`';
    }
    return {
        ...shopping,
        amount: amount,
        cost: shopping.cost * amount
    };
}

const resolve_spelling_or_shield = ({ item, amount }: ItemAmountResolved): ItemAmountResolved => ({
    item: item,
    amount: item === "shield" ? 1 : amount
});

function resolve_item_and_amount(...args: string[]): ItemAmountResolved {
    const first = args.shift();
    return resolve_spelling_or_shield(
        typeof first === "string" && Number.isNaN(Number(first)) ? ({
            item: first.toLowerCase(),
            amount: 1
        }) : args[0] ? ({
            amount: Math.floor(Number(first)),
            item: args.join(' ').toLowerCase()
        }) : ({
            item: ":((((",
            amount: 0
        })
    );
}

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (args[0] === 'help') {
        return send_help_embed(message, 'Type `.buy` to bring up the shop menu.\n(usage: `.buy <value> <items>` or `.buy <items>`)', 'buy', discord.user.avatarURL());
    }

    const shop_images = await get_shop_img(items);
    const sender = get_discord_sender(message.channel);
    if (!args[0]) {
        const avatar_url = discord?.user?.avatarURL();
        return shop_embed(shop_images, avatar_url, message);
    }


    if (!await db_fns.user_exists(message.member.id)) {
        return sender(`**You need to .hatch before you use other commands. Type .help for more info.**`);
    }

    const item_amount_resolved = resolve_item_and_amount(...args);
    if (item_amount_resolved.amount < 1) {
        return sender(`**❌ Invalid amount.**`);
    }

    const cost_item_resolved = do_shopping(item_amount_resolved, items);
    if (typeof cost_item_resolved === "string") {
        return sender(cost_item_resolved);
    }
    if (cost_item_resolved.name === 'Egg') {
        const eggs = await db_fns.get_eggs(message.member.id);
        const premium = await db_fns.get_premium(message.member.id);
        const { egg_slots } = get_premium_tier(premium);
        if (eggs && eggs.length + cost_item_resolved.amount > egg_slots || cost_item_resolved.amount > egg_slots) {
            return sender(`**❌ Not enough egg slots.**`);
        }
    }
    await resolve_shopping(cost_item_resolved, db_fns, message);
}

async function resolve_shopping(shopping: ShopItem, db_fns: ResolvedDbFns, message: MessageNonNull) {
    const sender = get_discord_sender(message.channel);
    if (!message.member) {
        return sender(`**Can't get player.**`);
    }
    const { cost, feature, amount, currency } = shopping;
    const player = await db_fns.get_inventory(message.member.id);
    const player_currency = currency === 'credits'
        ? player.credits
        : player.dust;
    if (player_currency < cost) {
        return sender(`**❌ Not enough ${ currency }.**`);
    } else if (feature !== 'shield' && feature !== 'egg') {
        await db_fns.increment_inventory(message.member.id, feature, amount);
    } else if (feature === 'shield') {
        const shield_time = Date.now();
        await db_fns.set_inventory_value(message.member.id, 'shield', shield_time);
        sender(`**Your shield starts now and lasts 12 hours, if you .pray or .battle it will break.**`);
    } else {
        for (let i = 0; i < amount; i++) {
            await db_fns.new_egg(message.member.id, 'standard', null, null, Date.now());
        }
    }
    // egg routine
    const avatar = message?.author?.avatarURL();
    purchase_embed(shopping, message, avatar).then(embed => sender(embed));
    await db_fns.increment_inventory(message.member.id, currency, (-cost));
}
