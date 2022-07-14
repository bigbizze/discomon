import { readFileSync } from "fs";
import { TypedIndexer } from "./helpers/utility_types";
import { app_root_path } from "./constants";

export type IconTypes = Commands | Inventory | Battle;

export type IconName = keyof Commands | keyof Inventory | keyof Battle;

export interface Icons extends TypedIndexer<IconTypes> {
    commands: Commands;
    inventory: Inventory;
    battle: Battle;
}

interface Battle {
    crit: string;
    lifesteal: string;
    stun: string;
    confuse: string;
    wound: string;
    poison: string;
    heal: string;
    enrage: string;
    charge: string;
    dodge: string;
    composed: string;
    nullify: string;
    rebound: string;
}

interface Commands {
    pray: string;
    error: string;
    wait: string;
    quest_title: string;
    available_quests: string;
    completed_quests: string;
    command_deprecation: string;
}

interface Inventory {
    candy: string;
    credits: string;
    dust: string;
    tokens: string;
    lootbox: string;
    runebox: string;
    egg: string;
}

function validate_icon_names(icons: Icons) {
    const icon_set = new Set<string>();
    for (let icon_types of Object.values(icons)) {
        for (let icon_name of Object.keys(icon_types)) {
            if (icon_set.has(icon_name)) {
                throw new Error("Multiple icon types have the same name!");
            }
            icon_set.add(icon_name);
        }
    }
}

function get_icon(icons: Icons, icon_name: IconName): string {
    for (let icon_types of Object.values(icons)) {
        if (icon_types.hasOwnProperty(icon_name)) {
            return (icon_types as any)[icon_name];
        }
    }
    throw new Error("You have requested an icon that effect not exist... somehow");
}

function load_icon_manager() {
    const icons = JSON.parse(readFileSync(`${ app_root_path }/data/text-icons.json`, "utf-8")).icons as Icons;
    validate_icon_names(icons);
    return (icon_name: IconName): string => (
        get_icon(icons, icon_name)
    );
}

const icon_manager = load_icon_manager();

export default icon_manager;

