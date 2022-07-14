import { BattleEffect } from "../../scaffold/type_scaffolding";
import {
    BattleState,
    BattleUser,
    BattleUsers,
    resolve_battle_messages,
    resolve_battle_stats,
    resolve_focus_and_other,
    resolve_side_state,
    resolve_turn_info
} from "./resolvers";
import {
    add_status,
    AttackerOrDefender,
    decrement_hp,
    end_turn,
    increment_dmg,
    increment_hp,
    remove_status,
    status_battle_stat,
    update_status,
    value_battle_stat
} from "./actions";
import { get_status_with_value, has_ability, has_status, nickname_check_unknown } from "./utils";
import { Functor } from "../../helpers/func_tools";
import { chance } from "../../helpers/rng_helpers";
import { filter_false_from_type } from "../../helpers/array_helpers";
import { calculate_level } from "../../helpers/discomon_helpers";
import icon_manager from "../../icon-manager";

export type Subroutine = Functor<BattleState>;
export type SubroutineSetup = (u: BattleUsers) => Subroutine;
export type SubroutineSetupSometimes = SubroutineSetup | false;

/** in-battle interactions and effect resolvers */

////////////////////////////////////////////////////////////


function nullify_opponent_item(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("nullify") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            if (state.turn_info.turn_number !== 0) {
                return state;
            }
            const { focus_side, other_user, focus_user } = resolve_focus_and_other(users, state.turn_info.side);
            return {
                ...state,
                battle_messages: resolve_battle_messages(
                    state,
                    `${ nickname_check_unknown(has_ability(focus_side, "nullify", users) ? focus_user : other_user) } NULLIFIED its opponent\'s passive! ⛔`
                )
            };
        }
    ));
}

function is_self_poisoned(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("poison") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, focus_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_status(focus_side, "poison", state)) {
                return state;
            }
            const amt = !state.is_boss_battle ? Math.floor((users[focus_side].mon.stats.hp / 100) * 6) : 200;
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } ...${ amt }🧪`),
                state_by_side: resolve_side_state(state, focus_side, [
                    decrement_hp(amt),
                    remove_status("poison")
                ]),
                battle_turn_stats: resolve_battle_stats(state, [
                    status_battle_stat("poison", "gain"),
                    value_battle_stat("item_dmg_recv", amt)
                ])
            };
        }
    ));
}

function is_self_wounded(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("wound") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, focus_user, other_side } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_status(focus_side, "wound", state)) {
                return state;
            }
            const num_wounds = state.state_by_side[focus_side].status.reduce((obj, y) => {
                if (y.status === "wound" && typeof y.value === "number") {
                    return y.value;
                }
                return obj;
            }, null as null | number);
            if (num_wounds == null || num_wounds === 0) {
                return state;
            }
            const amt = Math.floor(users[other_side].mon.stats.damage / 8) * num_wounds;
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } ...${ amt }💉x${ num_wounds }`),
                state_by_side: resolve_side_state(state, focus_side, decrement_hp(amt)),
                battle_turn_stats: resolve_battle_stats(state, [
                    status_battle_stat("wound", "gain"),
                    value_battle_stat("passive_dmg_recv", amt)
                ])
            };
        }
    ));
}

function is_self_stunned(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("stun") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, focus_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_status(focus_side, "stun", state)) {
                return state;
            }
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } is STUNNED! 💥`),
                state_by_side: resolve_side_state(state, focus_side, remove_status("stun")),
                turn_info: resolve_turn_info(state, end_turn()),
                battle_turn_stats: resolve_battle_stats(state, status_battle_stat("stun", "gain"))
            };
        }
    ));
}

function is_self_confused(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("confuse") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, focus_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_status(focus_side, "confuse", state)) {
                return state;
            } else if (chance(60)) {
                return {
                    ...state,
                    battle_messages: resolve_battle_messages(
                        state,
                        `${ nickname_check_unknown(focus_user) } is CONFUSED..\n${ nickname_check_unknown(focus_user) } hit itself for ${ focus_user.mon.stats.damage } in confusion and snapped out of it! ❓`
                    ),
                    state_by_side: resolve_side_state(state, focus_side, [
                        decrement_hp(Math.floor(focus_user.mon.stats.damage * 0.66)),
                        remove_status("confuse")
                    ]),
                    turn_info: resolve_turn_info(state, end_turn()),
                    battle_turn_stats: resolve_battle_stats(state, [
                        status_battle_stat("confuse", "gain"),
                        value_battle_stat("special_dmg_recv", focus_user.mon.stats.damage)
                    ])
                };
            } else {
                return {
                    ...state,
                    battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } composed itself. ✅`),
                    state_by_side: resolve_side_state(state, focus_side, remove_status("confuse")),
                    battle_turn_stats: resolve_battle_stats(state, status_battle_stat("confuse", "lose"))
                };
            }
        }
    ));
}

