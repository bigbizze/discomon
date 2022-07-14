import { DefaultCommandsReturn } from "./index";
import { MessageEmbed } from 'discord.js';
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import get_formatted_hsl, { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
// @ts-ignore
import { profanity } from '@2toad/profanity';
import { discover_image } from "../tools/discomon/image-generator/embed_images";
import get_alphamon from "../tools/discomon/alpha_seed";

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Type `.chip <official name>` to add your active Discomon to the dex.\nRequires chips and level 18.', 'chip', discord?.user?.avatarURL());
    }

    if (!await db_fns.user_exists(message?.member?.id)) {
        return;
    }
    const sender = get_discord_sender(message.channel);
    if (!await db_fns.has_mon(message?.member?.id)) {
        return sender(`**❌ You don\'t have any Discomon.**`);
    }
    if (!args || args === []) {
        return sender(`**❌ No name specified.**`);
    }

    const official_name = args.join(' ');

    if (!official_name.replace(/\s/g, '').length) {
        return sender(`**❌ No name specified.**`);
    }

    if (!/^[A-Za-z0-9 _]*$/.test(official_name) || official_name.length > 15 || profanity.exists(official_name)) {
        return sender(`**❌ Letters, spaces, numbers | < 15 characters. No profanity.**`);
    }
    if (message?.member?.id == null) {
        throw new Error("WHY IS message?.member?.id null here??");
    }
    const inventory = await db_fns.get_inventory(message.member.id);
    if (inventory == null) {
        return sender(`**Couldn't find inventory!**`);
    }
    if (inventory.chip < 1) {
        return sender(`**❌ You don\'t have any chips.**`);
    }
    const db_mon = await db_fns.get_active_mon(message.member.id);
    if (db_mon == null) {
        return sender(`**Couldn't find Discomon!**`);
    }
    const in_dex = await db_fns.mon_in_dex(db_mon.seed);
    if (in_dex) {
        return sender(`**That Discomon species is already chipped.**`);
    }

    const mon = get_alphamon(db_mon, "user");
    if (mon.level !== 18) {
        return sender(`**❌ Your mon is not level 18.**`);
    }
    const image_buffer = await discover_image(mon, db_mon.seed, official_name, message?.member?.displayName);

    await db_fns.increment_inventory(message?.member?.id, 'chip', (-1));
    await db_fns.new_dex(db_mon.seed, message.member.id, official_name);
    const avatar = discord?.user?.avatarURL();
    const filename = `${ Date.now() }.png`;
    const embed = new MessageEmbed()
        .setColor(get_formatted_hsl(mon.colours.body_colour_one))
        .attachFiles([ { 'name': filename, 'attachment': image_buffer } ])
        .setImage(`attachment://${ filename }`);
    if (avatar) {
        embed.setAuthor(`New Dex Entry!`, avatar);
    }
    return sender({ embed });
}

