import { ClientOperator } from "../bot-types";
import { MessageNonNull } from "../helpers/discomon_helpers";
import { DefaultCommandsReturn } from "./index";
import { MessageEmbed } from "discord.js";

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull): Promise<DefaultCommandsReturn> {
    const patron_embed = new MessageEmbed()
        .setDescription("[Support us on Patreon](https://www.patreon.com/discomon) to unlock premium user perks & features!")
        .setImage("https://i.imgur.com/HowuIVw.png");
    // .setDescription("https://www.patreon.com/discomon");
    await message.channel.send(patron_embed);
}
