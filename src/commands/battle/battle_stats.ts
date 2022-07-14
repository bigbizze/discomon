import { ResolvedDbFns } from "../../tools/database";
import { DbBattleStats, DbBattleTurnStats } from "../../scaffold/database_types";
import { BattleTurnStat } from "../../tools/battles/resolvers";
import { BattleEndStateInternal } from "../../tools/battles";
import { date_to_mysql } from "../../helpers/date_helpers";
import { most_recent_battle_update_notes } from "../../constants";

export type MapBattleStatTurnToDb = (
    attacker_owner: string,
    attacker_discomon: number,
    defender_owner: string,
    defender_discomon: number
) => (
    battle_id: number
) => (
    battle_stat_turn: BattleTurnStat
) => DbBattleTurnStats;

export const get_map_battle_stat_turn_to_db: MapBattleStatTurnToDb = (
    attacker_owner: string,
    attacker_discomon: number,
    defender_owner: string,
    defender_discomon: number
) => (
    battle_id: number
) => (
    battle_stat_turn: BattleTurnStat
): DbBattleTurnStats => ({
    owner: battle_stat_turn.is_attacker ? attacker_owner : defender_owner,
    discomon: battle_stat_turn.is_attacker ? attacker_discomon : defender_discomon,
    battle_id,
    turn_num: battle_stat_turn.turn_num,
    status_special: battle_stat_turn.status_special,
    status_passive: battle_stat_turn.status_passive,
    status_item: battle_stat_turn.status_item,
    dmg: battle_stat_turn.dmg,
    dmg_taken: battle_stat_turn.dmg_taken,
    heal: battle_stat_turn.heal,
    special_dmg: battle_stat_turn.special_dmg,
    passive_dmg: battle_stat_turn.passive_dmg,
    item_dmg: battle_stat_turn.item_dmg,
    special_dmg_recv: battle_stat_turn.special_dmg_recv,
    passive_dmg_recv: battle_stat_turn.passive_dmg_recv,
    item_dmg_recv: battle_stat_turn.item_dmg_recv,
    time_of_turn: battle_stat_turn.time_of_turn
});

interface AttackerDefenderSeed {
    attacker_seed: string,
    defender_seed: string
}

const make_battle_stats_obj = (
    end_state: BattleEndStateInternal,
    { attacker_seed, defender_seed }: AttackerDefenderSeed
): DbBattleStats => ({
    attacker_seed,
    defender_seed,
    num_turns: end_state.state.turn_info.turn_number,
    is_pve: end_state.winner.is_boss || end_state.loser.is_boss,
    winner: end_state.is_attacker_winner ? "attacker" : "defender",
    attacker: end_state.is_attacker_winner ? end_state.winner.id : end_state.loser.id,
    attacker_discomon: end_state.is_attacker_winner ? end_state.winner.mon.id : end_state.loser.mon.id,
    attacker_exp: end_state.is_attacker_winner ? end_state.winner.mon.experience : end_state.loser.mon.experience,
    defender: end_state.is_attacker_winner ? end_state.loser.id : end_state.winner.id,
    defender_discomon: end_state.is_attacker_winner ? end_state.loser.mon.id : end_state.winner.mon.id,
    defender_exp: end_state.is_attacker_winner ? end_state.loser.mon.experience : end_state.winner.mon.experience,
    time_ended: date_to_mysql(),
    battle_update_number: most_recent_battle_update_notes.update_number
});

export async function battle_stats_async(
    db_fns: ResolvedDbFns,
    end_state: BattleEndStateInternal,
    seeds: AttackerDefenderSeed,
    turn_mapper: ReturnType<MapBattleStatTurnToDb>
) {
    const battle_stats = make_battle_stats_obj(end_state, seeds);
    const battle_id = await db_fns.create_battle_stats(battle_stats);
    const turn_mapper_with_id = turn_mapper(battle_id);
    await db_fns.create_battle_turn_stats(
        end_state.state.battle_turn_stats.map(turn_mapper_with_id)
    );
}

/** takes in information from a resolved battle, maps it to the relevant statistics & then writes this to db
 */

export default function (
    db_fns: ResolvedDbFns,
    end_state: BattleEndStateInternal,
    seeds: AttackerDefenderSeed,
    turn_mapper: ReturnType<MapBattleStatTurnToDb>
) {
    battle_stats_async(
        db_fns,
        end_state,
        seeds,
        turn_mapper
    ).then().catch(err => console.log(err));
}
