import {
    build_prng_state,
    CellularAutomataRule,
    DiscomonAttributes,
    DiscomonColours,
    DiscomonStats
} from "./discomon_action_handlers";
import {
    basic_stats,
    ca_rule,
    colours_one,
    colours_two,
    passes,
    passive,
    PrngDiscomonFlatProps,
    rare_black_chance,
    rare_boost_chance,
    special
} from "./discomon_sub_routines";
import { composePrngState } from "../../../../helpers/func_tools";
import { AlphaGenVersionValues } from "../../alpha_seed/types";

require('dotenv').config();

export interface PrngDiscomonState {
    type: number;
    passes: number;
    ca_rule: CellularAutomataRule;
    colours: DiscomonColours;
    attributes: DiscomonAttributes;
    stats: DiscomonStats;
}

export const init_props_flattened: PrngDiscomonFlatProps = {
    type: 0,
    ca_rule: {
        die: [],
        live: [],
        name: "none"
    },
    damage: 0,
    defend_chance: 0,
    hp: 0,
    hue: 0,
    hue2: 0,
    kill_chance: 0,
    lightness: 0,
    lightness2: 0,
    passes: 0,
    passive: 'heal',
    special: 'stun',
    special_chance: 0,
    black: false
};

function prng_discomon(seed: number, level: number, created_on?: Date | null): PrngDiscomonState {
    return composePrngState<PrngDiscomonFlatProps, AlphaGenVersionValues, PrngDiscomonState>(
        ca_rule,
        passes,
        colours_one,
        colours_two,
        special,
        passive,
        basic_stats,
        rare_boost_chance,
        rare_black_chance
    )({
        seed,
        level,
        created_on: created_on == undefined ? null : created_on,
        state: init_props_flattened,
        initial_seed: seed
    })(build_prng_state());
}

export default prng_discomon;
// let stats_do = [];
if (require.main === module) {
    const date_do = new Date(2015, 1, 1);
// const total = 10000000;
// const offset = 40000000;
    const outs = prng_discomon(13535, 18, date_do);
}
// for (let i = offset; i < total + offset; i++) {
//     const outs = prng_discomon(i + 1, 20, date_do);
//     stats_do.push({
//         seed: i + 1, // FUCK YOU
//         op_ness: ((outs.stats.damage / 400 * 100) + (outs.stats.hp / 1600 * 100) + (outs.stats.special_chance / 40 * 100) / 3)
//     });
//     if (i % (total / 100) === 0) {
//         console.log(`${Math.ceil((i / total) * 100)}%`);
//     }
// }
// console.log(stats_do.reduce((a, b) => a.op_ness > b.op_ness ? a : b));
