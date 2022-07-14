import { match_some_winner_or_continue } from "../../src/tools/battles";
import { BattleUsers } from "../../src/tools/battles/resolvers";

// const battle_mon: BattleMon = {
//     id: 22,
//     attributes: {
//         passive: "heal",
//         special: "confuse"
//     },
//     experience: 3300,
//     modifier: [],
//     level: 18,
//     nickname: "test1",
//     stats: {
//         hp: number,
//         current_hp?: number,
//         damage: number,
//         special_chance: number,
//         defend_chance: number,
//         kill_chance: number
//     },
//     xp_to_next_level: mon.xp_to_next_level
// };
//
const battle_user: BattleUsers = {
    "attacker": {
        "id": "279344233607987210",
        "display_name": "bigbizze",
        "mon": {
            "attributes": {
                "special": "crit",
                "passive": "enrage"
            },
            "experience": 0,
            "id": 3,
            "modifier": [],
            "level": 1,
            "nickname": "unknown",
            "stats": {
                "hp": 162,
                "damage": 36,
                "defend_chance": 1,
                "special_chance": 5,
                "kill_chance": 0
            },
            "xp_to_next_level": 12,
            "items": []
        },
        "mon_state": {
            "boss_damage": 0,
            "boss_kills": 0,
            "date_hatched": 1598618805726,
            "item_id": 0,
            "losses": 0,
            "nickname": "unknown",
            "owner": "279344233607987210",
            "id": 3,
            "seed": 8658,
            "experience": 0,
            "alive": true,
            "wins": 0,
            "kills": 0,
            "level": 1,
            "block_size": 5,
            "num_blocks": 7,
            "xp_to_next_level": 12,
            "anchor_parent_position": {
                "x": 32.5,
                "y": 32.5
            },
            "type": 2,
            "passes": 3,
            "ca_rule": {
                "live": [
                    4
                ],
                "die": [
                    1,
                    2
                ],
                "name": "two"
            },
            "colours": {
                "body_colour_one": {
                    "hue": 251,
                    "sat": 100,
                    "lum": 70
                },
                "body_colour_two": {
                    "hue": 220,
                    "sat": 100,
                    "lum": 70
                },
                "outline_colour": {
                    "hue": 251,
                    "sat": 55,
                    "lum": 11.666666666666666
                }
            },
            "stats": {
                "hp": 162,
                "damage": 36,
                "defend_chance": 1,
                "special_chance": 5,
                "kill_chance": 0
            },
            "attributes": {
                "special": "crit",
                "passive": "enrage"
            },
            "cells": [],
            "size": 35
        },
        "is_boss": false
    },
    "defender": {
        "id": "217934695055228928",
        "display_name": "p4stoboy_\u25b1\u25b1\u25b1",
        "mon": {
            "attributes": {
                "special": "crit",
                "passive": "enrage"
            },
            "experience": 3212,
            "id": 9,
            "modifier": [],
            "level": 18,
            "nickname": "unknown",
            "stats": {
                "hp": 1089,
                "damage": 270,
                "defend_chance": 13,
                "special_chance": 24,
                "kill_chance": 9
            },
            "xp_to_next_level": 3601,
            "items": []
        },
        "mon_state": {
            "boss_damage": 0,
            "boss_kills": 0,
            "date_hatched": 1598753335293,
            "item_id": 0,
            "losses": 0,
            "nickname": "unknown",
            "owner": "217934695055228928",
            "id": 9,
            "seed": 37071,
            "experience": 3212,
            "alive": true,
            "wins": 0,
            "kills": 0,
            "level": 18,
            "block_size": 3.3333333333333335,
            "num_blocks": 24,
            "xp_to_next_level": 3601,
            "anchor_parent_position": {
                "x": 10,
                "y": 10
            },
            "type": 2,
            "passes": 3,
            "ca_rule": {
                "live": [
                    4
                ],
                "die": [
                    1,
                    2
                ],
                "name": "two"
            },
            "colours": {
                "body_colour_one": {
                    "hue": 251,
                    "sat": 100,
                    "lum": 70
                },
                "body_colour_two": {
                    "hue": 220,
                    "sat": 100,
                    "lum": 70
                },
                "outline_colour": {
                    "hue": 251,
                    "sat": 55,
                    "lum": 11.666666666666666
                }
            },
            "stats": {
                "hp": 1089,
                "damage": 270,
                "defend_chance": 13,
                "special_chance": 24,
                "kill_chance": 9
            },
            "attributes": {
                "special": "crit",
                "passive": "enrage"
            },
            "cells": [],
            "size": 80
        },
        "is_boss": false
    }
};


test(match_some_winner_or_continue.name, () => {

});









