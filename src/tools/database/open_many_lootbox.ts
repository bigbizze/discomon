import { ResolvedDbFns } from "./index";
import { DMChannel, GuildMember, NewsChannel, TextChannel } from "discord.js";
import { OpenLootbox, OpenLootboxResults } from "../../helpers/lootbox_helpers";

const _open_many_lootboxes = async (
    next: (l: OpenLootbox) => Promise<OpenLootbox>,
    num_iters: number,
    lootbox_args: Omit<OpenLootboxResults, 'num_requested'>
): Promise<Omit<OpenLootboxResults, 'num_requested'>> => {
    if (lootbox_args.num_opened === num_iters || lootbox_args.open_lootbox.should_end) {
        return lootbox_args;
    }
    const next_lootbox_result = await next(lootbox_args.open_lootbox);
    return await _open_many_lootboxes(next, num_iters, {
        open_lootbox: next_lootbox_result,
        num_opened: lootbox_args.num_opened + 1
    });
};

export default function open_many_lootboxes() {
    return async (
        db_fns: ResolvedDbFns,
        user: GuildMember,
        channel: TextChannel | DMChannel | NewsChannel,
        boss: boolean,
        num_iters: number,
        num_items_owned: number
    ): Promise<OpenLootboxResults> => {
        const results = await _open_many_lootboxes((l: OpenLootbox) => db_fns.open_lootbox(user, channel, boss, l, num_items_owned, num_iters), num_iters, {
            open_lootbox: {
                colour: "",
                should_end: false,
                highest_rarity: 0
            },
            num_opened: 0
        });
        return {
            ...results,
            num_requested: num_iters
        };
    };
}
