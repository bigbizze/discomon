import { BattleStatusItem, ItemAbility, MonState } from "../../scaffold/type_scaffolding";
import {
    add_hp_bar,
    AttackerOrDefender,
    BattleSideActionType,
    BattleStatActionType,
    fill_in_hp_bar_gaps,
    TurnInfoActionType
} from "./actions";
import { flip_side } from "./utils";
import { DiscomonAttributes, DiscomonStats } from "../discomon/prng-generator/prng-discomon/discomon_action_handlers";
import { Indexer, TypedIndexer } from "../../helpers/utility_types";
import { BattleEndStateInternal } from "./index";
import { DbBattleTurnStats, DbItem } from "../../scaffold/database_types";

export type HealthBarMap = { [key: number]: string };


export type BattleTurnStat = Omit<Omit<Omit<DbBattleTurnStats, "discomon">, "owner">, "battle_id"> & {
    is_attacker: boolean
};


export interface BattleSide extends Indexer {
    status: BattleStatusItem[];
    hp: number;
    turn_dmg: number;
    permanent_dmg: number;
    health_bar: HealthBarMap;
}

export interface TurnInfo extends Indexer {
    turn_number: number;
    side: AttackerOrDefender;
    turn_end: boolean;
}

export type BattleMessageMap = { [key: number]: string[] };

export interface BattleState {
    state_by_side: BattleStateBySide;
    battle_messages: BattleMessageMap;
    turn_info: TurnInfo;
    is_boss_battle: boolean;
    battle_turn_stats: BattleTurnStat[] & Indexer;
}

export type OptionalAccessor<T> = { [K in keyof T]?: T[K] };

export interface BattleStateBySide extends TypedIndexer<BattleSide> {
    attacker: BattleSide;
    defender: BattleSide;
}

export interface BattleMon {
    id: number;
    modifier: ItemAbility[];
    attributes: DiscomonAttributes;
    stats: DiscomonStats & Indexer;
    nickname: string;
    level: number;
    experience: number;
    xp_to_next_level: number;
    items?: DbItem[];
}

export interface BattleUser {
    id: string;
    display_name: string;
    mon: BattleMon;
    mon_state?: MonState;
    is_boss: boolean;
}

export type BattleUsers = {
    attacker: BattleUser
    defender: BattleUser
} & Indexer;

interface ResolveFocusAndOtherReturn {
    focus_side: AttackerOrDefender;
    other_side: AttackerOrDefender;
    focus_user: BattleUser;
    other_user: BattleUser;
}

export const resolve_focus_and_other = (users: BattleUsers, side: AttackerOrDefender): ResolveFocusAndOtherReturn => ({
    focus_side: side,
    other_side: flip_side(side),
    focus_user: side === "attacker" ? users.attacker : users.defender,
    other_user: side === "defender" ? users.attacker : users.defender
});

/** can provide message as an array of strings or as single string
 */
export const resolve_battle_messages = ({
                                            battle_messages,
                                            turn_info: { turn_number }
                                        }: BattleState, message: string | string[]): BattleMessageMap => {
    const prev_messages = turn_number in battle_messages ? battle_messages[turn_number] : [];
    return ({
        ...battle_messages,
        [turn_number]: Array.isArray(message) ? [
            ...prev_messages,
            ...message
        ] : [
            ...prev_messages,
            message
        ]
    });
};

export const resolve_battle_stats = ({
                                         battle_turn_stats,
                                         turn_info: { turn_number }
                                     }: BattleState, battle_side_action: BattleStatActionType | BattleStatActionType[]): BattleTurnStat[] => {
    const last_idx = battle_turn_stats.length - 1;
    const battle_turn_obj = battle_turn_stats[turn_number];
    if (Array.isArray(battle_side_action)) {
        return [
            ...battle_turn_stats.slice(0, last_idx),
            battle_side_action.reduce((y, fn) => fn(y), battle_turn_obj)
        ];
    }
    return [
        ...battle_turn_stats.slice(0, last_idx),
        battle_side_action(battle_turn_obj)
    ];
};

export const resolve_side_state = (state: BattleState, side: AttackerOrDefender, battle_side_action: BattleSideActionType | BattleSideActionType[]): BattleStateBySide => {
    if (Array.isArray(battle_side_action)) {
        return {
            ...state.state_by_side,
            ...battle_side_action.reduce((y, fn) => ({
                ...y,
                [side]: {
                    ...y[side],
                    ...fn({
                        ...state,
                        state_by_side: y
                    }, side)
                }
            }), state.state_by_side)
        };
    }
    return {
        ...state.state_by_side,
        [side]: battle_side_action(state, side)
    };
};

export const resolve_turn_info = (state: BattleState, partial_turn_info: TurnInfoActionType): TurnInfo => {
    return partial_turn_info({
        ...state.turn_info,
        ...partial_turn_info
    });
};

export const resolve_end_of_battle_state = (state: BattleState, users: BattleUsers, maybe_winner: AttackerOrDefender, is_matchmaking: boolean): BattleEndStateInternal => {
    const loser_side = flip_side(maybe_winner);
    return {
        is_matchmaking,
        state: {
            ...state,
            battle_messages: resolve_battle_messages(
                state,
                users[maybe_winner].is_boss
                    ? `The Boss wins again! 🧿\nIt has ${ state.state_by_side.defender.hp } hp remaining!\n`
                    : `${ users[maybe_winner].display_name }\'s ${ users[maybe_winner].mon.nickname } is the winner! 🏆\n`
            ),
            state_by_side: {
                ...state.state_by_side,
                [maybe_winner]: resolve_side_state(state, maybe_winner, fill_in_hp_bar_gaps())[maybe_winner],
                [loser_side]: resolve_side_state(state, loser_side, [ add_hp_bar(), fill_in_hp_bar_gaps() ])[loser_side]
            }
        },
        winner: users[maybe_winner],
        loser: users[loser_side],
        is_attacker_winner: maybe_winner === "attacker"
    };
};
