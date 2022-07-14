import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import send_help_embed from "../tools/discord/send_help_embed";
import { first } from "../helpers/array_helpers";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    if (first_arg === 'help') {
        return send_help_embed(message, 'Type `.sell <items number>` to sell an items.\nItem slot numbers will increment automatically after an items is sold.\n**SO BE CAREFUL**\nType `.sell common` or `.sell rare` to sell all of those rarities.\nItems that are equipped will **not** be sold.', 'sell', discord.user.avatarURL());
    }
    if (!await db_fns.user_exists(message.member.id)) {
        return;
    }
    const sender = get_discord_sender(message.channel);
    if (first_arg === 'common' || first_arg === 'commons') {
        let price = await db_fns.sell_all_rarity(message.member.id, 0);
        return sender(`💰 \`${ message.member.displayName } sold all common items for ${ price } dust.\``);
    }
    if (first_arg === 'rare' || first_arg === 'rares') {
        let price = await db_fns.sell_all_rarity(message.member.id, 1);
        return sender(`**💰 ${ message.member.displayName } sold all rare runes for ${ price } dust.**`);
    }
    if (!first_arg || Number.isNaN(first_arg)) {
        return sender(`**❌ No rune number specified.**`);
    }
    const item = await db_fns.get_all_items(message.member.id);
    const index = Number(first_arg) - 1;
    if (!item[index]) {
        return sender(`**❌ Rune does not exist.**`);
    }
    const price = await db_fns.sell_item(item[index].id, message.member.id);

    return sender(`**💰 ${ message.member.displayName }, rune in slot [${ first_arg }] sold for ${ price } dust.**`);
}
