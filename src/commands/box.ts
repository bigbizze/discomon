import { ClientOperator } from "../bot-types";
import { DefaultCommandsReturn } from "./index";
import {
    get_discord_sender,
    item_array_from_party,
    map_db_mon_to_party,
    MessageNonNull
} from "../helpers/discomon_helpers";
import { first } from "../helpers/array_helpers";
import { get_premium_tier } from "../tools/misc/premium_tiers";
import icon_manager from "../icon-manager";
import send_player_boxes from "../tools/discord/send_player_boxes";
import send_help_embed from "../tools/discord/send_help_embed";


const resolve_args = (first_arg?: number): number | undefined => {
    if (first_arg && !Number.isNaN(first_arg)) {
        return Math.round(first_arg);
    }
};

const display_active_box = async (user_id: string, client: ClientOperator, message: MessageNonNull, boxes_allowed: number, _box_number?: number) => {
    const box_number = !_box_number ? await client.db_fns.get_box_active(user_id) : _box_number;
    const box_mons = await client.db_fns.get_mons(user_id, 'box', box_number);
    const box_party = await map_db_mon_to_party(box_mons, 6);
    const box_items = await item_array_from_party(box_party);
    return send_player_boxes(message.member, box_party, message, box_items, 6, boxes_allowed, box_number);
};

export default async function (client: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const first_arg = first(args);
    const sender = get_discord_sender(message.channel);
    if (first_arg === "help") {
        return send_help_embed(message, `\`.box <no argument shows current active box, number switches active box>\``, 'box', null,
            "\`.box\`",
            "\`.box 5\`"
        );
    }
    const box_number = resolve_args(Number(first_arg));
    const premium = await client.db_fns.get_premium(message.member.id);
    const { boxes_allowed } = get_premium_tier(premium);
    if (!box_number) {
        return await display_active_box(message.member.id, client, message, boxes_allowed);
    }
    if (box_number > boxes_allowed) {
        return sender(`**${ icon_manager("error") } You don't have that many boxes. Support us on Patreon to unlock more.** \`.patreon\``);
    }
    if (box_number < 1) {
        return sender(`**${ icon_manager("error") } You don't have a box with that number.**`);
    }
    await client.db_fns.set_active_box(message.member.id, box_number);
    await display_active_box(message.member.id, client, message, boxes_allowed, box_number);
}
