import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import send_help_embed from "../tools/discord/send_help_embed";
import {
    item_array_from_party,
    map_db_mon_to_party,
    MessageNonNull,
    send_to_discord
} from "../helpers/discomon_helpers";
import { first } from "../helpers/array_helpers";
import send_party_profile from "../tools/discord/send_party_profile";
import { get_premium_tier } from "../tools/misc/premium_tiers";

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Get Discomon party.\nType `.party` to see your party.\n'
            + 'Type `.party @user` to see their party.', 'party', discord.user.avatarURL());
    }
    const the_user = message?.mentions?.members?.first() != null
        ? message.mentions.members.first()
        : message.member;

    if (!await db_fns.user_exists(the_user?.id)) {
        return send_to_discord(message.channel, '❌`user has no Discomon.`');
    }
    if (!await db_fns.has_mon(the_user?.id)) {
        return send_to_discord(message.channel, '❌`user has no Discomon.`');
    }
    if (the_user?.id == null) {
        throw new Error("ERROR IN party.ts, why was the_user.id null??");
    }
    const user_premium = await db_fns.get_premium(the_user.id);
    const { party_slots } = get_premium_tier(user_premium);
    const db_party = await db_fns.get_mons(the_user.id, "party");
    if (!db_party) {
        throw new Error("No party for some reason");
    }
    const party_mon = map_db_mon_to_party(db_party, party_slots);
    const active_mon = await db_fns.get_active_mon(the_user.id);
    const active_slot = active_mon.slot;
    if (!active_slot) {
        return;
    }
    const items = await item_array_from_party(party_mon);
    send_party_profile(the_user, party_mon, message, items, party_slots, active_slot);
}
