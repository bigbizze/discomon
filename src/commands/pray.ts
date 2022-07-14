import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { chance, random } from "../helpers/rng_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { get_discord_sender, MessageNonNull, SenderType } from "../helpers/discomon_helpers";
import { first } from "../helpers/array_helpers";
import { get_premium_tier } from "../tools/misc/premium_tiers";
import { ResolvedDbFns } from "../tools/database";
import icon_manager from "../icon-manager";
import { build_embed } from "../helpers/embed_helpers";
import { PatreonTiers } from "../patreon-dbl-server";

const is_valid_request = async (sender: SenderType<string>, db_fns: ResolvedDbFns, message: MessageNonNull): Promise<void | true> => {
    if (!await db_fns.user_exists(message.author.id)) {
        return sender(`**${ icon_manager("error") } .hatch a Discomon first.**`);
    }
    if (!await db_fns.has_mon(message.author.id)) {
        return sender(`**${ icon_manager("error") } .hatch a Discomon first.**`);
    }
    if (await db_fns.pray_cooldown(message.author.id)) {
        return sender(`**${ icon_manager("wait") } ${ await db_fns.next_pray(message.author.id) } minutes until the gods will listen.**`);
    }
    if (await db_fns.has_shield(message.author.id)) {
        sender(`**${ message.member.displayName } broke their shield!**`);
        await db_fns.set_inventory_value(message.author.id, 'shield', 0);
    }
    return true;
};

const do_fields = (display_name: string, user_premium: PatreonTiers) => {
    let fields: string[] = [];
    return {
        add_field: (field: string) => {
            fields = [
                ...fields,
                field
            ];
        },
        to_discord: () => ({
            title: `${ display_name } prayed!`,
            fields: [ { title: 'The gods respond with:', content: fields.join("\n") } ],
            footer: `Patreon multiplier: ${ user_premium }`
        })
    };
};

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (first(args) === 'help') {
        return send_help_embed(message, 'Type `.pray` every half hour to receive a gift from the heavens.', 'pray', discord.user.avatarURL());
    }
    const sender = get_discord_sender(message.channel);
    if (!await is_valid_request(sender, db_fns, message)) {
        return;
    }
    const user_premium = await db_fns.get_premium(message.member.id);
    const {
        vote_credit_multiplier,
        candies_from_pray,
        lootbox_from_praying_multiplier,
        egg_from_praying_multiplier
    } = get_premium_tier(user_premium);
    const field_builder = do_fields(message.member.displayName, user_premium);
    const boss_alive = await db_fns.is_boss_alive();
    const boss_dead_multiplier = boss_alive ? 1 : 2;
    await db_fns.set_player_value(message.author.id, 'last_pray', Date.now());
    if (chance(0.5, egg_from_praying_multiplier)) {
        await db_fns.new_egg(message.author.id, 'standard', null, null, Date.now());
        field_builder.add_field(`***${ icon_manager("egg") }Eggs: 1***`);
    }
    if (candies_from_pray > 0) {
        await db_fns.increment_inventory(message.member.id, "candy", candies_from_pray);
        field_builder.add_field(`***${ icon_manager("candy") }Candy: ${ candies_from_pray }***`);
    }
    if (chance(1)) {
        const amount = Math.round(random(150, 300) * boss_dead_multiplier * vote_credit_multiplier);
        await db_fns.increment_inventory(message.author.id, 'credits', amount);
        field_builder.add_field(`***${ icon_manager("credits") }Credits: ${ amount }***`);
    } else if (chance(5, lootbox_from_praying_multiplier)) {
        await db_fns.increment_inventory(message.member.id, 'lootbox', boss_dead_multiplier);
        field_builder.add_field(`***${ icon_manager("lootbox") }Lootbox: 1***`);
    } else if (chance(10)) {
        const d_amount = Math.round(4 * boss_dead_multiplier * vote_credit_multiplier);
        await db_fns.increment_inventory(message.member.id, 'dust', d_amount);
        field_builder.add_field(`***${ icon_manager("dust") }Dust: ${ d_amount }***`);
    } else {
        const amount = Math.round(random(40, 70) * boss_dead_multiplier * vote_credit_multiplier);
        await db_fns.increment_inventory(message.author.id, 'credits', amount);
        field_builder.add_field(`***${ icon_manager("credits") }Credits: ${ amount }***`);
    }
    field_builder.add_field(`\n***Runeterror multiplier: ${ boss_alive ? 'none' : 'x2' }***\n${ boss_alive ? 'Pray rewards are doubled when the Runeterror is dead.\nType .battle runeterror to battle the runeterror.' : '' }`);
    sender(build_embed(field_builder.to_discord(), false));
    return true;
}

