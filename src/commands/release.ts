import { DefaultCommandsReturn } from "./index";
import { Client } from 'discord.js';
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import do_roles from "../tools/misc/do_role";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import { DbDiscomon } from "../scaffold/database_types";
import { ResolvedDbFns } from "../tools/database";


const release_one_discomon = async (
    first_arg: number,
    mons: DbDiscomon[],
    sender: (values: any) => void,
    db_fns: ResolvedDbFns,
    message: MessageNonNull,
    discord: Client
) => {
    const slot = first_arg;
    const mon = mons.filter(x => x.slot === slot)[0];
    if (!mon) {
        return sender(`**❌ You have no Discomon in that slot.**`);
    } else {
        const active = await db_fns.get_active_mon(message.member.id);
        await db_fns.release(mon.id);
        if (active.id === mon.id) {
            await db_fns.set_active_mon(message.member.id, 1);
            await do_roles(message.member.id, discord);
        }
    }

    return sender(`**👋 ${ message.member.displayName } released Discomon in slot [${ first_arg }].**`);
};

const release_all_discomon = async (
    mons: DbDiscomon[],
    sender: (values: any) => void,
    db_fns: ResolvedDbFns,
    message: MessageNonNull
) => {
    for (let mon of mons) {
        await db_fns.release(mon.id);
    }
    return sender(`**👋 ${ message.member.displayName } released all ${ mons.length } of their Discomon.**`);
};

const parse_first_arg = (args: string[]): number | 'all' | 'help' | undefined => {
    const first_arg = first(args);
    const number_first_arg = Number(first_arg);
    if (!first_arg) {
        return;
    } else if (first_arg === "all" || first_arg === "help") {
        return first_arg;
    } else if (!Number.isNaN(number_first_arg)) {
        return number_first_arg;
    } else {
        return;
    }
};

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = parse_first_arg(args);
    if (first_arg === 'help') {
        return send_help_embed(message, 'Type `.release <party number>` to release a Discomon, or `.release all to release all of your Discomon`.\n**IRREVERSIBLE**', 'release', discord.user.avatarURL());
    }
    const sender = get_discord_sender(message.channel);
    if (!await db_fns.has_mon(message.member.id)) {
        return sender(`**❌ You have no Discomon to release.**`);
    }

    if (!first_arg) {
        return sender(`**❌ No mon number specified.**`);
    }
    const mons = await db_fns.get_mons(message.member.id, "party");
    if (mons == null) {
        throw new Error("why is this null?");
    }
    if (mons.length <= 1) {
        return sender(`❌ You can't release your last mon!**`);
    } else if (typeof first_arg === "number") {
        await release_one_discomon(first_arg, mons, sender, db_fns, message as MessageNonNull, discord);
        return true;
    }
    // else if (first_arg === "all") {
    //     return await release_all_discomon(mons, sender, db_fns, message as MessageNonNull);
    // }
}