function should_charge(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("charge") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, focus_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(focus_side, "charge", users)) {
                return state;
            }
            const { status, value } = get_status_with_value(focus_side, state, "charge");
            return {
                ...state,
                state_by_side: resolve_side_state(state, focus_side, update_status(status, value)),
                battle_messages: resolve_battle_messages(state, `[${ nickname_check_unknown(focus_user) } is charging its weapon 🔋]`)
            };
        }
    ));
}

function was_dodged(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("dodge") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { other_side, other_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(other_side, "dodge", users) || !chance(20)) {
                return state;
            }
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(other_user) } DODGED its attacker! 💨`),
                turn_info: resolve_turn_info(state, end_turn()),
                battle_turn_stats: resolve_battle_stats(state, status_battle_stat("dodge", "gain"))
            };
        }
    ));
}

function is_charged(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("charge") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, focus_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(focus_side, "charge", users) || get_status_with_value(focus_side, state, "charge").value !== 4) {
                return state;
            }
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) }\'s weapon is CHARGED! 🔋`),
                state_by_side: resolve_side_state(state, focus_side, [
                    increment_dmg(prev => prev.turn_dmg * 2),
                    remove_status("charge")
                ]),
                battle_turn_stats: resolve_battle_stats(state, [
                    status_battle_stat("charge", "gain"),
                    value_battle_stat("item_dmg", state.state_by_side[focus_side].turn_dmg * 2)
                ])
            };
        }
    ));
}

const do_damage_with_crit = (users: BattleUsers) => (
    (state: BattleState): BattleState => {
        const { focus_user, other_side, focus_side } = resolve_focus_and_other(users, state.turn_info.side);
        const is_crit = chance(focus_user.mon.stats.special_chance);
        const damage = Math.floor(state.state_by_side[focus_side].turn_dmg * (!is_crit ? 1 : 1.7));
        return {
            ...state,
            battle_messages: resolve_battle_messages(
                state,
                !is_crit
                    ? `${ nickname_check_unknown(focus_user) } hit for (${ damage }).`
                    : `${ nickname_check_unknown(focus_user) } landed a CRIT (${ damage })! 🎯`
            ),
            state_by_side: {
                ...state.state_by_side,
                [other_side]: resolve_side_state(state, other_side, [
                        decrement_hp(damage),
                        is_crit && add_status("crit", 1)
                    ].filter(filter_false_from_type)
                )[other_side],
                [focus_side]: is_crit
                    ? state.state_by_side[focus_side]
                    : resolve_side_state(state, focus_side, increment_dmg(prev => prev.turn_dmg * 1.7))[focus_side]
            },
            battle_turn_stats: resolve_battle_stats(state, [
                is_crit && status_battle_stat("crit", "gain"),
                value_battle_stat("dmg", damage)
            ].filter(filter_false_from_type))
        };
    }
);

