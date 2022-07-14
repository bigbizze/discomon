import { MessageEmbed } from 'discord.js';
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import cs from '../tools/discomon/image-generator/color_schemes';

export default async function ({ discord }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (message?.guild?.id !== '694030682254475315') {
        return console.log('Not in announcement server.');
    }
    if (!args[0]) {
        return console.log('no announcement content.');
    }
    if (!(message?.member?.roles.cache.has('694067048661123093') && !message.member.roles.cache.has('711740076840845333'))) {
        return console.log('wrong permissions for announcement.');
    }
    args.shift();
    const ann = args.join(' ');
    if (ann.length > 1000) {
        await message.reply('Too long.');
    }
    const avatar_url = discord?.user?.avatarURL() == null ? "" : discord?.user?.avatarURL() as string;
    const embed = new MessageEmbed()
        .setColor(cs.embed)
        .setTitle('**Discomon Announcement**')
        .setAuthor(message.member.displayName)
        .setThumbnail(avatar_url);
    if (avatar_url != null) {
        embed.setThumbnail(avatar_url);
    }
    embed.addField('Message:', ann)
        .setTimestamp()
        .setFooter('By ' + message.member.displayName);
    send_to_discord(message.mentions.channels.first(), { embed });
    return console.log('announcement made.');
}
