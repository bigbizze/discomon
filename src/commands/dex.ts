import { DefaultCommandsReturn } from "./index";
import { Client, MessageEmbed, MessageReaction, User } from 'discord.js';
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { DbSeed } from "../scaffold/database_types";
import { get_dex_image } from "../tools/discomon/image-generator/get-dex-image";
import cs from '../tools/discomon/image-generator/color_schemes';
import advert from "../tools/discord/advert";
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Type `.dex <page number (optional)>` to see the global dex.\nType `.dex <@user>` to see someone\'s personal discoveries.', 'dex', discord?.user?.avatarURL());
    }
    const user = message?.mentions?.members?.first();
    const dex_id = user ? user.id : 'all';
    const avatar = discord.user?.avatarURL() ? discord.user?.avatarURL() : 'none';
    const full_dex: DbSeed[] = await db_fns.get_dex_entries(dex_id);
    if (full_dex.length === 0) {
        return send_to_discord(message.channel, `**No dex available.**`);
    }
    // build split dex
    const size = 9;
    const split_dex: DbSeed[][] = [];
    for (let i = 0; i < full_dex.length; i += size) {
        split_dex.push(full_dex.slice(i, i + size));
    }
    const index = !args[0] ? 0 : args[0] && typeof args[0] === "string" && Number.isNaN(Number(args[0])) ? 0 : Number(args[0]) - 1 < 0
        ? 0 : Number(args[0]) > split_dex.length - 1 ? split_dex.length - 1 : Number(args[0]) - 1;

    const specific = user ? user.displayName : false;
    await dex_handler(split_dex, avatar, discord, index, message, specific);
}

async function dex_handler(
    split_dex: DbSeed[][],
    avatar: string | null,
    discord: Client,
    index: number,
    message: MessageNonNull,
    user_name: string | false
) {
    const embed_title = !user_name ? 'Global' : `${ user_name }'s`;
    let embed = await build_dex_embed(split_dex[index], index + 1, split_dex.length, avatar, discord, embed_title);

    message.channel.send(embed).then(sentMessage => {
        sentMessage.react('⬅️');
        sentMessage.react('➡️');

        const filter = (reaction: MessageReaction, user: User) => {
            return (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && user.id === message?.member?.id;
        };
        const collector = sentMessage.createReactionCollector(filter, { time: 300000 });

        collector.on('collect', async (reaction) => {
            if ((index - 1) >= 0 && reaction.emoji.name === '⬅️') {
                await sentMessage.delete();
                return await dex_handler(split_dex, avatar, discord, index - 1, message, user_name);
            }
            if ((index + 1) < split_dex.length && reaction.emoji.name === '➡️') {
                await sentMessage.delete();
                return await dex_handler(split_dex, avatar, discord, index + 1, message, user_name);
            }
        });

    }).catch(err => console.log(err));
}

async function build_dex_embed(dex: DbSeed[], index: number, cap: number, avatar: string | null, discord: Client, title: string): Promise<MessageEmbed> {
    const embed = new MessageEmbed()
        .setColor(cs.embed);
    if (avatar) {
        embed.setAuthor(`${ title } Discodex - page ${ index } / ${ cap }`, avatar);
    }
    const filename = `${ Date.now() }.png`;
    const image = await get_dex_image(dex, discord);
    embed.attachFiles([ { 'name': filename, 'attachment': image } ])
        .setFooter(`${ advert() }React on the arrows to see more.`)
        .setImage(`attachment://${ filename }`);
    return embed;
}
