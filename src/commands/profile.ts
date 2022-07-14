import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import send_player_profile from "../tools/discord/send_player_profile";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Get player profiles.\nType `.profile` to see your profile.\n'
            + 'Type `.profile @user` to call someone else\'s profile.', 'profile', discord?.user?.avatarURL());
    }
    const image = !message?.mentions?.members?.first() ? message?.author?.avatarURL() : message?.mentions?.users?.first()?.avatarURL();
    const the_user = !message?.mentions?.members?.first() ? message?.member : message?.mentions?.members?.first();
    const sender = get_discord_sender(message.channel);
    if (!await db_fns.user_exists(the_user?.id)) {
        return sender(`**❌ User is not playing.**`);
    }
    // console.log(`${ date_string() } - ${ message?.member?.displayName } requested a profile!`);
    const stats = await db_fns.get_profile_stats(the_user?.id);
    if (stats == null) {
        throw new Error("why is stats null here?");
    }
    return await send_player_profile(message, stats, the_user, image, "stats");
}
