import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { calculate_level, get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import { before_battle, do_image_embed_on_battle_end, do_regular_battle, PlayerBattle } from "./battle";
import { get_battle_player } from "./battle/resolvers";
import { clamp } from "../tools/discomon/image-generator/utils";
import { random } from "../helpers/rng_helpers";
import { ResolvedDbFns } from '../tools/database/index';
import { BattleEndState } from "../tools/battles";
import { DecrementFn } from "../tools/client/battle-trackers";
import { GuildMember } from "discord.js";
import { DbDiscomon } from "../scaffold/database_types";
import { get_alpha_from_seed } from "../tools/discomon/alpha_seed/utils";

const get_generated_defender = (attacker_experience: number): PlayerBattle => {
    const the_seed = random(1, 16777216);
    const seed = get_alpha_from_seed(the_seed);
    return {
        id: "test_dummy",
        active_mon: 0,
        display_name: "Discomon",
        last_battle: 0,
        last_pray: 0,
        mon: {
            id: 1198,
            alive: true,
            boss_damage: 0,
            boss_kills: 0,
            date_hatched: 0,
            experience: attacker_experience,
            item_id: 0,
            kills: 0,
            level: clamp(calculate_level(attacker_experience), 1, 18),
            losses: 0,
            modifiers: [],
            nickname: "Untamed",
            owner: "",
            seed,
            wins: 0
        },
        nickname: "Untamed",
        premium: 0,
        premium_date: 0,
        registered: 0,
        active_box: 0
    };
};

const get_defender_from_db = async (db_fns: ResolvedDbFns, attacker_experience: number): Promise<PlayerBattle> => {
    const dex = await db_fns.get_dex_entries("random");
    const index = random(0, dex.length - 1);
    const db_seed = dex[index];
    const seed = db_seed.seed;
    const mon = await db_fns.get_mon_by_seed(seed);
    return {
        id: "test_dummy",
        active_mon: 0,
        display_name: dex[index].global_name,
        last_battle: 0,
        last_pray: 0,
        mon: {
            id: mon.id,
            alive: true,
            boss_damage: 0,
            boss_kills: 0,
            date_hatched: 0,
            experience: attacker_experience,
            item_id: 0,
            kills: 0,
            level: clamp(calculate_level(attacker_experience), 1, 18),
            losses: 0,
            modifiers: [],
            nickname: dex[index].global_name,
            owner: mon.owner,
            seed,
            wins: 0
        },
        nickname: dex[index].global_name,
        premium: 0,
        premium_date: 0,
        registered: 0,
        active_box: 0
    };
};

interface BattleMonFromDbArgs {
    message: MessageNonNull;
    client: ClientOperator;
    the_user: GuildMember;
    db_mon: DbDiscomon;
    decrement_battle_trackers: DecrementFn;
}

async function battle_mon_from_db({
    message,
    db_mon,
    decrement_battle_trackers,
    client,
    the_user
}: BattleMonFromDbArgs): Promise<BattleEndState> {
    const attacker = await get_battle_player("attacker", client.db_fns, the_user.id, the_user.displayName, db_mon);
    const defender = attacker.mon.level > 10
        ? await get_defender_from_db(client.db_fns, attacker.mon.experience)
        : await get_generated_defender(attacker.mon.experience);
    const validated_args = {
        attacker,
        defender,
        is_pve: true
    };
    const results = await do_regular_battle({
        ...validated_args,
        is_pve: false
    }, client.discord, client.db_fns, true);
    await do_image_embed_on_battle_end(results, client, message);
    await decrement_battle_trackers();
    return results;
}

export default async function (client: ClientOperator, message: MessageNonNull, decrement_battle_trackers: DecrementFn, ...args: string[]): Promise<BattleEndState | "never_finished" | void> {
    if (first(args) === 'help') {
        await decrement_battle_trackers();
        return send_help_embed(message, 'Get egg inventory.\nType `.eggs` to see your inventory.\n', 'party', client.discord.user.avatarURL());
    }
    const sender = get_discord_sender(message.channel);
    const the_user = message.member;
    if (!the_user?.id) {
        await decrement_battle_trackers();
        return;
    }
    if (!await client.db_fns.user_exists(the_user.id)) {
        await decrement_battle_trackers();
        return sender('❌`.hatch first.`');
    }
    if (!await client.db_fns.has_mon(the_user.id)) {
        await decrement_battle_trackers();
        return sender('❌`.hatch a Discomon first.`');
    }

    const inventory = await client.db_fns.get_inventory(the_user.id);
    if (inventory.token <= 0) {
        await decrement_battle_trackers();
        return sender('❌ `you have no battle tokens. Type .buy to bring up the shop menu.`');
    }
    await before_battle(client.db_fns, the_user.id, the_user.displayName, message);
    const db_mon = await client.db_fns.get_active_mon(message.member.id);
    const battle_result_return = await battle_mon_from_db({
        message,
        client,
        db_mon,
        decrement_battle_trackers,
        the_user
    });
    return battle_result_return as BattleEndState;
}