const do_damage_no_crit = (users: BattleUsers) => (
    (state: BattleState): BattleState => {
        const { focus_user, other_side, focus_side } = resolve_focus_and_other(users, state.turn_info.side);
        const damage = state.state_by_side[focus_side].turn_dmg;
        return {
            ...state,
            battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } hit for (${ damage }).`),
            state_by_side: resolve_side_state(state, other_side, decrement_hp(damage)),
            battle_turn_stats: resolve_battle_stats(state, value_battle_stat("dmg", damage))
        };
    }
);

function do_damage_check_should_crit(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("crit") ? (users: BattleUsers) => {
        const no_crit = do_damage_no_crit(users);
        const crit = do_damage_with_crit(users);
        return (state: BattleState): BattleState => {
            const { focus_side } = resolve_focus_and_other(users, state.turn_info.side);
            return !has_ability(focus_side, "crit", users) ? no_crit(state) : crit(state);
        };
    } : (users: BattleUsers) => {
        return (state: BattleState) => do_damage_no_crit(users)(state);
    };
}

function apply_lifesteal(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("lifesteal") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(focus_side, "lifesteal", users)) {
                return state;
            }
            const crit_multiplier = has_status(focus_side, "crit", state) ? 1.7 : 1;
            const init_amount = !state.is_boss_battle
                ? Math.floor(state.state_by_side[focus_side].turn_dmg / 4)
                : Math.floor(users[focus_side].mon.stats.damage * crit_multiplier / 4);
            const max_can_heal = users[focus_side].mon.stats.hp - state.state_by_side[focus_side].hp;
            const amount = init_amount > max_can_heal ? max_can_heal : init_amount;
            return amount > 0 ? {
                ...state,
                battle_messages: resolve_battle_messages(state, ` +${ amount } hp. 🩸`),
                state_by_side: resolve_side_state(state, focus_side, increment_hp(amount)),
                battle_turn_stats: resolve_battle_stats(state, [
                    status_battle_stat("lifesteal", "gain"),
                    value_battle_stat("heal", amount)
                ])
            } : state;
        }
    ));
}

function should_stun_opponent(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("stun") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_user, other_side, focus_side } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(focus_side, "stun", users) || !chance(Math.floor(focus_user.mon.stats.special_chance * 0.8))) {
                return state;
            }
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } STUNNED its opponent! 💥`),
                state_by_side: resolve_side_state(state, other_side, add_status("stun"))
            };
        }
    ));
}

function should_confuse_opponent(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("confuse") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_user, other_side, focus_side } = resolve_focus_and_other(users, state.turn_info.side);
            if (
                !has_ability(focus_side, "confuse", users)
                || !chance(focus_user.mon.stats.special_chance)
                // || !chance(100)
                || has_status(other_side, "confuse", state)
            ) {
                return state;
            }
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } ❓CONFUSED❓its opponent!`),
                state_by_side: resolve_side_state(state, other_side, add_status("confuse"))
            };
        }
    ));
}

function did_take_rebound_damage(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("rebound") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const {
                focus_side,
                other_side,
                focus_user,
                other_user
            } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(other_side, "rebound", users)) {
                return state;
            }
            const did_hit_with_special =
                has_status(other_side, "stun", state)
                || has_status(other_side, "confuse", state)
                || has_status(other_side, "crit", state);
            if (!chance(!did_hit_with_special ? 50 : 100)) {
                return state;
            }
            // if player with rebound has lower attack than opponent, add the difference between their attack (up to 200 damage) to a base rate of 20 damage
            const dmg_diff = focus_user.mon.stats.damage - other_user.mon.stats.damage;
            const is_opponent_lower_level = other_user.mon.experience < focus_user.mon.experience;
            const max_if_opp_is_lower_level = other_user.mon.level * 4;
            const max_amt = is_opponent_lower_level ? max_if_opp_is_lower_level : 600 / (calculate_level(other_user.mon.experience) - calculate_level(focus_user.mon.experience));
            const base_amt = max_if_opp_is_lower_level + (dmg_diff > 0 ? dmg_diff <= max_amt ? dmg_diff : max_amt : 0);
            const amt = Math.floor(!did_hit_with_special ? base_amt : base_amt * 2);
            return {
                ...state,
                battle_messages: resolve_battle_messages(
                    state,
                    `${ !did_hit_with_special ? "Took " : "Hit with special and took (2x) " }${ amt } damage from rebound! ${ icon_manager("rebound") }`
                ),
                state_by_side: resolve_side_state(state, focus_side, decrement_hp(amt)),
                battle_turn_stats: resolve_battle_stats(state, [
                    status_battle_stat("rebound", "gain"),
                    value_battle_stat("passive_dmg_recv", amt)
                ])
            };
        }
    ));
}

function should_wound_opponent(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("wound") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, other_side } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(focus_side, "wound", users)) {
                return state;
            }
            const { status, value } = get_status_with_value(other_side, state, "wound");
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `[opponent WOUNDED 💉x${ value }]`),
                state_by_side: resolve_side_state(state, other_side, update_status(status, value))
            };
        }
    ));
}

function should_poison_opponent(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("poison") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, other_side, other_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(focus_side, "poison", users)) {
                return state;
            }
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(other_user) }.. 🧪\n`),
                state_by_side: resolve_side_state(state, other_side, add_status("poison"))
            };
        }
    ));
}

