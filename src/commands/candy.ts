import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import {
    calculate_level,
    calculate_xp_to_next_level,
    get_discord_sender,
    MessageNonNull
} from "../helpers/discomon_helpers";
import { first } from "../helpers/array_helpers";
import do_roles from "../tools/misc/do_role";
import send_help_embed from "../tools/discord/send_help_embed";

const resolve_amount = (inventory_candies: number, first_arg: null | number | "all" | string): number => {
    const num_first_arg = Number(first_arg);
    if (first_arg && !Number.isNaN(num_first_arg)) {
        if (num_first_arg <= inventory_candies) {
            return num_first_arg;
        }
        return inventory_candies;
    } else if (first_arg === "all") {
        return inventory_candies;
    }
    return 1;
};

export default async function ({ discord, db_fns }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    if (first_arg === 'help') {
        return send_help_embed(message, 'Type `.candy <value (optional) or all>` to give candy to your active Discomon.', 'candy', discord.user.avatarURL());
    }

    if (!await db_fns.user_exists(message.member.id) || !await db_fns.has_mon(message.member.id)) {
        return;
    }

    const sender = get_discord_sender(message.channel);
    const inventory = await db_fns.get_inventory(message.member.id);
    if (inventory == null || !inventory?.candy) {
        return sender(`**❌ You don't have enough candies.**`);
    }
    const amount = resolve_amount(inventory.candy, first_arg);
    if (amount > inventory.candy) {
        return sender(`**❌ You don't have enough candies.**`);
    }
    const xp = 10 * amount;
    const mon_props = await db_fns.get_active_mon(message.member.id);
    if (mon_props == null) {
        return sender(`**Could not find Discomon!**`);
    }
    const level = calculate_level(mon_props.experience);
    if (level >= 18) {
        return sender(`**❌ That Discomon is max level.**`);
    }
    await db_fns.increment_inventory(message.member.id, 'candy', (-amount));
    await db_fns.increment_mon(mon_props.id, 'experience', xp);
    if (mon_props.experience + xp >= calculate_xp_to_next_level(level)) {
        await do_roles(message.member.id, discord);
    }
    return sender(`**🍬 Gave ${ amount } candies to active Discomon.**`);
}
