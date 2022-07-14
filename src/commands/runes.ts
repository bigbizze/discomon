import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import send_player_items from "../tools/discord/send_player_items";
import { check_message_props_not_null, get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Type `.runes` to see your runes and their numbers.', 'runes', discord.user.avatarURL());
    }

    if (!await db_fns.user_exists(message.member.id)) {
        return;
    }
    const sender = get_discord_sender(message.channel);
    const items = await db_fns.get_all_items(message.member.id);
    if (!items) {
        return sender(`**❌ You have no runes.**`);
    }
    const message_maybe_null = check_message_props_not_null(message);
    if (message_maybe_null == null) {
        return sender('**We had an issue with this guild!**');

    }
    return send_player_items(
        message_maybe_null,
        items,
        message.member
    );
}
