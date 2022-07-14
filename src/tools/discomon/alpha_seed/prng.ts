import { next_seed } from "../prng-generator/action_handlers";
import { Range } from "../prng-generator/rng_actions";
import { Vecco } from "../generic-types/vecco";
import { block_action } from "../block_runes/block_rune_actions";
import { den, PrngBlockItemActionType } from "../block_runes";

// GENERIC

export function roll_single_stat(seed: number, range: Range): number {
    return range.min + (seed % (range.max + 1 - range.min));
}

export function roll_stats_per_level(seed: number, range: Range, level: number, accumulated = 0, depth = 0): number {
    if (depth === level + 2) {
        return accumulated;
    }
    const generated_value = range.min + (seed % (range.max + 1 - range.min));
    const new_total = accumulated + generated_value;
    const _next_seed = next_seed(seed);
    return roll_stats_per_level(_next_seed, range, level, new_total, depth + 1);
}

export function roll_single_stat_seed(seed: number, range: Range) {
    return { val: range.min + (seed % (range.max + 1 - range.min)), seed: next_seed(seed) };
}

// DISCOMON

export function roll_dna(breed_seed: number): Array<number> {
    const res = [];
    let seed = breed_seed;
    for (let i = 0; i < 9; i++) {
        const roll = roll_single_stat_seed(seed, { min: 0, max: 1 });
        res.push(roll.val);
        seed = roll.seed;
    }
    return res;
}

// RUNES

export function roll_block(props: PrngBlockItemActionType, vec: Vecco, index: number, depth = 0): { newprops: PrngBlockItemActionType, vec: Vecco } {
    if (depth === 2) {
        return { newprops: { ...props }, vec: vec };
    }
    if (depth === 0) {
        if (index === 0) {
            const { val, seed } = roll_single_stat_seed(props.seed, block_action.range[0]);
            return roll_block({ ...props, seed: seed }, { x: val, y: 0 }, index, depth + 1);
        } else {
            const { val, seed } = roll_single_stat_seed(props.seed,
                {
                    min: props.state.blocks[index - 1].x < 1 ? 0 : props.state.blocks[index - 1].x - 1,
                    max: props.state.blocks[index - 1].x > (den - 1) ? den : props.state.blocks[index - 1].x + 1
                });
            return roll_block({ ...props, seed: seed }, { x: val, y: 0 }, index, depth + 1);
        }
    } else {
        if (index === 0) {
            const { val, seed } = roll_single_stat_seed(props.seed, block_action.range[0]);
            return roll_block({ ...props, seed: seed }, { ...vec, y: val }, index, depth + 1);
        } else {
            const { val, seed } = roll_single_stat_seed(props.seed,
                {
                    min: props.state.blocks[index - 1].y < 1 ? 0 : props.state.blocks[index - 1].y - 1,
                    max: props.state.blocks[index - 1].y > (den - 1) ? den : props.state.blocks[index - 1].y + 1
                });
            return roll_block({ ...props, seed: seed }, { ...vec, y: val }, index, depth + 1);
        }
    }
}
