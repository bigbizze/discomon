import { PrePrngAlphaState } from "./types";
import { PrngDiscomonState } from "../prng-generator/prng-discomon";
import {
    DiscomonColours,
    DiscomonStats,
    get_ca_rule,
    get_passive,
    get_special
} from "../prng-generator/prng-discomon/discomon_action_handlers";
import { roll_single_stat, roll_stats_per_level } from "./prng";
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
} from "../prng-generator/prng-discomon/discomon_actions";

import { next_seed } from "../prng-generator/action_handlers";
import { most_recent_battle_update_notes } from "../../../constants";

const get_hex = (n: number) => (
    n < 0 ? 0xFFFFFFFF + n + 1 : n
);

export const compress_num_to_hex = (alpha_num: number, should_pad = true): string => (
    should_pad ? get_hex(alpha_num).toString(16).toUpperCase().padStart(6, "0") : get_hex(alpha_num).toString(16).toUpperCase()
);

export const expand_hex_to_num = (alpha_str: string): number => (
    parseInt(alpha_str, 16)
);

export const alpha_hex_to_num = (alpha: string[]): number[] => (
    alpha.map(x => expand_hex_to_num(x))
);

const abs = (x: number) => (
    Math.abs(x)
);

type SeedByTypes = {
    generation: string[]
    versioning: string[]
};

export const split_seed_and_version = (a: string): Array<string> => {
    return a.split("::");
};

export const map_alpha_to_array = (a: string): SeedByTypes => {
    const gen_and_version = split_seed_and_version(a);
    if (gen_and_version.length !== 2) {
        throw new Error("Got a bad seed");
    }
    return {
        generation: gen_and_version[0].split("-"),
        versioning: gen_and_version[1].split(":")
    };
};

export function hex_seed_2_dex_seed(seed: string, version: number) {
    const split = alpha_hex_to_num(map_alpha_to_array(seed).generation);
    return `${ split[0] } - ${ version }`;
}

export function get_alpha_from_seed(seed: number): string {
    const versions = most_recent_battle_update_notes.generation_values;
    const grid_seed = compress_num_to_hex(seed);
    const ca_rule_seed = compress_num_to_hex(abs(seed - 1));
    const passes_seed = compress_num_to_hex(abs(seed - 2));
    const colour1_seed = compress_num_to_hex(abs(seed - 3));
    const colour2_seed = compress_num_to_hex(abs((seed - 4) * 7 % 16777216));
    const special_seed = compress_num_to_hex(abs(seed - 5));
    const passive_seed = compress_num_to_hex(abs(seed - 6));
    const hp_seed = compress_num_to_hex(abs(seed - 7));
    const damage_seed = compress_num_to_hex(abs(seed - 8));
    const s_chance_seed = compress_num_to_hex(abs(seed - 9));
    const grid_version = compress_num_to_hex(versions.grid, false);
    const ca_rule_version = compress_num_to_hex(versions.ca_rule, false);
    const passes_version = compress_num_to_hex(versions.passes, false);
    const colour1_version = compress_num_to_hex(versions.color1, false);
    const colour2_version = compress_num_to_hex(versions.color2, false);
    const special_version = compress_num_to_hex(versions.special, false);
    const passive_version = compress_num_to_hex(versions.passive, false);
    const hp_version = compress_num_to_hex(versions.hp, false);
    const damage_version = compress_num_to_hex(versions.damage, false);
    const s_chance_version = compress_num_to_hex(versions.s_chance, false);
    return `${ [
        grid_seed,
        ca_rule_seed,
        passes_seed,
        colour1_seed,
        colour2_seed,
        special_seed,
        passive_seed,
        hp_seed,
        damage_seed,
        s_chance_seed
    ].join('-') }::${ [
        grid_version,
        ca_rule_version,
        passes_version,
        colour1_version,
        colour2_version,
        special_version,
        passive_version,
        hp_version,
        damage_version,
        s_chance_version
    ].join(':') }`;
}


// const compression = (utf8Data: string) => {
//     const geoJsonGz = pako.gzip(utf8Data);
//     const res = new TextDecoder("utf-16").decode(utf8Data);
//     // const res2 = geoJsonGz.toString('')
//     // const gzippedBlob = new Blob([geoJsonGz]);
//     console.log(res);
// };

