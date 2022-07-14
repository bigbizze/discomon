import { BattleEndStateInternal } from "./index";
import { BattleUser, resolve_battle_messages } from "./resolvers";
import { Client } from "discord.js";
import do_roles from "../misc/do_role";
import { filter_false_from_type } from "../../helpers/array_helpers";
import { ResolvedDbFns } from "../database";
import battle_stats, { get_map_battle_stat_turn_to_db } from "../../commands/battle/battle_stats";
import { clamp } from "../discomon/image-generator/utils";

require('dotenv').config();

////////////////////////////////////////////////////////////

interface ExpReturn {
    winner_exp: number;
    loser_exp: number;
}

export const get_exp = ({ winner, loser }: BattleEndStateInternal): ExpReturn => {
    if (winner.mon.level < loser.mon.level) {
        return {
            winner_exp: Math.floor((clamp(loser.mon.level - winner.mon.level, 1, 3) + 2) * 10),
            loser_exp: Math.floor((1 / (clamp(loser.mon.level - winner.mon.level, 1, 3))) * 9)
        };
    } else if (winner.mon.level > loser.mon.level) {
        const loser_exp = Math.floor(clamp(winner.mon.level - loser.mon.level, 1, 3)) * 5 + 10;
        return {
            winner_exp: Math.floor((20 - (clamp(winner.mon.level - loser.mon.level, 1, 3)) ** 2)),
            loser_exp: loser_exp > 25 ? 25 : loser_exp
        };
    } else {
        return {
            winner_exp: 25,
            loser_exp: 15
        };
    }
};

export const do_set_battle_results = async (battle_end_state: BattleEndStateInternal, {
    exp: {
        winner_exp,
        loser_exp
    }
}: ExpOptions, db_fns: ResolvedDbFns): Promise<BattleEndStateInternal> => {
    if (!battle_end_state.loser.is_boss && !battle_end_state.winner.is_boss) {
        await db_fns.set_battle_results(battle_end_state.winner.mon.id, battle_end_state.winner.id, 'won', winner_exp);
        await db_fns.set_battle_results(battle_end_state.loser.mon.id, battle_end_state.loser.id, 'lost', loser_exp);
    } else {
        const [ boss, player ] = battle_end_state.winner.is_boss
            ? [ battle_end_state.winner, battle_end_state.loser ]
            : [ battle_end_state.loser, battle_end_state.winner ];
        const damage_dealt_to_boss = boss.mon.stats.current_hp
            ? boss.mon.stats.current_hp - battle_end_state.state.state_by_side.defender.hp
            : boss.mon.stats.hp;
        await db_fns.increment_inventory(player.id, 'current_boss_damage', damage_dealt_to_boss);
        await db_fns.increment_mon(player.mon.id, 'boss_damage', damage_dealt_to_boss);
        if (battle_end_state.winner.is_boss) {
            await db_fns.set_boss_battle_results(battle_end_state.winner.mon.id, 'won', battle_end_state.state.state_by_side.defender.hp);
        } else {
            await db_fns.increment_mon(battle_end_state.winner.mon.id, 'boss_kills', 1);
            await db_fns.set_boss_battle_results(battle_end_state.loser.mon.id, 'lost');
        }
    }
    return battle_end_state;
};

export const check_evolve = async (user: BattleUser, exp: number, client: Client): Promise<boolean> => {
    const should_mon_evolve = user.mon.experience + exp > user.mon.xp_to_next_level && user.mon.experience < Number(process.env.MAX_EXP);
    if (should_mon_evolve) {
        await do_roles(user.id, client);
    }
    return should_mon_evolve;
};

export const check_for_evolution = async (end_state: BattleEndStateInternal, {
    exp: { winner_exp, loser_exp },
    client
}: ExpOptions): Promise<BattleEndStateInternal> => ({
    ...end_state,
    state: {
        ...end_state.state,
        battle_messages: resolve_battle_messages(end_state.state, [
            !end_state.loser.is_boss
            && await check_evolve(end_state.loser, loser_exp, client)
            && `${ end_state.loser.display_name }\'s ${ end_state.loser.mon.nickname } EVOLVED! 🧬\n`,
            !end_state.winner.is_boss
            && await check_evolve(end_state.winner, winner_exp, client)
            && `${ end_state.winner.display_name }\'s ${ end_state.winner.mon.nickname } EVOLVED! 🧬\n`
        ].filter(filter_false_from_type))
    }
});

export interface ExpOptions {
    loser_alive: boolean;
    client: Client;
    exp: ExpReturn;
}

export const get_exp_string = (exp: number, battle_user: BattleUser, loser: Boolean = false): string | false => (
    !battle_user.is_boss
    && `${ battle_user.display_name }\'s ${ battle_user.mon.nickname } gained ${ loser ? Math.floor(exp / 2) : exp } ¥credits${ battle_user.mon.level < 18 ? ` and ${ loser ? `${ exp } ` : '' }xp` : "" }..\n`
);

export const apply_exp = async (end_state: BattleEndStateInternal, {
    exp: { winner_exp, loser_exp },
    loser_alive
}: ExpOptions): Promise<BattleEndStateInternal> => ({
    ...end_state,
    state: {
        ...end_state.state,
        battle_messages: resolve_battle_messages(end_state.state, [
            get_exp_string(winner_exp, end_state.winner),
            get_exp_string(loser_exp, end_state.loser, true)
        ].filter(filter_false_from_type))
    }
});

export async function exp_and_evolution(end_state: BattleEndStateInternal, client: Client, db_fns: ResolvedDbFns): Promise<BattleEndStateInternal> {
    const loser_alive = await db_fns.is_alive(end_state.loser.mon.id);
    return await [ do_set_battle_results, apply_exp, check_for_evolution ]
        .reduce(async (obj, fn) => (
            fn(await obj, {
                client,
                loser_alive,
                exp: get_exp(end_state)
            }, db_fns)
        ), Promise.resolve(end_state));
}

export async function do_battle_stats(end_state: BattleEndStateInternal, client: Client, db_fns: ResolvedDbFns): Promise<BattleEndStateInternal> {
    const { attacker, defender } = end_state.is_attacker_winner ? ({
        attacker: end_state.winner,
        defender: end_state.loser
    }) : ({
        attacker: end_state.loser,
        defender: end_state.winner
    });
    if (defender.mon.level > 18) {
        return end_state;
    }
    if (attacker.mon_state?.experience == null || defender.mon_state?.experience == null) {
        throw new Error("something in the user's stats was null when it shouldn't be!");
    }

    battle_stats(db_fns, end_state, {
        attacker_seed: attacker.mon_state.seed,
        defender_seed: defender.mon_state.seed
    }, get_map_battle_stat_turn_to_db(attacker.id, attacker.mon.id, defender.id, defender.mon.id));
    return end_state;
}

////////////////////////////////////////////////////////////

export default async function (end_state: BattleEndStateInternal, client: Client, db_fns: ResolvedDbFns): Promise<BattleEndStateInternal> {
    return await [ do_battle_stats, exp_and_evolution ]
        .reduce(async (y: Promise<BattleEndStateInternal>, fn) => (
            fn(await y, client, db_fns)
        ), Promise.resolve(end_state));
}









