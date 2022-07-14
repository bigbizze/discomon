import { get_inventory } from "./get_inventory";
import has_shield from "./has_shield";
import { DbDiscomon, DbInventory } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";
import get_all_mon from "./get_all_mon";
import { Indexer } from "../../helpers/utility_types";
import get_eggs from "./get_eggs";

export interface ProfileStats extends Indexer {
    credits: number;
    dust: number;
    candy: number;
    tokens: number;
    lootbox: number;
    runebox: number;
    eggs: number;
    tags: number;
    chips: number;
    dna: number;
    // kills: number
    wins: number;
    losses: number;
    wlr: string;
    hatches: number;
    // party_size: number
    boss_kills: number;
    boss_damage: number;
    shield: "none" | number | string;
}

export interface BalStats extends Indexer {
    credits: number;
    dust: number;
    candy: number;
    tokens: number;
    lootbox: number;
    runebox: number;
    eggs: number;
    tags: number;
    chips: number;
    dna: number;
}

export interface PlayerStats extends Indexer {
    wins: number;
    losses: number;
    wlr: string;
    hatches: number;
    // party_size: number
    boss_kills: number;
    boss_damage: number;
    shield: "none" | number | string;
}

export type CombinedStats = {
    bal: BalStats
    player: PlayerStats
};

const resolve_kdr = (state: ProfileStats): string => {
    if (state.losses !== 0) {
        return (state.wins / state.losses).toFixed(2);
    }
    return `${ state.wins }`;
};

const resolve_remaining = (db: ConnectPromise, user_id: string, state: ProfileStats, player_has_shield: Boolean): CombinedStats => ({
    bal: {
        credits: state.credits,
        dust: state.dust,
        candy: state.candy,
        tokens: state.tokens,
        lootbox: state.lootbox,
        runebox: state.runebox,
        eggs: state.eggs,
        tags: state.tags,
        chips: state.chips,
        dna: state.dna
    },
    player: {
        wins: state.wins,
        losses: state.losses,
        wlr: resolve_kdr(state),
        hatches: state.hatches,
        boss_damage: state.boss_damage,
        boss_kills: state.boss_kills,
        shield: player_has_shield && typeof state.shield === "number"
            ? `${ Math.floor(((86400000 / 2 - (Date.now() - state.shield)) / 3600000) + 1) } hours`
            : "none"
    }
});

export default function (db: ConnectPromise): (user_id?: string) => Promise<CombinedStats | undefined> {
    return async (user_id?: string): Promise<CombinedStats | undefined> => {
        if (user_id == null) {
            return;
        }
        const player_has_shield = await has_shield(db)(user_id);
        const num_eggs = await get_eggs(db)(user_id);
        const mons = await get_all_mon(db)(user_id);
        const inventory: DbInventory = await get_inventory(db)(user_id);
        const { runebox, candy, lootbox, credits, dust, tag, token } = inventory;
        const profile_state = mons.reduce((obj: ProfileStats, val: DbDiscomon): ProfileStats => ({
            ...obj,
            wins: obj.wins + val.wins,
            losses: obj.losses + val.losses,
            boss_damage: obj.boss_damage + val.boss_damage,
            boss_kills: obj.boss_kills + val.boss_kills
            // party_size: val.alive ? obj.party_size + 1 : obj.party_size
        }), {
            hatches: mons.length,
            wins: 0,
            losses: 0,
            wlr: "",
            boss_kills: 0,
            boss_damage: 0,
            party_size: 0,
            credits, dust,
            tokens: token,
            candy, lootbox, runebox,
            tags: tag,
            chips: inventory.chip,
            dna: inventory.dna,
            eggs: num_eggs.length,
            shield: inventory.shield
        });
        return resolve_remaining(
            db,
            user_id,
            profile_state,
            player_has_shield
        );
    };
}
