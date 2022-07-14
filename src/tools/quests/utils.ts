import { BattleSide, BattleUser } from "../battles/resolvers";
import { BattleEndState } from "../battles";


export interface ResolvedBattler {
    battle_side: BattleSide;
    battle_user: BattleUser;
}

export function resolve_user_from_battle(user_id: string, battle_state: BattleEndState): ResolvedBattler {
    if (battle_state.defender.id === user_id) {
        return {
            battle_side: battle_state.state.state_by_side.defender,
            battle_user: battle_state.defender
        };
    }
    return {
        battle_side: battle_state.state.state_by_side.attacker,
        battle_user: battle_state.attacker
    };
}
