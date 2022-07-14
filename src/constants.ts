import { parse_json_as } from "./helpers/general_helpers";


export const app_root_path = require("app-root-path");

export interface BattleUpdateNotes {
    updates: Update[];
}

export interface Update {
    name: string;
    description: string;
    update_number: number;
    generation_values: GenerationValues;
}

export interface GenerationValues {
    grid: number,
    ca_rule: number,
    passes: number,
    color1: number,
    color2: number,
    special: number,
    passive: number,
    hp: number,
    damage: number,
    s_chance: number
}

export const most_recent_battle_update_notes = (() => {
    const updates = parse_json_as<BattleUpdateNotes>(require("fs").readFileSync(`${ app_root_path }/data/versioning.json`, "utf-8")).updates;
    return updates.reduce((a, b) => a.update_number > b.update_number ? a : b);
})();
