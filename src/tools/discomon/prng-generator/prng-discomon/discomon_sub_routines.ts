//////////////////////////////////////////

import { ActionState, do_action, do_next_action } from "../action_handlers";
import { RngAction } from "../rng_actions";
import { isNotArray } from "../../../../helpers/array_helpers";
import {
    CellularAutomataRule,
    DiscomonAttributes,
    DiscomonStats,
    get_ca_rule,
    get_passive,
    get_special
} from "./discomon_action_handlers";
import {
    ca_rule_action,
    damage_action,
    hp_action,
    hue_action,
    lightness_action,
    passes_action,
    passive_action,
    rare_black_chance_action,
    rare_boost_chance_action,
    special_action,
    special_chance_action
} from "./discomon_actions";
import { Indexer } from "../../../../helpers/utility_types";
import { AlphaGenVersionValues } from "../../alpha_seed/types";

/**
 * const x = () => {} -
 *       effect not interface directly with the generator
 *
 * function x() {} -
 *       interfaces directly with generator.
 */

////////////////////////////////////////////////////////////

export type ColourGenProp = {
    hue: number
    lightness: number
    hue2: number
    lightness2: number
};

export interface PrngDiscomonFlatProps extends ColourGenProp, DiscomonAttributes, DiscomonStats, Indexer {
    type: number,
    passes: number
    ca_rule: CellularAutomataRule
    black: boolean
}

export type DiscomonActionState = ActionState<PrngDiscomonFlatProps, AlphaGenVersionValues>;

export function ca_rule(props: DiscomonActionState): DiscomonActionState {
    const { context: { generated_value, seed }, next } = do_action(props, ca_rule_action);
    const next_state = next({
        generated_value: get_ca_rule(generated_value),
        seed
    });
    return {
        ...next_state,
        state: {
            ...next_state.state,
            type: generated_value + 1
        }
    };
}

////////////////////////////////////////////////////////////

export function passes(props: DiscomonActionState): DiscomonActionState {
    return do_next_action(props, passes_action);
}

////////////////////////////////////////////////////////////

const do_colours = (props: DiscomonActionState, colour_stages: "first" | "second"): DiscomonActionState => {
    const [ _hue_action, _lightness_action ] = (
        colour_stages === "first"
            ? [ hue_action, lightness_action ]
            : [ { ...hue_action, step_name: "hue2" },
                { ...lightness_action, step_name: "lightness2", return_initial_seed: true } ]
    );
    return do_next_action(do_next_action(props, _hue_action), _lightness_action);
};

export function colours_one(props: DiscomonActionState): DiscomonActionState {
    return do_colours(props, "first");
}

export function colours_two(props: DiscomonActionState): DiscomonActionState {
    return do_colours(props, "second");
}

////////////////////////////////////////////////////////////

type GetAttribute = (val: number) => string;

const do_attribute = (props: DiscomonActionState, action: RngAction, get_attr: GetAttribute): DiscomonActionState => {
    const { context: { generated_value, seed }, next } = do_action(props, action);
    return next({
        generated_value: get_attr(generated_value),
        seed
    });
};

export function special(props: DiscomonActionState): DiscomonActionState {
    return do_attribute(props, special_action, get_special);
}

export function passive(props: DiscomonActionState): DiscomonActionState {
    return do_attribute(props, passive_action, get_passive);
}

const do_stat_action = (props: DiscomonActionState, exit_cond: number, actions: RngAction | RngAction[]): DiscomonActionState => {

    function _is_action_array_cond(i: number, actions: RngAction | RngAction[]): RngAction {
        return isNotArray(actions)
            ? actions
            : actions[i];
    }

    function _apply_stat_action(props: DiscomonActionState, i = 0, actions: RngAction | RngAction[] = []): DiscomonActionState {
        const action = _is_action_array_cond(i, actions);
        if (i === exit_cond || action == null) {
            return props;
        }
        const { context: { generated_value, seed }, next } = do_action(props, action);
        return _apply_stat_action(next({
            generated_value: props.state[action.step_name] + generated_value,
            seed
        }), i + 1, actions);
    }

    return _apply_stat_action(props, 0, actions);
};

export function basic_stats(props: DiscomonActionState): DiscomonActionState {
    const basic_stat_actions: RngAction[] = [
        hp_action,
        damage_action,
        special_chance_action
    ];

    function _apply_stats_per_level(props: DiscomonActionState, i = 0): DiscomonActionState {
        if (i === props.level + 2) {
            return {
                ...props,
                seed: props.initial_seed
            };
        }
        const stat_action = do_stat_action(props, basic_stat_actions.length, basic_stat_actions);
        return _apply_stats_per_level(stat_action, i + 1);
    }

    return _apply_stats_per_level(props);
}

////////////////////////////////////////////////////////////

export function rare_boost_chance(props: DiscomonActionState): DiscomonActionState {

    const _update_stat = (old_val: number) => old_val + Math.round((old_val / 100) * props.level);

    const { context: { generated_value, seed }, next } = do_action(props, rare_boost_chance_action);

    if (generated_value <= 990) {
        return props;
    }
    const { state } = next({
        generated_value: 'boost',
        seed
    });
    return {
        ...props,
        seed: props.initial_seed,
        state: {
            ...state,
            ...[ { [hp_action.step_name]: _update_stat(state.hp) },
                { [damage_action.step_name]: _update_stat(state.damage) },
                { [special_chance_action.step_name]: _update_stat(state.special_chance) } ]
        }
    };
}

////////////////////////////////////////////////////////////

export function rare_black_chance(props: DiscomonActionState): DiscomonActionState {

    const { context: { generated_value, seed }, next } = do_action(props, rare_black_chance_action);

    if (generated_value <= 9998 || props.initial_seed < 10000) {
        return props;
    }
    const { state } = next({
        generated_value: true,
        seed
    });
    return {
        ...props,
        seed: props.initial_seed,
        state: {
            ...state,
            black: true
        }
    };
}
