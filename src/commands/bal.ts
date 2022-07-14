import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import send_player_profile from "../tools/discord/send_player_profile";

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull): Promise<DefaultCommandsReturn> {
    if (!await db_fns.user_exists(message.member.id)) {
        return send_to_discord(message.channel, '❌ `you are not .hatched`');
    }
    const query = await db_fns.get_profile_stats(message.member.id);
    if (!query) {
        return console.log(`something went wrong with .bal`);
    }
    return await send_player_profile(message, query, message.member, message.author.avatarURL(), "bal");
}
