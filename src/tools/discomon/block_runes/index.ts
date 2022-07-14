import { Indexer } from "../../../helpers/utility_types";
import { Vecco } from "../generic-types/vecco";
import { Item } from "../../../scaffold/type_scaffolding";
import { ActionState } from "../prng-generator/action_handlers";
import { roll_block } from "../alpha_seed/prng";

export const den = 4;

export interface PrngBlockRune extends Indexer {
    rarity: number;
    blocks: Vecco[];
}

export type PrngBlockItemActionType = ActionState<PrngBlockRune, any>;

export const initial_rune_image_state = (item: Item): ActionState<PrngBlockRune, any> => ({
    seed: item.seed,
    item: item,
    state: {
        rarity: item.rarity,
        blocks: []
    },
    initial_seed: item.seed,
    created_on: null
});

function get_blocks(props: PrngBlockItemActionType, num_blocks: number, depth: number = 0): PrngBlockItemActionType {
    if (depth === num_blocks) {
        return { ...props };
    }
    const { newprops, vec } = roll_block({ ...props }, { x: 0, y: 0 }, depth);
    return get_blocks({
        ...newprops,
        state: { ...newprops.state, blocks: [ ...newprops.state.blocks, vec ] }
    }, num_blocks, depth + 1);
}

export function get_item_blocks(item: Item) {
    const init = initial_rune_image_state(item);
    const blocked = get_blocks(init, init.state.rarity * 4);
    return { ...blocked };
}
