import { get_premium_tier } from "../tools/misc/premium_tiers";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import { first, second } from "../helpers/array_helpers";
import { ClientOperator } from "../bot-types";
import { DefaultCommandsReturn } from "./index";
import { alpha_breed } from "../tools/discomon/alpha_seed";
import send_breed from "../tools/discord/send_breed";


export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (args[0] === 'help') {
        return send_help_embed(
            message,
            'Type `.breed <first parent discomon slot number> <second parent discomon slot number>` to breed two discomon. Both parents must be chipped and you must have at least 1 DNA',
            'breed',
            discord.user.avatarURL(),
            `.breed 1 2`
        );
    }


    if (!await db_fns.user_exists(message.member.id) || !await db_fns.has_mon(message.member.id)) {
        return;
    }

    const sender = get_discord_sender(message.channel);

    const eggs = await db_fns.get_eggs(message?.member?.id);
    const premium = await db_fns.get_premium(message.member.id);
    const { egg_slots } = get_premium_tier(premium);
    if (eggs && eggs.length > egg_slots) {
        return sender(`**❌ Not enough egg slots.**`);
    }

    const first_arg = first(args);
    if (!first_arg || Number.isNaN(first_arg)) {
        return sender(`**❌ No first parent specified.**`);
    }
    const second_arg = second(args);
    if (!second_arg || Number.isNaN(second_arg)) {
        return sender(`**❌ No second parent specified.**`);
    }
    const p1_slot = Number(args[0]);
    const p2_slot = Number(args[1]);
    const party = await db_fns.get_mons(message.member.id, "party");
    const p1 = first(party.filter(x => x.slot === p1_slot));
    const p2 = first(party.filter(x => x.slot === p2_slot));
    if (!p1 || !p2) {
        return sender(`**❌ No Discomon in one or more of those slots.**`);
    }
    // const p1 = party.filter(x => x.slot === p1_slot)[0];
    // const p2 = party.filter(x => x.slot === p2_slot)[0];
    const mon1_chipped = await db_fns.mon_in_dex(p1.seed);
    const mon2_chipped = await db_fns.mon_in_dex(p2.seed);
    if (!mon1_chipped || !mon2_chipped) {
        return sender(`**❌ One or more of those Discomon are not chipped.**`);
    }
    const inv = await db_fns.get_inventory(message.member.id);
    if (!inv.dna) {
        return sender(`**❌ No DNA. type .buy to get DNA.**`);
    }
    const breed_seed = Date.now();
    const offspring = alpha_breed(p1.seed, p2.seed, breed_seed);
    await db_fns.new_egg(message.member.id, offspring, p1.seed, p2.seed, breed_seed);
    await db_fns.increment_inventory(message.member.id, 'dna', -1);
    return send_breed(message.member, offspring, p1, p2, message);
}
