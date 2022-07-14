import { apply_item_type, apply_modifier, ItemActionState, PrngItemFlatProps } from "./item_sub_routines";
import { build_item_state } from "./item_action_handlers";
import { Item } from '../../../../scaffold/type_scaffolding';
import { composePrngState } from "../../../../helpers/func_tools";

export const modifiers = [ 'nullify', 'poison', 'charge', 'lifesteal', 'test' ];
export const item_types = [ 'hp', 'damage', 'special', 'modifier' ];
export const item_rarities = [ 'common', 'rare', 'epic', 'mythic', 'legendary', 'ancient' ];
require('dotenv').config();

export interface ItemDiscrim {
    level: number;
    seed: number;
}

// export whose_turn Item = {
//     name: string
//     rarity: string
//     whose_turn: 'hp' | 'damage' | 'special' | 'modifier' | string // temporary
//     value: number | string
// };

export const initial_item_props = (id: number, initial_seed: number, rarity: number, created_on: Date | null): ItemActionState => ({
    seed: initial_seed,
    state: {
        id,
        seed: initial_seed,
        rarity: rarity,
        type: 'none',
        modifier: 0,
        damage: 0,
        hp: 0,
        special: 0
    },
    initial_seed,
    created_on
});

export default function prng_item(id: number, seed: number, rarity: number, created_on: Date | null): Item {
    return composePrngState<PrngItemFlatProps, null, Item>(
        apply_item_type,
        apply_modifier
    )(initial_item_props(id, seed, rarity, created_on))(build_item_state);
}

// for (let i = 0; i < 50; i++) {
//     console.log(prng_item(Math.floor(Math.random() * Math.floor(1000)), 4, new Date()));
// }
