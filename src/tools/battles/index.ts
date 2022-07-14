import {
    dummy_users_state,
    flip_side,
    get_battle_stat_turn_obj,
    get_user_type_or_none,
    is_winner,
    next_turn_info,
    when_battle,
    when_battle_async
} from "./utils";
import { get_battle_functions, Subroutine, SubroutineSetup } from "./subroutines";
import {
    BattleState,
    BattleUser,
    BattleUsers,
    resolve_end_of_battle_state,
    resolve_focus_and_other,
    resolve_side_state,
    resolve_turn_info
} from "./resolvers";
import { Functor, Functors } from "../../helpers/func_tools";
import { add_hp_bar, remove_status, set_dmg } from "./actions";
import after_battle from "./after-battle";
import { Client } from 'discord.js';
import { ResolvedDbFns } from "../database";
import { get_client_obj } from "../../bot";

export interface BattleEndStateInternal {
    winner: BattleUser;
    loser: BattleUser;
    state: BattleState;
    is_attacker_winner: boolean;
    is_matchmaking: boolean;
}

export interface BattleEndState {
    attacker: BattleUser;
    defender: BattleUser;
    state: BattleState;
}

/** When the battle is over, this returns the winning & loser users mapped as such.
 */
export const match_some_winner_or_continue = (users: BattleUsers, do_hp_bar: Subroutine, is_matchmaking: boolean) => (
    (state: BattleState, next: Functor<BattleState>): BattleState | BattleEndStateInternal => {
        const maybe_winner = get_user_type_or_none(state);
        if (maybe_winner == null) {
            return !state.turn_info.turn_end ? next(state) : state;
        }
        const last_state = do_hp_bar(state);
        return resolve_end_of_battle_state({
            ...last_state,
            turn_info: resolve_turn_info(last_state, turn_info => ({
                ...turn_info,
                turn_number: turn_info.turn_number + 1
            }))
        }, users, maybe_winner, is_matchmaking);
    }
);

/** This is called after every subroutine is executed to check if the battle should end or not.
 */
type ActionEndCheckFn = (state: BattleState | BattleEndStateInternal, next: Functor<BattleState>) => BattleState | BattleEndStateInternal;
export const get_check_after_action_fn = (users: BattleUsers, do_hp_bar: Subroutine, is_matchmaking: boolean): ActionEndCheckFn => {
    const battle_ended_check = match_some_winner_or_continue(users, do_hp_bar, is_matchmaking);
    return (state: BattleState | BattleEndStateInternal, next: Functor<BattleState>): BattleState | BattleEndStateInternal => {
        if (is_winner(state)) {
            return state;
        }
        return battle_ended_check(state, next);
    };
};

/** This is called after every turn is over to advance the state to the next turn & to
 *   reset turn dependant state ( non-permanent changes to state, for e.g., not enrage )
 */
export const get_check_after_turn_fn: SubroutineSetup = (users: BattleUsers) => (state: BattleState) => {
    const other_side = flip_side(state.turn_info.side);
    const turn_info = next_turn_info(state);
    return {
        ...state,
        state_by_side: {
            ...state.state_by_side,
            [state.turn_info.side]: resolve_side_state(state, state.turn_info.side, [
                set_dmg(state.state_by_side[state.turn_info.side].permanent_dmg + users[state.turn_info.side].mon.stats.damage),
                remove_status("crit")
            ])[state.turn_info.side],
            [other_side]: resolve_side_state(state, other_side, [
                set_dmg(state.state_by_side[other_side].permanent_dmg + users[other_side].mon.stats.damage),
                remove_status("crit")
            ])[other_side]
        },
        turn_info,
        battle_turn_stats: [
            ...state.battle_turn_stats,
            get_battle_stat_turn_obj(turn_info.turn_number, turn_info.side === "attacker")
        ]
    };
};

