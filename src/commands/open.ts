import { ClientOperator } from "../bot-types";
import { DefaultCommandsReturn } from "./index";
import { first, second } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import { GuildMember } from "discord.js";
import { send_lootbox } from "../helpers/lootbox_helpers";

const rune_box_variants = [
    "runebox",
    "runeboxs",
    "runeboxes"
];

const loot_box_variants = [
    "lootbox",
    "lootboxs",
    "lootboxes"
];

export async function new_do({ discord, db_fns, commands }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (!await db_fns.user_exists(message.author.id)) {
        return;
    }
    const sender = get_discord_sender(message.channel);
    if (args.length < 1) {
        return sender(`**❌ No argument specified for what to open!**`);
    }
    const first_arg = first(args);

    if (first_arg === 'help') {
        return send_help_embed(message, 'Type `.open <number lootboxes>` to open a specified number of lootboxes', 'open', discord?.user?.avatarURL());
    }
}

const resolve_second_argument = (first_arg: string | null): 'rune' | 'loot' | undefined => {
    if (!first_arg) {
        return;
    }
    if (rune_box_variants.includes(first_arg.toLowerCase())) {
        return 'rune';
    } else if (loot_box_variants.includes(first_arg.toLowerCase())) {
        return 'loot';
    }
};

const resolve_first_argument = (second_arg: string | null): number | 'all' => {
    if (second_arg) {
        const arg_as_number = Number(second_arg);
        if (!Number.isNaN(arg_as_number)) {
            return arg_as_number;
        }
    }
    return 'all';
};

export default async function ({ discord, db_fns, commands }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (!await db_fns.user_exists(message.author.id)) {
        return;
    }
    const box_type = resolve_second_argument(second(args));
    if (!box_type) {
        return send_help_embed(
            message,
            'Type `.open <number lootboxes/runeboxes or all> <lootbox or runebox>` to open a specified number of lootboxes or runeboxes',
            'open',
            discord?.user?.avatarURL(),
            '.open all lootboxes',
            '.open 5 runeboxes'
        );
    }

    const is_lootbox = box_type === "loot";
    const sender = get_discord_sender(message.channel);
    const inventory = await db_fns.get_inventory(message.member.id);
    if ((is_lootbox && inventory.lootbox < 1) || (!is_lootbox && inventory.runebox < 1)) {
        return sender(`**❌ You have no ${ box_type === "loot" ? "loot" : "rune" }boxes.**`);
    }
    const second_arg = resolve_first_argument(first(args));
    if (
        second_arg !== "all"
        && (
            (is_lootbox && second_arg > inventory.lootbox)
            || (!is_lootbox && second_arg > inventory.runebox)
        )
    ) {
        return sender(`**❌ You have requested ${ second_arg } ${ is_lootbox ? "lootboxes" : "runeboxes" } but only have ${ is_lootbox ? inventory.lootbox : inventory.runebox } available to open!**`);
    }
    const num_iters = second_arg !== "all"
        ? second_arg
        : is_lootbox
            ? inventory.lootbox
            : inventory.runebox;

    const num_items_owned = (await db_fns.get_all_items(message.member.id)).length;
    return await send_lootbox(
        db_fns,
        message.member.id,
        message.channel,
        async () => await db_fns.open_many_lootboxes(
            db_fns,
            message.member as GuildMember,
            message.channel,
            !is_lootbox,
            num_iters,
            num_items_owned
        ),
        !is_lootbox,
        message.member.displayName
    );
}
