import { ClientOperator } from "../bot-types";
import { DefaultCommandsReturn } from "./index";
import cs from "../tools/discomon/image-generator/color_schemes";
import { send_to_discord } from "../helpers/discomon_helpers";
import { Message, MessageEmbed } from "discord.js";

export default async function ({ discord }: ClientOperator, message: Message): Promise<DefaultCommandsReturn> {
    const avatar_url = discord?.user?.avatarURL();
    const embed = new MessageEmbed()
        .setColor(cs.embed)
        .setTitle('**Join Support Server**')
        .setURL('https://discord.gg/DMpG2qz')
        .setAuthor('Discomon Help');

    if (avatar_url != null) {
        embed.setAuthor('Discomon Help', avatar_url);
    }
    embed.addField('Embed tutorial', '`.commands` or `.tutorial`');
    embed.addField('Tutorial', '[Click here.](https://discomon.io/tutorial)');
    embed.addField('Add Bot', '[Click here.](https://discord.com/oauth2/authorize?client_id=692993785508003860&permissions=519232&scope=bot)');
    return send_to_discord(message.channel, { embed });
}
