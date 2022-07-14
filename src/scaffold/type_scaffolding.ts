// import { State } from "../tools/discomon/state";
import { PrngDiscomonState } from "../tools/discomon/prng-generator/prng-discomon";
import { DbDiscomon, DbInventory } from "./database_types";
import { InventoryFeature } from "../tools/database/increment_inventory";

export type DbCache = object & { [key: string]: any };
export type Vecco = {
    x: number
    y: number
};
export type LineVector = { start: Vecco, end: Vecco };

export interface ItemDbProps {
    id: string;
    seed: number;
    rarity: number;
}

export interface User extends UserDbProps {
    id: string;
    display_name: string;
    inventory: DbInventory;
    mon: Discomon & {
        modifier: ItemAbility[]
    };
}


export type BattleStatusItem = {
    status: BattleEffect,
    value?: number
};

export type CellularAutomataRule = {
    live: number[]
    die: number[]
};

export type Stats = {
    hp: number
    damage: number
    special: number
    special_chance: number
    kill_chance: number
    defend_chance: number
};

export type Prng = {
    original_seed: number
    seed: number
    modulus: number
    a: number
    c: number
};

export type Colour = {
    hue: number
    sat: number
    lum: number
};

export type MonSpecial = 'none' | 'crit' | 'stun' | 'confuse';
export type MonPassive = 'none' | 'heal' | 'wound' | 'enrage' | 'dodge' | 'boost' | 'rebound';
export type ItemAbility = 'none' | 'charge' | 'lifesteal' | 'poison' | 'nullify';
export type BattleEffect = MonSpecial | MonPassive | ItemAbility;

export type DbDiscomonSubset = {
    id: number
    experience: number
    seed: string
    level: number
};

export type UserDbProps = {
    kills: number
    wins: number
    losses: number
    boss_kills: number
    boss_damage: number
    mon_hatched: number
};

export interface MonStaticProps extends DbDiscomon {
    nickname: string;
    level: number;
    xp_to_next_level: number;
    num_blocks: number;
    block_size: number;
    anchor_parent_position: Vecco;
}

export interface MonState extends MonStaticProps, PrngDiscomonState {
    cells: number[][];
    size: number;
}

export interface Discomon extends MonState, UserDbProps {
    alive: boolean;
}

export type ItemType = 'hp' | 'damage' | 'special' | 'modifier' | 'none';
export type Item = {
    id: number
    seed: number
    rarity: number
    type: ItemType
    value: ItemAbility | number
    name: string | 'none'
};

export type ShopItem = {
    name: string
    currency: 'credits' | 'dust'
    cost: number
    feature: InventoryFeature
    description: string
    keywords: string[]
    purchase: string
    purchase2?: string
    amount: number
};
