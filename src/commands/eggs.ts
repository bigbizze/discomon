import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import send_help_embed from "../tools/discord/send_help_embed";
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import { first } from "../helpers/array_helpers";
import send_player_eggs from "../tools/discord/send_player_eggs";
import { get_premium_tier } from "../tools/misc/premium_tiers";

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Get egg inventory.\nType `.eggs` to see your inventory.\n', 'party', discord.user.avatarURL());
    }
    const the_user = message.member;

    if (!await db_fns.user_exists(the_user?.id)) {
        return send_to_discord(message.channel, `**❌ .hatch to start playing.**`);
    }
    const eggs = await db_fns.get_eggs(message.member.id);
    if (eggs.length === 0) {
        return send_to_discord(message.channel, `**❌ You have no eggs.**`);
    }

    if (the_user?.id == null) {
        throw new Error("ERROR IN party.ts, why was the_user.id null??");
    }
    const user_premium = await db_fns.get_premium(the_user.id);
    const { egg_slots } = get_premium_tier(user_premium);

    await send_player_eggs(the_user, eggs, message, egg_slots);
}
