import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Type `.tag <nickname>` to give your active Discomon a nickname!\nRequires tags.', 'tag', discord?.user?.avatarURL());
    }

    if (!await db_fns.user_exists(message?.member?.id)) {
        return;
    }
    const sender = get_discord_sender(message.channel);
    if (!await db_fns.has_mon(message?.member?.id)) {
        return sender(`**❌ You don't have any Discomon.**`);
    }
    if (!args) {
        return sender(`**❌ No nickname specified.**`);
    }
    const newnick = args.join(' ');
    if (!/^[A-Za-z0-9 _]*$/.test(newnick) || newnick.length > 15) {
        return sender(`**❌ Letters, spaces, numbers | < 15 characters.**`);
    }
    if (message?.member?.id == null) {
        throw new Error("WHY IS message?.member?.id null here??");
    }
    const inventory = await db_fns.get_inventory(message.member.id);
    if (inventory == null) {
        return sender(`**Couldn't find inventory!**`);
    }
    if (inventory.tag < 1) {
        return sender(`**❌ You don't have any tags.**`);
    }
    const mon = await db_fns.get_active_mon(message.member.id);
    if (mon == null) {
        return sender("couldn't find discomon!");
    }
    const nick = mon.nickname;
    await db_fns.increment_inventory(message?.member?.id, 'tag', (-1));
    await db_fns.set_mon_value(mon?.id, 'nickname', newnick);

    return sender(`**🐾 ${ nick } is now called ${ newnick }!**`);
}

