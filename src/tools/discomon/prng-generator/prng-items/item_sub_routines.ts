//////////////////////////////////////////


import { ActionState, do_action } from "../action_handlers";
import { item_actions, item_selector_action, legendary_item_action, modifier_action } from "./item_actions";
import { RngAction } from "../rng_actions";
import { get_item_type, get_modifier } from "./item_action_handlers";
import { Indexer } from "../../../../helpers/utility_types";
import { ItemType } from "../../../../scaffold/type_scaffolding";


export interface PrngItemFlatProps extends Indexer {
    id: number,
    seed: number,
    rarity: number,
    type: ItemType,
    modifier: number,
    damage: number,
    hp: number,
    special: number
}

export type ItemActionState = ActionState<PrngItemFlatProps, any>;

export function apply_item_type(props: ItemActionState): ItemActionState {
    const action: RngAction = props.state.rarity === 4 ? legendary_item_action : item_selector_action;
    const { context: { generated_value, seed }, next } = do_action(props, action);

    function _apply_stats_per_rarity(props: ItemActionState, i: number = 0): ItemActionState {
        if (props.state.type === 'modifier' || i === props.state.rarity) {
            return props;
        }
        const stat = props.state.type;
        const action = item_actions.reduce((a, b) => a.step_name === stat ? a : b);
        const { context: { generated_value, seed }, next } = do_action(props, action, props.state.rarity - 1);
        return _apply_stats_per_rarity(next({
            generated_value: props.state[stat] + generated_value,
            seed
        }), i + 1);
    }

    return _apply_stats_per_rarity(next({ generated_value: get_item_type(generated_value), seed }), 0);
}


export function apply_modifier(props: ItemActionState): ItemActionState {
    if (props.state.type !== 'modifier') {
        return props;
    }
    const { context: { generated_value, seed }, next } = do_action(props, modifier_action);
    return next({
        seed,
        generated_value: get_modifier(generated_value)
    });
}


