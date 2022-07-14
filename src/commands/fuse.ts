import { DefaultCommandsReturn } from "./index";
import { MessageEmbed, MessageReaction, User } from 'discord.js';
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import avg_hue from "../../designing/avg_hue";
import { get_image_rune } from "../../designing/runes/get_rune";
import get_formatted_hsl from "../../designing/helpers/discomon_helpers";
import rune_fuse_image from "../../designing/images/rune_fuse_image";

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

    const db_runes = await db_fns.get_all_runes(message.member.id);
    const r1 = db_runes[Number(args[0]) - 1];
    const r2 = db_runes[Number(args[1]) - 1];

    if (!r1 || !r2) {
        return sender(`**❌ You have no runes in one or both of those slots.**`);
    }

    const new_db_rune = {
        seed: `${ Math.floor((r1.seed + r2.seed) / 2) + 1 }:0`,
        hue: avg_hue([ r1.hue, r2.hue ])
    };
    const image_runes = [ r1, r2, new_db_rune ].map(x => get_image_rune(x));

    const image = await rune_fuse_image(image_runes);
    const filename = `${ Date.now() }.png`;
    const embed = new MessageEmbed()
        .setTitle(`Do you want to make this rune?`)
        .attachFiles([ { 'name': filename, 'attachment': image } ])
        .setColor(get_formatted_hsl(image_runes[2].colour))
        .setImage(`attachment://${ filename }`);
    return message.channel.send({ embed }).then(sent_message => {
        sent_message.react('✅');
        sent_message.react('❌️');

        const filter = (reaction: MessageReaction, user: User) => {
            return (reaction.emoji.name === '✅️' || reaction.emoji.name === '❌️') && user.id === message?.member?.id;
        };
        const collector = sent_message.createReactionCollector(filter, { time: 30000 });

        collector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '✅️') {
                await db_fns.fuse_runes([ r1, r2 ], new_db_rune, message.member.id);
                return await sent_message.edit(`✅️ **Runes fused.**`);
            }
            if (reaction.emoji.name === '❌️') {
                return await sent_message.edit(`❌ **Fusion cancelled.**`);
            }
        });
    }).catch(err => console.log(err));
}

