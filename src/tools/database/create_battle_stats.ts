import { ConnectPromise } from "../client/get_db_connection";
import { DbBattleStats } from "../../scaffold/database_types";
import { get_first_db_row } from "../../helpers/db_helpers";

export default function (db: ConnectPromise): (stats: DbBattleStats) => Promise<number> {
    return async function create_battle_stats({
                                                  num_turns,
                                                  is_pve,
                                                  winner,
                                                  attacker,
                                                  attacker_discomon,
                                                  attacker_exp,
                                                  defender,
                                                  defender_discomon,
                                                  defender_exp,
                                                  time_ended,
                                                  attacker_seed,
                                                  defender_seed,
                                                  battle_update_number
                                              }: DbBattleStats
    ): Promise<number> {
        await db.query(`
            INSERT INTO battle_stats(num_turns, is_pve, winner, attacker, attacker_discomon, attacker_exp, defender, defender_discomon, defender_exp, time_of_battle, attacker_seed, defender_seed, battle_update_number)
            VALUES(${ num_turns }, ${ is_pve }, "${ winner }", "${ attacker }", ${ attacker_discomon }, ${ attacker_exp }, "${ defender }", ${ defender_discomon }, ${ defender_exp }, "${ time_ended }", "${ attacker_seed }", "${ defender_seed }", ${ battle_update_number })`
        );
        const result = await db.query(`SELECT LAST_INSERT_ID()`);
        const row = get_first_db_row(result);
        if (!row.hasOwnProperty("LAST_INSERT_ID()")) {
            throw new Error("no id found!");
        }
        return row["LAST_INSERT_ID()"];
    };
}
