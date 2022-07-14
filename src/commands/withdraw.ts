import { ClientOperator } from "../bot-types";
import { get_discord_sender, get_open_slot, MessageNonNull } from "../helpers/discomon_helpers";
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
};

export default async function (client: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    const sender = get_discord_sender(message.channel);
    if (first_arg === "help") {
        return send_help_embed(message, `\`.withdraw <active box slot>\``, 'withdraw', null,
            "\`.withdraw 5\`"
        );
    }
    const box_slot = resolve_args(...args);
    if (!box_slot) {
        return;
    }
    const mons = await client.db_fns.get_mons(message.member.id, "party");
    if (mons.length === 3) {
        return sender(`**${ icon_manager("error") } You have no free space in your party!**`);
    }
    const box_number = await client.db_fns.get_box_active(message.member.id);
    const box_mon = await client.db_fns.get_mon_at_slot(message.member.id, "box", box_slot, box_number);
    if (!box_mon) {
        return sender(`**${ icon_manager("error") } This slot in your active box is empty.**`);
    }
    const open_party_slot = await get_open_slot(client.db_fns, message, "party");
    if (open_party_slot == null) {
        return;
    }
    await client.db_fns.set_mon_value(box_mon.id, "box", null);
    await client.db_fns.set_mon_value(box_mon.id, "slot", open_party_slot);
    return sender(`**Discomon in box slot [${ box_slot }] has been withdrawn into party slot [${ open_party_slot }]**`);
}
