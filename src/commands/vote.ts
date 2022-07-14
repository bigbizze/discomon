import { Message } from 'discord.js';
import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { send_to_discord } from "../helpers/discomon_helpers";

export default async function (client: ClientOperator, message: Message): Promise<DefaultCommandsReturn> {
    return send_to_discord(message.channel, 'https://top.gg/bot/692993785508003860/vote');
}
