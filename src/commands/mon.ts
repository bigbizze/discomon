import { DefaultCommandsReturn } from "./index";
import { GuildMember } from 'discord.js';
import { ClientOperator } from "../bot-types";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import { first } from "../helpers/array_helpers";
import { DbDiscomon, DbItem } from "../scaffold/database_types";
import send_mon_profile from "../tools/discord/send_mon_profile";
import { ResolvedDbFns } from "../tools/database";

interface RegularMon {
    db_mon: DbDiscomon;
    user: GuildMember;
    items: DbItem[];
}

const get_at_index = async (db_fns: ResolvedDbFns, message: MessageNonNull, index: number, user: GuildMember) => {
    const mons = await db_fns.get_mons(user.id, "party");
    return first(mons.filter(x => x.slot === index));
};

const regular_mon = async (first_arg: string | null, {
    discord,
    db_fns
}: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<RegularMon | void> => {
    const sender = get_discord_sender(message.channel);
    const user = message.mentions.members.first()
        ? message.mentions.members.first()
        : message.member;
    if (user?.id == null || !await db_fns.user_exists(user.id)) {
        return sender(`**❌ User has no Discomon.**`);
    }
    if (!await db_fns.has_mon(user.id)) {
        return sender(`**❌ User has no Discomon.**`);
    }
    const index = args[1] && !Number.isNaN(args[1])
        ? Number(args[1])
        : args[0] && !Number.isNaN(first_arg)
            ? Number(first_arg)
            : null;
    const db_mon = index ? await get_at_index(db_fns, message, index, user) : await db_fns.get_active_mon(user.id);
    if (!db_mon) {
        return sender(`**❌ No such Discomon.**`);
    }
    const items = await db_fns.get_mon_active_items(db_mon.id);
    return { db_mon, user, items };
};

export default async function (client: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    if (first_arg === 'help') {
        return send_help_embed(
            message,
            'Get mon profiles.\nType `.mon` to see your active Discomon.\n'
            + 'Type `.mon <number>` to call a profile from your `.party`.\n'
            + 'Type `.mon @user` to see their active Discomon, or `.mon @user <number>` to see a Discomon in their party.',
            'mon',
            client.discord.user.avatarURL()
        );
    }
    if (first_arg != null && first_arg === 'boss') {
        return;
    }
    const regular_mon_result = await regular_mon(first_arg, client, message, ...args);
    if (regular_mon_result == null) {
        return;
    }
    const { db_mon, user, items } = regular_mon_result;
    await send_mon_profile(db_mon, user, items, message);
}
