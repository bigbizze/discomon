import { DefaultCommandsReturn } from "./index";
import { Client, MessageEmbed } from 'discord.js';
import { ClientOperator } from "../bot-types";
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import cs from '../tools/discomon/image-generator/color_schemes';
import { DbDiscomon } from "../scaffold/database_types";
import { get_shard_name } from "../helpers/shard_helpers";
import { get_leader_image } from "../tools/discomon/image-generator/get-leader-image";
import advert from "../tools/discord/advert";
import send_help_embed from "../tools/discord/send_help_embed";

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (args[0] === 'help') {
        return send_help_embed(message, 'Type `.leaderboard <type (optional)>` to view a leaderboard.\n' +
            '`all`: all time wins.\n`runeterror`: runeterror damage.\n`default`: discomon less than 3 days old (wins).',
            'leaderboard', discord.user.avatarURL(),
            '.leaderboard', '.leaderboard all', '.leaderboard runeterror');
    }

    async function resolve_names(mon: DbDiscomon[], discord: Client) {
        const res = [];
        for (const m of mon) {
            const name = await get_shard_name(discord, m.owner);
            res.push({ ...m, owner: name });
        }
        return res;
    }

    const stat = args[0] && args[0].toLowerCase() === 'runeterror' ? 'boss_damage' : 'wins';
    let q_string;
    if (!args[0]) {
        q_string = 'threeday';
    } else {
        q_string = args[0].toLowerCase() === 'all' || args[0].toLowerCase() === 'runeterror' ? args[0] : 'threeday';
    }
    let footer_text;
    switch (q_string) {
        case 'all':
            footer_text = 'Top Discomon all time.';
            break;
        case 'runeterror':
            footer_text = 'Top Runeterror damage all time.';
            break;
        default:
            footer_text = 'Top Discomon under 3 days old.';
            break;
    }
    const mon = await db_fns.get_leaders(q_string);
    const leaders = await resolve_names(mon, discord);
    const image = await get_leader_image(leaders, stat);
    const avatar_url = discord?.user?.avatarURL();
    const filename = `${ Date.now() }.png`;
    const embed = new MessageEmbed()
        .setColor(cs.embed)
        .setTitle('**Join Support Server**')
        .setURL('https://discord.gg/DMpG2qz')
        .attachFiles([ { name: filename, attachment: image } ])
        .setFooter(`${ advert() }${ footer_text }`)
        .setImage(`attachment://${ filename }`);
    if (avatar_url != null) {
        embed.setAuthor('Leaderboard', avatar_url);
    }
    send_to_discord(message.channel, { embed });
}