export function alpha_mon_state(alpha_seed: string): PrePrngAlphaState {
    const { generation, versioning } = map_alpha_to_array(alpha_seed);
    const segments: number[] = alpha_hex_to_num(generation);
    const versions = alpha_hex_to_num(versioning);
    return {
        seeds: {
            grid: segments[0],
            ca_rule: segments[1],
            passes: segments[2],
            colour1: segments[3],
            colour2: segments[4],
            special: segments[5],
            passive: segments[6],
            hp: segments[7],
            damage: segments[8],
            s_chance: segments[9]
        },
        versions: {
            grid: versions[0],
            ca_rule: versions[1],
            passes: versions[2],
            colour1: versions[3],
            colour2: versions[4],
            special: versions[5],
            passive: versions[6],
            hp: versions[7],
            damage: versions[8],
            s_chance: versions[9]
        }
    };
}


export function prng_alphamon(mon: PrePrngAlphaState, level: number): PrngDiscomonState {
    const _ca_rule_number = roll_single_stat(mon.seeds.ca_rule, ca_rule_action.range[mon.versions.ca_rule]);
    const type = _ca_rule_number + 1;
    const passes = roll_single_stat(mon.seeds.passes, passes_action.range[mon.versions.passes]);
    const colours = do_colours(mon, mon.seeds.colour1, mon.seeds.colour2);
    const special = get_special(roll_single_stat(mon.seeds.special, special_action.range[mon.versions.special]));
    const passive = roll_single_stat(mon.seeds.passive, rare_boost_chance_action.range[0]) > 990 ? 'boost' : get_passive(roll_single_stat(mon.seeds.passive, passive_action.range[mon.versions.passive]));
    const hp = roll_stats_per_level(mon.seeds.hp, hp_action.range[mon.versions.hp], level);
    const damage = roll_stats_per_level(mon.seeds.damage, damage_action.range[mon.versions.damage], level);
    const special_chance = roll_stats_per_level(mon.seeds.s_chance, special_chance_action.range[mon.versions.special], level);
    return {
        type,
        passes,
        ca_rule: get_ca_rule(_ca_rule_number),
        colours,
        attributes: {
            special,
            passive
        },
        stats: {
            ...calc_stats({ hp, damage, special_chance }, passive, level)
        }
    };
}

function calc_stats(stats: DiscomonStats, passive: string, level: number) {
    return passive !== 'boost' ? {
        ...stats
    } : {
        hp: stats.hp + Math.floor(stats.hp / 100 * level),
        damage: stats.damage + Math.floor(stats.damage / 100 * level),
        special_chance: stats.special_chance + Math.floor(stats.special_chance / 100 * level)
    };
}

function do_colours(mon: PrePrngAlphaState, c1_seed: number, c2_seed: number): DiscomonColours {
    const is_c1_black = roll_single_stat(c1_seed, rare_black_chance_action.range[0]) > 9998;
    const is_c2_black = roll_single_stat(c2_seed, rare_black_chance_action.range[0]) > 9998;
    const c1_lum_seed = next_seed(c1_seed);
    const c2_lum_seed = next_seed(c2_seed);
    const c1_hue = is_c1_black ? 0 : roll_single_stat(c1_seed, hue_action.range[mon.versions.colour1]);
    const c1_lum = is_c1_black ? 0 : roll_single_stat(c1_lum_seed, lightness_action.range[mon.versions.colour1]);
    const c2_hue = is_c2_black ? 0 : roll_single_stat(c2_seed, hue_action.range[mon.versions.colour2]);
    const c2_lum = is_c2_black ? 0 : roll_single_stat(c2_lum_seed, lightness_action.range[mon.versions.colour2]);
    return {
        body_colour_one: {
            hue: c1_hue,
            sat: is_c1_black ? 0 : 100,
            lum: c1_lum
        },
        body_colour_two: {
            hue: c2_hue,
            sat: is_c2_black ? 0 : 100,
            lum: c2_lum
        },
        outline_colour: {
            hue: is_c1_black || is_c2_black ? 0 : c1_hue,
            sat: is_c1_black || is_c2_black ? 0 : 55,
            lum: is_c1_black || is_c2_black ? 0 : c1_lum / 6
        }
    };
}
