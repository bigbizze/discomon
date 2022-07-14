import { ClientOperator } from "../bot-types";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import { calculate_level, get_discord_sender, MessageNonNull } from "../helpers/discomon_helpers";
import { before_battle, do_image_embed_on_battle_end, do_regular_battle, PlayerBattle } from "./battle";
import { get_battle_player } from "./battle/resolvers";
import { clamp } from "../tools/discomon/image-generator/utils";
import { random } from "../helpers/rng_helpers";
import db_fns_unresolved, { ResolvedDbFns } from '../tools/database/index';
import { Connection } from "mariadb";
import { BattleEndState } from "../tools/battles";
import { DecrementFn } from "../tools/client/battle-trackers";
import { GuildMember } from "discord.js";
import { DbDiscomon } from "../scaffold/database_types";
import { get_alpha_from_seed } from "../tools/discomon/alpha_seed/utils";

export const rand_int = () => Math.floor(Math.random() * 10) + 1;

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
    // const items = db_fns.get_mon_active_items(db_seed.id);
    // map_db_items_to_items(db_seed, items);
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

const get_reinitialized_db_fns = (db_connection: Connection) => (
    Object.entries(db_fns_unresolved).reduce((obj, v) => ({
        ...obj,
        [v[0]]: v[1](db_connection)
    }), {} as ResolvedDbFns)
);

interface BattleMonFromDbArgs {
    message: MessageNonNull;
    client: ClientOperator;
    the_user: GuildMember;
    db_mon: DbDiscomon;
    decrement_battle_trackers: DecrementFn;
    // editable_message: Message
    // time_taken: number
}

async function battle_mon_from_db({
                                      message,
                                      db_mon,
                                      decrement_battle_trackers,
                                      client,
                                      the_user
                                  }: BattleMonFromDbArgs): Promise<BattleEndState> {
    // const db_connection = await get_db_connection();
    // const db_fns_re_init = get_reinitialized_db_fns(db_connection);
    const attacker = await get_battle_player("attacker", client.db_fns, the_user.id, the_user.displayName, db_mon);
    const defender = attacker.mon.level > 10
        ? await get_defender_from_db(client.db_fns, attacker.mon.experience)
        : await get_generated_defender(attacker.mon.experience);
    const validated_args = {
        attacker,
        defender,
        is_pve: true
    };
    // await editable_message.edit(`**Matchmaking took ${ time_taken } seconds... Prepare for a battle with ${ defender.display_name }!**`)
    const results = await do_regular_battle({
        ...validated_args,
        is_pve: false
    }, client.discord, client.db_fns, true);
    await do_image_embed_on_battle_end(results, client, message);
    // await db_connection.end();
    await decrement_battle_trackers();
    return results;
}

