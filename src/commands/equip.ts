import { DefaultCommandsReturn } from "./index";
import { MessageEmbed } from 'discord.js';
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import prng_item from "../tools/discomon/prng-generator/prng-items";
import { item_equip_image } from "../tools/discomon/item-image-generator";
import { item_rarity_colour_switch } from "../tools/database/open_lootbox";

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (args[0] === 'help') {
        return send_help_embed(message, 'Type `.equip <rune number> <Discomon item slot number (1, 2 or 3)>` to equip a rune to your active Discomon.\n' +
            'Be careful, runes can\'t can be removed but they will be overwritten if you use the same slot twice.', 'equip', discord.user.avatarURL(), '.equip 2 1', '.equip 7 3');
    }

    if (!await db_fns.user_exists(message.member.id) || !await db_fns.has_mon(message.member.id)) {
        return;
    }
    const sender = get_discord_sender(message.channel);
    const first_arg = first(args);
    if (!args[0] || Number.isNaN(first_arg)) {
        return sender(`**❌ No rune number specified.**`);
    }

    if (!args[1] || Number.isNaN(args[1])) {
        return sender(`**❌ No slot number specified.**`);
    }

    const slot = Number(args[1]);
    if (slot < 1 || slot > 3) {
        return sender(`**❌ Slot can only be 1, 2 or 3.**`);
    }

    const mon = await db_fns.get_active_mon(message.member.id);

    if (mon == null) {
        return sender(`**❌ You have no active Discomon.**`);
    }

    const items = await db_fns.get_all_items(message.member.id);
    const db_item = items[Number(first_arg) - 1];
    if (!db_item) {
        return sender(`**❌ You have no runes in that slot.**`);
    }

    await db_fns.equip_item(mon.id, db_item.id, slot);
    const item = prng_item(db_item.id, db_item.seed, db_item.rarity, null);
    const image = await item_equip_image(db_item, mon, slot);
    const filename = `${ Date.now() }.png`;
    const embed = new MessageEmbed()
        .setTitle(`Rune Equipped!`)
        .attachFiles([ { 'name': filename, 'attachment': image } ])
        .setColor(item_rarity_colour_switch(item.rarity))
        .setImage(`attachment://${ filename }`);
    return send_to_discord(message.channel, { embed });
}