const get_heal_amt = (users: BattleUsers, state: BattleState, focus_user: BattleUser, focus_side: AttackerOrDefender, is_boss_battle = false) => {
    if (!is_boss_battle) {
        const init_amount = Math.floor(focus_user.mon.stats.hp / 4);
        const max_can_heal = users[focus_side].mon.stats.hp - state.state_by_side[focus_side].hp;
        return init_amount > max_can_heal ? max_can_heal : init_amount;
    }
    return 200;
};

function is_self_heal(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("heal") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { focus_side, focus_user } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(focus_side, "heal", users) || !chance(30)) {
                return state;
            }
            const amount = get_heal_amt(users, state, focus_user, focus_side, state.is_boss_battle);
            return amount > 0 ? {
                ...state,
                battle_messages: resolve_battle_messages(state, `${ nickname_check_unknown(focus_user) } HEALED for ${ amount } hp. 🍃`),
                state_by_side: resolve_side_state(state, focus_side, increment_hp(amount)),
                battle_turn_stats: resolve_battle_stats(state, [
                    status_battle_stat("heal", "gain"),
                    value_battle_stat("heal", amount)
                ])
            } : state;
        }
    ));
}

function is_enraged_opponent(effect_types: BattleEffect[]): SubroutineSetupSometimes {
    return effect_types.includes("enrage") && ((users: BattleUsers) => (
        (state: BattleState): BattleState => {
            const { other_user, other_side } = resolve_focus_and_other(users, state.turn_info.side);
            if (!has_ability(other_side, "enrage", users)) {
                return state;
            }
            const amt = Math.floor((other_user.mon.stats.damage / 100) * 12);
            return {
                ...state,
                battle_messages: resolve_battle_messages(state, `[opponent gained ${ amt } damage from ENRAGE! 💢]`),
                state_by_side: resolve_side_state(state, other_side, increment_dmg(amt, true)),
                battle_turn_stats: resolve_battle_stats(state, [
                    status_battle_stat("enrage", "gain"),
                    value_battle_stat("passive_dmg_recv", amt)
                ])
            };
        }
    ));
}

function get_functions(fns: ((effect_types: BattleEffect[]) => SubroutineSetupSometimes)[], users: BattleUsers, effect_types: BattleEffect[]) {
    return fns
        .map(is_valid_fn => is_valid_fn(effect_types))
        .filter(filter_false_from_type)
        .map(fn => fn(users));
}

/** This maps the users about to battle to the functions needed for a battle
 *   between those users.
 */
export function get_battle_functions(users: BattleUsers) {
    const effect_types = [
        ...users.attacker.mon.modifier,
        ...users.defender.mon.modifier,
        ...Object.values(users.attacker.mon.attributes),
        ...Object.values(users.defender.mon.attributes)
    ];
    return get_functions([
        nullify_opponent_item,
        is_self_poisoned,
        is_self_wounded,
        is_self_heal,
        is_self_stunned,
        is_self_confused,
        should_charge,
        was_dodged,
        is_charged,
        do_damage_check_should_crit,
        apply_lifesteal,
        should_wound_opponent,
        should_poison_opponent,
        should_stun_opponent,
        should_confuse_opponent,
        did_take_rebound_damage,
        is_enraged_opponent
    ], users, effect_types);
}