const SECONDS_TO_SLEEP_FOR = 20;
const DELAY_BETWEEN_EDITS = 2;
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
    // let is_still_searching_for_match = true;
    // const conn = new signalr.HubConnectionBuilder()
    //     .withUrl(
    //         // "http://95.179.189.182:5000/match"
    //         !process?.env?.DEV_MODE || !Number(process.env.DEV_MODE) ? "http://95.179.189.182:5000/match" : "http://localhost:5000/match"
    //     )
    //     .build();
    // const editable_message = await message.channel.send(`**${ the_user.displayName } queue for ${ 0 } seconds.**`);
    // await conn.start();
    const db_mon = await client.db_fns.get_active_mon(message.member.id);
    // conn.on("ReceiveBattleResults", async (result_serial: string) => {
    //     const result = JSON.parse(result_serial);
    //     if (result.attacker.mon_state == null || result.defender.mon_state == null) {
    //         throw new Error("why is mon state null?");
    //     }
    //     const image_buffer = await get_battle_img(result.attacker.mon_state, result.defender.mon_state, result.attacker.mon.items, result.defender.mon.items);
    //     await battle_embed(client, result, image_buffer, message);
    //     await decrement_battle_trackers();
    //     battle_result_return = result;
    // });
    // let battle_result_return: BattleEndState | undefined | null = null;
    // conn.on("FoundDefender", (battle_id: string, opponent_id: string, opponent_display_name, time_taken: number) => {
    //     is_still_searching_for_match = false;
    //     promise_then_catch(editable_message.edit(`**Matchmaking took ${ time_taken } seconds... Prepare for a battle with ${ opponent_display_name }!**`));
    // });

    // conn.on("FoundAttacker", async (battle_id: string, opponent_id: string, opponent_display_name, time_taken: number) => {
    //     console.log(`Battle match created :: ${ the_user.displayName } vs ${ opponent_display_name }`);
    //     is_still_searching_for_match = false;
    //     promise_then_catch(editable_message.edit(`**Matchmaking took ${ time_taken } seconds... Prepare for a battle with ${ opponent_display_name }!**`));
    //     const db_connection = await get_db_connection();
    //     const db_fns_re_init = get_reinitialized_db_fns(db_connection);
    //     const opp_db_mon = await client.db_fns.get_active_mon(opponent_id);
    //     const defender = await get_battle_player("defender", db_fns_re_init, the_user.id, the_user.displayName, db_mon);
    //     const attacker = await get_battle_player("attacker", db_fns_re_init, opponent_id, opponent_display_name, opp_db_mon);
    //     const validated_args = {
    //         attacker,
    //         defender,
    //         is_pve: false
    //     };
    //     const results = await do_regular_battle(validated_args, client.discord, db_fns_re_init, true);
    //     await db_connection.end();
    //     await conn.invoke(
    //         "ForwardResults",
    //         battle_id,
    //         JSON.stringify(results)
    //     );
    //     await do_image_embed_on_battle_end(results, client, message);
    //     await decrement_battle_trackers();
    //     battle_result_return = results;
    // });
    // conn.on("NoMatchFound", async () => {
    //     is_still_searching_for_match = false;
    //     promise_then_catch(editable_message.edit(`**We couldn't find a match... Prepare for a battle with a chipped Discomon!**`));
    //     const db_connection = await get_db_connection();
    //     const db_fns_re_init = get_reinitialized_db_fns(db_connection);
    //     const attacker = await get_battle_player("attacker", db_fns_re_init, the_user.id, the_user.displayName, db_mon);
    //     const defender = await get_generated_defender(attacker.mon.experience);
    //     const validated_args = {
    //         attacker,
    //         defender,
    //         is_pve: true
    //     };
    //     const results = await do_regular_battle({
    //         ...validated_args,
    //         is_pve: false
    //     }, client.discord, db_fns_re_init, true);
    //     await do_image_embed_on_battle_end(results, client, message);
    //     await db_connection.end();
    //     await decrement_battle_trackers();
    //     battle_result_return = results;
    // });
    // await conn.invoke("JoinQueue", the_user.id, the_user.displayName, db_mon.id, db_mon.experience, db_mon.wins, db_mon.losses);
    // const time_taken = rand_int();
    // const num_max_iterations = Math.floor(time_taken / DELAY_BETWEEN_EDITS);
    // for (let i = 0; i < num_max_iterations; i++) {
    //     await sleep(DELAY_BETWEEN_EDITS * 1000);
    //     // if (!is_still_searching_for_match) {
    //     //     break;
    //     // }
    //     await editable_message.edit(`**${ the_user.displayName } queue for ${ (i + 1) * DELAY_BETWEEN_EDITS } seconds.**`);
    //     // promise_then_catch(editable_message.edit(`**${ the_user.displayName } queue for ${ (i + 1) * DELAY_BETWEEN_EDITS } seconds.**`));
    // }
    // promise_then_catch();
    const battle_result_return = await battle_mon_from_db({
        message,
        client,
        db_mon,
        decrement_battle_trackers,
        the_user
    });
    // const time_start = new Date();
    // while (battle_result_return === null && differenceInMinutes(new Date(), time_start) < 5) {
    //     await sleep(25);
    // }
    // if (battle_result_return == null) {
    //     return "never_finished";
    // }
    return battle_result_return as BattleEndState;
    // await no_live_match();
}
