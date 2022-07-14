import { PrngItemFlatProps } from "./item_sub_routines";
import { item_rarities, item_types, modifiers } from "./index";
import { Item } from "../../../../scaffold/type_scaffolding";


export const get_item_type = (idx: number) => item_types[idx];
export const get_modifier = (idx: number) => modifiers[idx];
export const get_rarity = (idx: number) => item_rarities[idx];

export function build_item_state(prng_spread: PrngItemFlatProps): Item {
    return {
        id: 1,
        name: `${ get_rarity(prng_spread.rarity) } ${ prng_spread.type } rune`.toUpperCase(),
        seed: prng_spread.seed,
        rarity: prng_spread.rarity,
        type: prng_spread.type,
        value: prng_spread[prng_spread.type]
    };
}
