import { BattleEffect, BattleStatusItem, ItemAbility, MonPassive, User } from "../../scaffold/type_scaffolding";
import { AttackerOrDefender } from "./actions";
import { BattleState, BattleTurnStat, BattleUser, BattleUsers, HealthBarMap, TurnInfo } from "./resolvers";
import { BattleEndStateInternal } from "./index";
import { date_to_mysql } from "../../helpers/date_helpers";

const hp_bar_length = 12;

const get_empty_hp_bar = () => Array(hp_bar_length).fill("▒").join("");

const get_percentage_of_len = (hp: number, max: number) => {
    const percentage_of_len = Math.ceil(hp_bar_length * hp / max);
    return percentage_of_len >= 0 ? percentage_of_len : 0;
};

export const get_hp_bar = (hp?: number, max?: number) => {
    if (hp == null || max == null) {
        return get_empty_hp_bar();
    }
    const percentage_of_len = get_percentage_of_len(hp, max);
    return `${ Array(percentage_of_len).fill("█").join("") }${ Array(hp_bar_length - percentage_of_len).fill("▒").join("") }`;
};

export const fill_hp_bar_gaps_for_side = (health_bars: HealthBarMap, last_turn_number: number, i = 0, last_hp_bar: string | null = null): HealthBarMap => {
    if (i === last_turn_number + 1) {
        return health_bars;
    } else if (health_bars[i] == null) {
        return fill_hp_bar_gaps_for_side({
            ...health_bars,
            [i]: last_hp_bar == null ? get_empty_hp_bar() : last_hp_bar
        }, last_turn_number, i + 1, last_hp_bar);
    } else {
        return fill_hp_bar_gaps_for_side(health_bars, last_turn_number, i + 1, health_bars[i]);
    }
};

export const nickname_check_unknown = (user: BattleUser) => (
    `${ user.mon.nickname === "unknown" ? `${ user.display_name }'s ` : "" }${ user.mon.nickname }`
);

export const item_abilities: ItemAbility[] = [ 'charge', 'lifesteal', 'poison', 'nullify' ];
export const passive_abilities: MonPassive[] = [ 'heal', 'dodge', 'enrage', 'rebound', "wound", "boost" ];
export const effect_is_item = (effect: BattleEffect): effect is ItemAbility => (item_abilities as any).includes(effect);
export const effect_is_passive = (effect: BattleEffect): effect is MonPassive => (passive_abilities as any).includes(effect);

export const has_ability = (side: AttackerOrDefender, effect: BattleEffect, users: BattleUsers): boolean => {
    if (effect_is_passive(effect)) { /** If effect in question is a passive, we have to check if opponent has an item with nullify or not. */
        return !users[flip_side(side)].mon.modifier.includes("nullify") && users[side].mon.attributes.passive === effect;
    } else if (!effect_is_item(effect)) {
        return users[side].mon.attributes.special === effect;
    } else {
        return users[side].mon.modifier.includes(effect);
    }
};

export const has_status = (side: AttackerOrDefender, status: BattleEffect, state: BattleState) => (
    state.state_by_side[side].status.some(x => x.status === status)
);

export const get_status_with_value = (side: AttackerOrDefender, state: BattleState | BattleStatusItem[], status: BattleEffect): BattleStatusItem => {
    const status_item = !Array.isArray(state) ? state.state_by_side[side].status.filter(x => x.status === status) : state.filter(x => x.status === status);
    if (status_item.length !== 1) {
        return { status: status, value: 1 };
    } else if (status_item[0]?.value != null) {
        return {
            status: status,
            value: status_item[0].value + 1
        };
    } else {
        throw new Error(`you're trying to access a ${ status } status and no exist!`);
    }
};

export const flip_side = (side: AttackerOrDefender) => side === "attacker" ? "defender" : "attacker";

export const next_turn_info = (state: BattleState): TurnInfo => ({
    turn_end: false,
    turn_number: state.turn_info.turn_number + 1,
    side: flip_side(state.turn_info.side)
});

export const get_user_type_or_none = (state: BattleState): AttackerOrDefender | undefined => (
    state.state_by_side.attacker.hp <= 0 ? "defender" : state.state_by_side.defender.hp <= 0 ? "attacker" : undefined
);

/** checks if the context is an object representing that the battle
 *   is over (BattleEndStateInternal) or one representing that it's still active (BattleState).
 */
export const is_not_winner = (context: BattleEndStateInternal | BattleState): context is BattleState => (
    "state_by_side" in context && !("winner" in context)
);

