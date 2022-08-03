import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import do_roles from "../tools/misc/do_role";
import send_help_embed from "../tools/discord/send_help_embed";
import { first } from "../helpers/array_helpers";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";

export default async function ({ discord, db_fns, battles }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    if (first_arg === 'help') {
        return send_help_embed(message, 'Type `.switch <party number>` to switch your active Discomon..', 'switch', discord?.user?.avatarURL());
    }
    const sender = get_discord_sender(message.channel);
    if (!first_arg || Number.isNaN(first_arg)) {
        return sender(`**❌ No party number specified.**`);
    }
    if (message?.member?.id == null) {
        throw new Error("WHY IS message?.member?.id null here??");
    }
    const mon_id = await db_fns.set_active_mon(message.member.id, Number(first_arg));
    if (mon_id == null) {
        return sender(`**❌ You have no Discomon.**`);
    } else {
        await do_roles(message?.member?.id, discord);
        return sender(`**✅ Slot [${ mon_id }] active.**`);
    }
}
