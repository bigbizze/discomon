import { MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";
import { MessageEmbed } from "discord.js";
import cs from '../discomon/image-generator/color_schemes';
import { first } from "../../helpers/array_helpers";

export default function <C>(message: MessageNonNull, content: C, command: string, image_url?: string | null, ...examples: string[]) {
    const embed = new MessageEmbed()
        .setColor(cs.embed)
        .setTitle(`.${ command }`);
    if (image_url) {
        embed.setAuthor('Command Help', image_url);
    }
    embed.addField('Usage', content);
    if (examples && examples.length > 0) {
        if (examples.length === 1) {
            embed.addField('Example', '`' + first(examples) + '`');
        } else {
            const examples_parsed = examples.reduce((x: string, y: string) => {
                return x + '`' + y + '`\n';
            }, '');
            // const examples_parsed = examples.map(i => '`' + i + '`').join('\n');
            embed.addField(`Examples`, examples_parsed);
        }
    }
    return send_to_discord(
        message.channel,
        embed
    );
}