export const is_winner = (context: BattleEndStateInternal | BattleState): context is BattleEndStateInternal => (
    !is_not_winner(context)
);

/** NOTE: The types for this should probably be generics.
 *
 *  This takes in an object of one of the types BattleState or BattleEndStateInternal, when
 *   if the state is BattleEndStateInternal the battle is over so it executes the function passed to "is_ended",
 *   otherwise, if the state is "BattleState" it executes the function passed to "is_not_ended"
 */
type IsOption<T> = (s: T) => T;
type IsOptionAsync<T> = (s: T) => Promise<T>;

interface WhenBattleOptions {
    is_ended: IsOption<BattleEndStateInternal>;
    is_not_ended: IsOption<BattleState>;
}

interface WhenBattleOptionsAsync {
    is_ended: IsOptionAsync<BattleEndStateInternal>;
    is_not_ended: IsOptionAsync<BattleState>;
}

export async function when_battle_async(state: BattleState | BattleEndStateInternal, {
    is_ended,
    is_not_ended
}: WhenBattleOptionsAsync): Promise<BattleEndStateInternal | BattleState> {
    return is_not_winner(state)
        ? await is_not_ended(state)
        : await is_ended(state);
}

export function when_battle(state: BattleState | BattleEndStateInternal, {
    is_ended,
    is_not_ended
}: WhenBattleOptions): BattleState | BattleEndStateInternal {
    return is_not_winner(state)
        ? is_not_ended(state)
        : is_ended(state);
}


export const get_battle_stat_turn_obj = (turn_num: number, is_attacker: boolean): BattleTurnStat => ({
    is_attacker,
    dmg: 0,
    dmg_taken: 0,
    heal: 0,
    item_dmg: 0,
    item_dmg_recv: 0,
    passive_dmg: 0,
    passive_dmg_recv: 0,
    special_dmg: 0,
    special_dmg_recv: 0,
    status_item: "none",
    status_passive: "none",
    status_special: "none",
    time_of_turn: date_to_mysql(),
    turn_num
});

export const dummy_user: User = {
    // experience: 0,
    id: '1',
    inventory: {
        owner: "",
        chip: 0,
        credits: 0,
        dust: 0,
        dna: 0,
        shield: 0,
        current_boss_damage: 0,
        token: 0,
        tag: 0,
        candy: 0,
        runebox: 0,
        lootbox: 0
    },
    mon: {
        date_hatched: 0,
        type: 0,
        owner: "",
        item_id: 0,
        kills: 0,
        wins: 2,
        losses: 3,
        boss_kills: 5,
        boss_damage: 2,
        mon_hatched: 25,
        alive: true,
        "id": 1,
        "level": 23,
        "seed": "37608247",
        "nickname": "BoomerRemover",
        "experience": 5378,
        "block_size": 2.7586206896551726,
        "num_blocks": 29,
        "xp_to_next_level": 5878,
        "size": 0,
        "anchor_parent_position": {
            "x": 10,
            "y": 10
        },
        "passes": 4,
        "ca_rule": {
            "live": [
                6
            ],
            "die": [
                1,
                2
            ],
            "name": "one"
        },
        "colours": {
            "body_colour_one": {
                "hue": 10,
                "sat": 100,
                "lum": 90
            },
            "body_colour_two": {
                "hue": 132,
                "sat": 100,
                "lum": 76
            },
            "outline_colour": {
                "hue": 10,
                "sat": 55,
                "lum": 15
            }
        },
        "stats": {
            "hp": 1508,
            "damage": 391,
            "special_chance": 31
        },
        "attributes": {
            "special": "confuse",
            "passive": "heal"
        },
        "cells": [],
        modifier: [
            "nullify",
            "lifesteal"
        ]
    },
    kills: 0,
    // alive: true,
    losses: 0,
    wins: 0,
    boss_kills: 0,
    boss_damage: 0,
    mon_hatched: 0,
    display_name: "player one"
    // seed: 0
};

export const dummy_users_state: BattleUsers = {
    attacker: {
        id: "15215",
        display_name: dummy_user.display_name,
        mon: {
            ...dummy_user.mon,
            items: []
        },
        is_boss: false
    },
    defender: {
        id: "15215",
        display_name: "Player2",
        mon: {
            ...dummy_user.mon,
            nickname: "Remover DeBoomer",
            id: 15215,
            attributes: {
                special: "crit",
                passive: "enrage"
            },
            modifier: [
                "poison"
            ],
            items: []
        },
        is_boss: false
    }
};