export const get_turn_state = (users: BattleUsers, is_boss_battle: boolean) => ({
    battle_messages: {},
    state_by_side: {
        attacker: {
            health_bar: {},
            hp: users.attacker.mon.stats.hp,
            turn_dmg: users.attacker.mon.stats.damage,
            permanent_dmg: 0,
            status: []
        },
        defender: {
            health_bar: {},
            hp: !is_boss_battle ? users.defender.mon.stats.hp : users.defender.mon.stats.current_hp,
            turn_dmg: users.defender.mon.stats.damage,
            permanent_dmg: 0,
            status: []
        }
    },
    turn_info: {
        side: "defender",
        turn_end: false,
        turn_number: 0
    },
    battle_turn_stats: [
        get_battle_stat_turn_obj(0, false)
    ],
    is_boss_battle
} as BattleState | BattleEndStateInternal);

interface DoBattleOperations {
    do_hp_bars_fn: Subroutine;
    check_after_action_fn: ActionEndCheckFn;
    check_after_turn_fn: Subroutine;
    turn_state: BattleState | BattleEndStateInternal;
}

export function do_battle_turns(turn_fns: Functors<BattleState>, battle_ops: DoBattleOperations): BattleState | BattleEndStateInternal {
    const { check_after_action_fn, check_after_turn_fn, turn_state, do_hp_bars_fn } = battle_ops;
    const turn_result = turn_fns.reduce((y, fn) => check_after_action_fn(y, fn), turn_state as BattleState | BattleEndStateInternal);
    return when_battle(turn_result, {
        is_ended: s => s as BattleEndStateInternal,
        is_not_ended: s => do_battle_turns(turn_fns, {
            ...battle_ops,
            turn_state: check_after_turn_fn(do_hp_bars_fn(s))
        }) as BattleState
    });
}

export const get_do_hp_bars_fn = (users: BattleUsers) => (
    (state: BattleState) => {
        const { other_side, focus_side } = resolve_focus_and_other(users, state.turn_info.side);
        return {
            ...state,
            state_by_side: {
                ...state.state_by_side,
                [focus_side]: resolve_side_state(state, focus_side, add_hp_bar(users[focus_side].mon.stats.hp))[focus_side],
                [other_side]: resolve_side_state(state, other_side, add_hp_bar(users[other_side].mon.stats.hp))[other_side]
            }
        };
    }
);

export default async function do_battle(
    users: BattleUsers,
    client: Client,
    db_fns: ResolvedDbFns,
    is_boss_battle: boolean,
    is_matchmaking: boolean
): Promise<BattleEndState> {
    const turn_fns = get_battle_functions(users);
    const do_hp_bars_fn = get_do_hp_bars_fn(users);
    const check_after_turn_fn = get_check_after_turn_fn(users);
    const check_after_action_fn = get_check_after_action_fn(users, do_hp_bars_fn, is_matchmaking);
    const turn_state = get_turn_state(users, is_boss_battle);
    const battle_ops = { do_hp_bars_fn, check_after_turn_fn, check_after_action_fn, turn_state };

    const result = do_battle_turns(turn_fns, battle_ops);
    const after_battle_results = await when_battle_async(result, {
        is_ended: async res => await after_battle(res, client, db_fns),
        is_not_ended: () => {
            throw new Error("do_battle did not return a battle result!");
        }
    }) as BattleEndStateInternal;
    return {
        state: after_battle_results.state,
        attacker: after_battle_results.is_attacker_winner ? after_battle_results.winner : after_battle_results.loser,
        defender: after_battle_results.is_attacker_winner ? after_battle_results.loser : after_battle_results.winner
    };
}

///////////////////////////////////////////////////////////////////

async function testerzz() {
    const { discord, db_fns } = await get_client_obj();
    const res: BattleEndState = await do_battle(dummy_users_state, discord, db_fns, true, false);
    const outs = {
        ...res.state,
        battle_messages: Object.entries(res.state.battle_messages).map(x => ({
            text: x[1].join("\n"),
            turn_num: x[0]
        })).reduce((p, n, i, array) => `${ p }\n\n${ i !== array.length - 1 ? `turn # ${ n.turn_num }` : "battle result" } --------\n\n${ n.text }`, "")
    };
    console.log(outs.battle_messages);
}

export const do_run_test_battle = true;
if (require.main === module && do_run_test_battle) {
    testerzz().then();
}
