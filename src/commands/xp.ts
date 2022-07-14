import { DefaultCommandsReturn } from "./index";
import { Message } from 'discord.js';
import { ClientOperator } from "../bot-types";
import {
    calculate_level,
    calculate_xp_to_next_level,
    get_discord_sender,
    send_to_discord
} from "../helpers/discomon_helpers";

export default async function ({ discord, db_fns }: ClientOperator, message: Message): Promise<DefaultCommandsReturn> {
    const sender = get_discord_sender(message.channel);
    if (!await db_fns.user_exists(message.member?.id) || !await db_fns.has_mon(message.member?.id)) {
        return sender(`**❌ You have no Discomon**`);
    }
    if (message?.member?.id == null) {
        throw new Error("WHY IS message?.member?.id null here??");
    }
    const mon = await db_fns.get_active_mon(message.member.id);
    if (mon == null) {
        return sender(`**Could not find Discomon!**`);
    }
    const xp = mon.experience >= 3212 ? 'MAX' : mon.experience;
    const next = mon.experience >= 3212 ? 'MAX' : calculate_xp_to_next_level(calculate_level(mon.experience));
    return send_to_discord(message.channel, `**🧬 ${ message?.member?.displayName }: ${ xp } / ${ next }**`);
}
