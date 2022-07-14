import { ClientOperator } from "../bot-types";
import {
    get_discord_sender,
    get_mon_by_slot,
    get_mon_in_other_slots_by_id,
    get_open_slot,
    MessageNonNull
} from "../helpers/discomon_helpers";
import { DefaultCommandsReturn } from "./index";
import { first } from "../helpers/array_helpers";
import icon_manager from "../icon-manager";
import send_help_embed from "../tools/discord/send_help_embed";

const resolve_arg = (arg?: number): number | undefined => {
    const first_arg = Number(arg);
    if (first_arg && !Number.isNaN(first_arg)) {
        return first_arg;
    }
};

const resolve_args = (...args: string[]): number | undefined => {
    const first_arg = resolve_arg(Number(first(args)));
    if (first_arg != null) {
        return first_arg;
    }
    // const second_arg = resolve_arg(Number(second(args)));
    // if (second_arg == null) {
    //     return;
    // }
    // return [ first_arg, second_arg ];
};

export default async function (client: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    const sender = get_discord_sender(message.channel);
    if (first_arg === "help") {
        return send_help_embed(message, `\`.deposit <party slot>\``, 'deposit', null,
            "\`.deposit 2\`"
        );
    }
    const party_slot = resolve_args(...args);
    if (!party_slot) {
        return;
    }
    const mons = await client.db_fns.get_mons(message.member.id, "party");
    if (mons.length < 2) {
        return sender(`**${ icon_manager("error") } You would have no mons in your party!**`);
    }
    const mon = get_mon_by_slot(mons, party_slot);
    if (!mon) {
        return sender(`**${ icon_manager("error") } This slot in your party is empty.**`);
    }
    const active_mon = await client.db_fns.get_active_mon(message.member.id);
    if (active_mon.id === mon.id) {
        const first_other = get_mon_in_other_slots_by_id(mons, mon.id);
        if (!first_other || !first_other.slot) {
            return sender(`**${ icon_manager("error") } You would have no active Discomon!**`);
        }
        await client.db_fns.set_active_mon(message.member.id, first_other.slot);
    }

    const box_number = await client.db_fns.get_box_active(message.member.id);
    const box_slot = await get_open_slot(client.db_fns, message, "box", box_number);
    if (box_slot == null) {
        return;
    }
    await client.db_fns.set_mon_value(mon.id, "box", box_number);
    await client.db_fns.set_mon_value(mon.id, "slot", box_slot);
    return sender(`**Discomon in party slot #${ party_slot } has been deposited into active box slot #${ box_slot }.**`);
}
