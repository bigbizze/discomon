import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import do_roles from "../tools/misc/do_role";
import { random } from "../helpers/rng_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import send_mon_profile from "../tools/discord/send_mon_profile";
import { get_discord_sender, get_open_slot, MessageNonNull } from "../helpers/discomon_helpers";
import { DbEgg } from "../scaffold/database_types";
import { get_premium_tier } from "../tools/misc/premium_tiers";
import { get_alpha_from_seed } from "../tools/discomon/alpha_seed/utils";
import { ResolvedDbFns } from "../tools/database";
import { MessageEmbed } from "discord.js";
import { logo } from "../helpers/general_helpers";


// type Hatch = (user_id: string, seed: string, egg_id: number) => Promise<number[] | void>;
const get_hatch_id = async (message: MessageNonNull, the_egg: DbEgg): Promise<string> => {
    if (the_egg.type === 'standard') {
        const the_seed = random(1, 16777216);
        return get_alpha_from_seed(the_seed);
    }
    return the_egg.type;
};

/**
 * @return boolean returns true if user has supplied active argument to hatch command denoting that they'd
 *                  like their hatched mon to be set to their active one.
 */
const should_set_hatched_mon_as_active = (arg: string | null): boolean => {
    return !(!arg || arg !== "active");
};

async function hatch(
    user_id: string,
    db_fns: ResolvedDbFns,
    message: MessageNonNull,
    seed: string,
    egg_id: number,
    set_active: boolean
) {
    const open_party_slot = await get_open_slot(db_fns, message, "party");
    if (open_party_slot == null) {
        return;
    }
    const this_id = await db_fns.new_mon(user_id, seed, egg_id);
    await db_fns.set_mon_value(this_id, "slot", open_party_slot);
    await db_fns.set_mon_value(this_id, "box", null);
    if (!set_active) {
        const has_mon = await db_fns.has_mon(user_id);
        if (!has_mon) {
            await db_fns.set_active_mon(user_id, 1);
        }
    } else {
        await db_fns.set_active_mon(user_id, open_party_slot);
    }
    return [ this_id, open_party_slot ];
}

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    if (first_arg === 'help') {
        return send_help_embed(
            message,
            `
Type \`.hatch\` to hatch the egg in your first egg slot.
Type \`.hatch <slot number>\` to hatch a specific egg from your .eggs slots.
Type \`.hatch active\` to hatch your first egg and set it to your active mon.`.trimLeft(),
            'hatch',
            discord.user.avatarURL()
        );
    }
    const user_exists = await db_fns.user_exists(message.member.id);
    const sender = get_discord_sender(message.channel);
    if (!user_exists) {
        sender(new MessageEmbed()
            .setTitle("Welcome to Discomon!")
            .setAuthor(message.member.displayName, logo)
            .setDescription(`
Type \`.quests\` to begin your journey.

Type \`.help\` to get general help, or follow any command with help (as in \`.battle help\`) to receive help for any command.

Type \`.battle\` to battle against players from any server playing Discomon.`.trimLeft())
        );
        await db_fns.create_user(message?.member?.id);
    }
    const user_premium = await db_fns.get_premium(message.member.id);
    const users_eggs = await db_fns.get_eggs(message.member.id);
    const users_party = await db_fns.get_mons(message.member.id, "party");
    if (users_eggs.length === 0) {
        return sender(`**❌ You have no eggs.**`);
    }
    const { party_slots } = get_premium_tier(user_premium);
    if (users_party != null && users_party.length >= party_slots) {
        return sender(`**❌ You can't hatch any more Discomon. Sacrifice or deposit some first.**`);
    }
    const numbered_first_arg = Number(first_arg);
    const the_egg = first_arg && !Number.isNaN(numbered_first_arg) && users_eggs[numbered_first_arg - 1]
        ? users_eggs[numbered_first_arg - 1]
        : users_eggs[0];
    const set_active = should_set_hatched_mon_as_active(first_arg) || !user_exists;
    const seed = await get_hatch_id(message, the_egg);
    const hatch_id_and_slot = await hatch(message.member.id, db_fns, message, seed, the_egg.id, set_active);
    if (!hatch_id_and_slot) {
        return;
    }
    const [ hatch_id, slot ] = hatch_id_and_slot;
    // generate unique discomon id
    await do_roles(message.member.id, discord);
    const db_mon = await db_fns.get_mon(hatch_id);
    sender(`**🥚 ${ message?.member?.displayName } hatched a new Discomon!${ !set_active ? "" : `\n✅ slot [${ slot }] active.` }**`);
    send_mon_profile(db_mon, message.member, [], message);
    return true;
}

