import { PrngDiscomonFlatProps } from "./discomon_sub_routines";
import { Colour } from "../../generic-types/colour";
import { PrngDiscomonState } from "./index";
import { MonPassive, MonSpecial } from "../../../../scaffold/type_scaffolding";

export type DiscomonStats = {
    hp: number
    current_hp?: number
    damage: number
    special_chance: number
};

export type DiscomonColours = {
    body_colour_one: Colour
    body_colour_two: Colour
    outline_colour: Colour
};

export type DiscomonAttributes = {
    special: MonSpecial
    passive: MonPassive
};

export type CellularAutomataRule = {
    live: number[]
    die: number[]
    name: string
};

export const get_ca_rule = (idx: number) => [
    { 'live': [ 6 ], 'die': [ 1, 2 ], name: 'one' },
    { 'live': [ 4 ], 'die': [ 1, 2 ], name: 'two' },
    { 'live': [ 3, 5 ], 'die': [ 1, 2 ], name: 'three' },
    { 'live': [ 3, 4 ], 'die': [ 1, 2 ], name: 'four' },
    { 'live': [ 5 ], 'die': [ 1 ], name: 'five' }
][idx];

export function get_special(idx: number): MonSpecial {
    const specials: MonSpecial[] = [
        'stun',
        'confuse',
        'crit'
    ];
    return specials[idx];
}

export function get_passive(idx: number): MonPassive {
    const passives: MonPassive[] = [
        'heal',
        'dodge',
        'enrage',
        'wound',
        "rebound"
    ];
    return passives[idx];
}

function get_ca_rules(prng_spread: PrngDiscomonFlatProps): { ca_rule: CellularAutomataRule } {
    return {
        ca_rule: prng_spread.ca_rule
    };
}

function get_colours_from_carry({
                                    hue,
                                    hue2,
                                    lightness,
                                    lightness2,
                                    black
                                }: PrngDiscomonFlatProps): { colours: DiscomonColours } {
    return {
        colours: {
            body_colour_one: {
                hue,
                sat: 100,
                lum: lightness
            },
            body_colour_two: !black ? {
                hue: hue2,
                sat: 100,
                lum: lightness2
            } : {
                hue: 0,
                sat: 0,
                lum: 0
            },
            outline_colour: !black ? {
                hue: hue,
                sat: 55,
                lum: lightness / 6
            } : {
                hue: 0,
                sat: 0,
                lum: 0
            }
        }
    };
}

function get_stats_from_carry(prng_spread: PrngDiscomonFlatProps): { stats: DiscomonStats } {
    return {
        stats: {
            hp: prng_spread.hp,
            damage: prng_spread.damage,
            special_chance: prng_spread.special_chance,
        }
    };
}

function get_attributes_from_carry(prng_spread: PrngDiscomonFlatProps): { attributes: DiscomonAttributes } {
    return {
        attributes: {
            special: prng_spread.special,
            passive: prng_spread.passive
        }
    };
}

export function build_prng_state() {
    return (prng_spread: PrngDiscomonFlatProps): PrngDiscomonState => ({
        type: prng_spread.type,
        passes: prng_spread.passes,
        ...get_ca_rules(prng_spread),
        ...get_colours_from_carry(prng_spread),
        ...get_stats_from_carry(prng_spread),
        ...get_attributes_from_carry(prng_spread)
    });
}
