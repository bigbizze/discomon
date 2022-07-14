import { Indexer } from "../helpers/utility_types";
import { AttackerOrDefender } from "../tools/battles/actions";
import { ItemAbility, MonPassive, MonSpecial } from "./type_scaffolding";
import { PatreonTiers } from "../patreon-dbl-server";
import { Command } from "../commands";

export interface DbPlayer extends Indexer {
    id: string;
    active_mon: number;
    last_battle: number;
    last_pray: number;
    premium: number;
    premium_date: number;
    registered: number;
    active_box: number;
}

export interface DbItem {
    id: number;
    seed: number;
    rarity: number;
    owner: string;
    discomon: number;
    destroyed: boolean;
    slot?: 1 | 2 | 3;
}

export interface DbDiscomon extends Indexer {
    id: number;
    seed: string;
    boss_damage: number;
    nickname: string;
    experience: number;
    date_hatched: number;
    alive: boolean;
    wins: number;
    losses: number;
    kills: number;
    item_id: number;
    owner: string;
    boss_kills: number;
    box?: number | null;
    slot?: number;
}

export interface DbInventory {
    owner: string;
    chip: number;
    dna: number;
    dust: number;
    credits: number;
    token: number;
    shield: number;
    lootbox: number;
    runebox: number;
    tag: number;
    current_boss_damage: number;
    candy: number;
}

export interface DbBoss {
    id: number;
    seed: string;
    experience: number;
    name: string;
    hp: number;
    max_hp: number;
    damage: number;
    proc: number;
    wins: number;
    alive: boolean;
    attempts: number;
    kills: number;
    last_reset: number;
}

export interface DbSeed {
    id: number;
    seed: string;
    times_used: number;
    discovered_by: string;
    discovered_date: number;
    global_name: string;
}

export interface DbEgg {
    id: number;
    owner: string;
    type: string;
    used: number;
}

export interface DbQuest {
    id: number;
    owner: string;
    quest_name: string;
    expires_on: Date;
    command_name: Command;
    value: number;
    complete: 1 | 0;
}

export interface DbPatreon {
    id: number;
    patron_id: number;
    discord_id: string;
    name: string;
    tier: PatreonTiers;
    charge_status: string;
    paid_on: Date;
}

export interface DbBattleStats {
    id?: number;
    num_turns: number;
    is_pve: boolean;
    winner: AttackerOrDefender;
    attacker: string;
    attacker_discomon: number;
    attacker_exp: number;
    attacker_seed: string;
    defender: string;
    defender_discomon: number;
    defender_exp: number;
    defender_seed: string;
    time_ended: string;
    battle_update_number: number;
}

export interface DbBattleTurnStats {
    id?: number;
    owner: string;
    discomon: number;
    battle_id: number;
    turn_num: number;
    status_special: MonSpecial;
    status_passive: MonPassive;
    status_item: ItemAbility;
    dmg: number;
    dmg_taken: number;
    heal: number;
    special_dmg: number;
    passive_dmg: number;
    item_dmg: number;
    special_dmg_recv: number;
    passive_dmg_recv: number;
    item_dmg_recv: number;
    time_of_turn: string;
}

export interface DbServerOption {
    id: number;
    reboot: boolean;
    reboot_reason: string;
}

export interface DbGuild {
    id: string;
    owner: string;
    shard_id: number;
    name?: string;
    locale?: string;
    num_members?: number;
    num_text_channels?: number;
    prefix?: string;
    last_updated: Date;
}

export interface DbTables {
    player: DbPlayer[];
    item: DbItem[];
    discomon: DbDiscomon[];
    inventory: DbInventory[];
    boss: DbBoss[];
    seed: DbSeed[];
    egg: DbEgg[];
    battle_side_stats: DbBattleTurnStats[];
    battle_stats: DbBattleStats[];
    server_options: DbServerOption;
}
