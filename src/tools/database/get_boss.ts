import { DbBoss } from "../../scaffold/database_types";
import { differenceInMinutes } from "date-fns";

import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";
import new_boss from "./new_boss";

/** If it has been at least 12 hours since the current boss was created, create a new boss record
 *   12 hours after the creation time of the current latest one created.
 *  This calls itself on return to ensure that the newly created boss was done so in the last 12 hours
 *   if it wasn't, this recursively created bosses for the time-spans when they were missing.
 */
const new_boss_if_expired = async (db: ConnectPromise, boss: DbBoss): Promise<DbBoss> => {
    if (differenceInMinutes(Date.now(), boss.last_reset) > 180 /*3 hours*/) {
        const time_of_reset = boss.last_reset + 10800000;
        await new_boss(db)(time_of_reset, !boss.alive);
        const rows = await db.query(`SELECT * FROM boss ORDER BY id DESC LIMIT 1;`);
        return await new_boss_if_expired(db, get_first_db_row(rows));
    }
    return boss;
};

/** get boss
 */
export default function (db: ConnectPromise) {
    return async (): Promise<DbBoss> => {
        const rows = await db.query(`SELECT * FROM boss ORDER BY id DESC LIMIT 1;`);
        return new_boss_if_expired(db, get_first_db_row(rows) as DbBoss);
    };
}
