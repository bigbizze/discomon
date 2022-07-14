import { TypedIndexer } from "../../../helpers/utility_types";

export type SeedValues = {
    grid: number
    ca_rule: number
    passes: number
    colour1: number
    colour2: number
    special: number
    passive: number
    hp: number
    damage: number
    s_chance: number
} & TypedIndexer<number>;

export type AlphaGenVersionValues = {
    grid: number
    ca_rule: number
    passes: number
    colour1: number
    colour2: number
    special: number
    passive: number
    hp: number
    damage: number
    s_chance: number
} & TypedIndexer<number>;

export type PrePrngAlphaState = {
    seeds: SeedValues
    versions: AlphaGenVersionValues
};

