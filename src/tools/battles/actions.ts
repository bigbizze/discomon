import { BattleEffect } from "../../scaffold/type_scaffolding";
import { BattleSide, BattleState, BattleTurnStat, TurnInfo } from "./resolvers";
import { effect_is_item, effect_is_passive, fill_hp_bar_gaps_for_side, flip_side, get_hp_bar } from "./utils";
import { Indexer } from "../../helpers/utility_types";

export type AttackerOrDefender = "attacker" | "defender";
export type SideActionCbFn = (prev: BattleSide, prev_other: BattleSide) => number;
export type BattleSideActionType = (state: BattleState, side: AttackerOrDefender) => BattleSide;
export type BattleStatActionType = (battle_stats: BattleTurnStat & Indexer) => BattleTurnStat;

/** These are composable actions which delineate discrete components of generating the properties of new Discomon
 */

///////////////////////////////////////////////////////////

export function fill_in_hp_bar_gaps(): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        health_bar: fill_hp_bar_gaps_for_side(state.state_by_side[side].health_bar, state.turn_info.turn_number)
    });
}

export function increment_hp(by: SideActionCbFn | number): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        hp: typeof by === "number" ? state.state_by_side[side].hp + by : by(state.state_by_side[side], state.state_by_side[flip_side(side)])
    });
}

export function increment_dmg(by: SideActionCbFn | number, permanent?: boolean): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender): BattleSide => {
        return ({
            ...state.state_by_side[side],
            ...(permanent == null || !permanent ? ({
                turn_dmg: typeof by === "number" ? state.state_by_side[side].turn_dmg + by : by(state.state_by_side[side], state.state_by_side[flip_side(side)])
            }) : ({
                permanent_dmg: typeof by === "number" ? state.state_by_side[side].permanent_dmg + by : by(state.state_by_side[side], state.state_by_side[flip_side(side)])
            }))
        });
    };
}

export function decrement_hp(by: SideActionCbFn | number): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        hp: typeof by === "number" ? state.state_by_side[side].hp - by : by(state.state_by_side[side], state.state_by_side[flip_side(side)])
    });
}

export function set_dmg(to: number, permanent?: boolean): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        ...(permanent == null || !permanent ? ({
            turn_dmg: to
        }) : ({
            permanent_dmg: to
        }))
    });
}

export function decrement_dmg(by: SideActionCbFn | number, permanent?: boolean): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        ...(permanent == null || !permanent ? ({
            turn_dmg: typeof by === "number" ? state.state_by_side[side].turn_dmg - by : by(state.state_by_side[side], state.state_by_side[flip_side(side)])
        }) : ({
            permanent_dmg: typeof by === "number" ? state.state_by_side[side].permanent_dmg - by : by(state.state_by_side[side], state.state_by_side[flip_side(side)])
        }))
    });
}

export function add_status(status: BattleEffect, value?: number): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        status: [
            ...state.state_by_side[side].status.filter(x => x.status !== status),
            { status, value }
        ]
    });
}

export function remove_status(status: BattleEffect): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        status: state.state_by_side[side].status.filter(x => x.status !== status)
    });
}

export function update_status(status: BattleEffect, value?: number): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        status: [
            ...state.state_by_side[side].status.filter(x => x.status !== status),
            { status, value }
        ]
    });
}

export function add_hp_bar(max_hp?: number): BattleSideActionType {
    return (state: BattleState, side: AttackerOrDefender) => ({
        ...state.state_by_side[side],
        health_bar: {
            ...state.state_by_side[side].health_bar,
            [state.turn_info.turn_number]: get_hp_bar(
                max_hp == null ? undefined : state.state_by_side[side].hp > 0 ? state.state_by_side[side].hp : 0,
                max_hp == null ? undefined : max_hp < 0 ? 0 : max_hp
            )
        }
    });
}

//////////////////////////////// battle_stats

export function status_battle_stat(effect: BattleEffect, status_change_type: "gain" | "lose"): BattleStatActionType {
    const effect_type = effect_is_passive(effect) ? "status_passive" : effect_is_item(effect) ? "status_item" : "status_special";
    return (battle_turn_stats: BattleTurnStat) => ({
        ...battle_turn_stats,
        [effect_type]: status_change_type === "gain"
            ? effect
            : "none"
        // : battle_turn_stats[effect_type] === effect ? "none" : battle_turn_stats[effect_type]
    });
}


export type ValueBattleStats =
    "dmg"
    | "dmg_taken"
    | "heal"
    | "special_dmg"
    | "passive_dmg"
    | "item_dmg"
    | "special_dmg_recv"
    | "passive_dmg_recv"
    | "item_dmg_recv";

export function value_battle_stat(effect: ValueBattleStats, value: number): BattleStatActionType {
    return (battle_turn_stats: BattleTurnStat) => ({
        ...battle_turn_stats,
        [effect]: value
    });
}

//////////////////////////////// turn actions


export type TurnInfoActionType = (turn_info: TurnInfo) => TurnInfo;

export function end_turn(): TurnInfoActionType {
    return turn_info => ({
        ...turn_info,
        turn_end: true
    });
}
