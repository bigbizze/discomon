import { ConnectPromise } from "../client/get_db_connection";
import { DbBattleTurnStats } from "../../scaffold/database_types";

export type CreateBattleSideStats = Omit<DbBattleTurnStats, 'id'>;

/**
 owner: string
 discomon: number
 battle_id: number
 turn_num: number
 status_special: MonSpecial
 status_passive: MonPassive
 status_item: ItemAbility
 dmg: number
 dmg_taken: number
 heal: number
 special_dmg: number
 passive_dmg: number
 item_dmg: number
 special_dmg_recv: number
 passive_dmg_recv: number
 item_dmg_recv: number
 time_of_turn: string

 owner_id: string
 discomon_id: number
 experience: number
 */

const map_battle_turns_to_sql = ({
                                     owner,
                                     discomon,
                                     battle_id,
                                     turn_num,
                                     status_special,
                                     status_passive,
                                     status_item,
                                     dmg,
                                     dmg_taken,
                                     heal,
                                     special_dmg,
                                     passive_dmg,
                                     item_dmg,
                                     special_dmg_recv,
                                     passive_dmg_recv,
                                     item_dmg_recv,
                                     time_of_turn
                                 }: DbBattleTurnStats): string => (
    `("${ owner }", ${ discomon }, ${ battle_id }, ${ turn_num }, "${ status_special }", "${ status_passive }", "${ status_item }", ${ dmg }, ${ dmg_taken }, ${ heal }, ${ special_dmg }, ${ passive_dmg }, ${ item_dmg }, ${ special_dmg_recv }, ${ passive_dmg_recv }, ${ item_dmg_recv }, "${ time_of_turn }")`
);

export default function (db: ConnectPromise): (battle_turn_stats: DbBattleTurnStats[]) => Promise<void> {
    return async function create_battle_turn_stats(battle_turn_stats: DbBattleTurnStats[]): Promise<void> {
        await db.query(`
            INSERT INTO battle_turns_stats
                (owner, discomon, battle_id, turn_num, status_special, status_passive, status_item, dmg, dmg_taken, heal, special_dmg, passive_dmg, item_dmg, special_dmg_recv, passive_dmg_recv, item_dmg_recv, time_of_turn)
            VALUES
                ${ battle_turn_stats.map(map_battle_turns_to_sql).join(",\n") };
        `);
    };
}
