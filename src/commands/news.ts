import { MessageEmbed } from 'discord.js';
import { ClientOperator } from "../bot-types";
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import { DefaultCommandsReturn } from "./index";
import cs from '../tools/discomon/image-generator/color_schemes';

export default async function ({ discord }: ClientOperator, message: MessageNonNull): Promise<DefaultCommandsReturn> {
    const avatar_url = discord?.user?.avatarURL();
    const embed = new MessageEmbed()
        .setColor(cs.embed)
        .setTitle('**Join Support Server**')
        .setURL('https://discord.gg/DMpG2qz')
        .setAuthor('Discomon News');

    if (avatar_url != null) {
        embed.setAuthor('Discomon News', avatar_url);
    }
    embed.addField('Economy and rune update Oct 13', '- Runes have a new look and there is now no overlap between values on different rarities.\n' +
        '**Economy:**\n' +
        '- Much improved xp and credit rewards for losers in matchmaking. Battles will almost always pay for themselves.\n- Level differential returned to 3 levels in matchmaking to make it easier to level.\n- Token cost reduced to 7, lootbox cost reduced to 30.');
    if (message?.member?.displayName != null) {
        console.log(`${ message.member.displayName } requested NEWS.`);
    } else {
        console.log('can\'t find displayName!');
    }
    return send_to_discord(message.channel, { embed });
}
