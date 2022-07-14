import { BattleState, BattleUsers } from "../../src/tools/battles/resolvers";
import { BattleEffect } from "../../src/scaffold/type_scaffolding";
import { dummy_users_state } from "../../src/tools/battles/utils";

export const get_turn_state = (users: BattleUsers) => ({
    battle_messages: {},
    state_by_side: {
        attacker: {
            health_bar: {},
            hp: users.attacker.mon.stats.hp,
            turn_dmg: users.attacker.mon.stats.damage,
            permanent_dmg: 0,
            status: []
        },
        defender: {
            health_bar: {},
            hp: users.defender.mon.stats.hp,
            turn_dmg: users.defender.mon.stats.damage,
            permanent_dmg: 0,
            status: []
        }
    },
    turn_info: {
        side: "attacker",
        turn_end: false,
        turn_number: 0
    },
    is_boss_battle: false,
    battle_turn_stats: []

} as BattleState);

export const get_dummy_battle_state = (): BattleState => ({
    ...get_turn_state(dummy_users_state),
    turn_info: {
        side: "attacker",
        turn_end: false,
        turn_number: 1
    }
});

export const choice = <T>(arr: T[]): T => (
    arr[Math.floor(Math.random() * arr.length)]
);

export const rand_status = (): BattleEffect => (
    choice([ 'none', 'stun', 'confuse', "poison", "wound", "charge" ])
);

export const rand_int = () => Math.floor(Math.random() * 10) + 1;
export const rand_side = () => Math.random() > .5 ? "attacker" : "defender";
