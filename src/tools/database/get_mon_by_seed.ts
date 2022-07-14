import { DbDiscomon } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

/** get user row and store in object
 */
export default function (db: ConnectPromise): (seed: string) => Promise<DbDiscomon> {
    return async (seed: string): Promise<DbDiscomon> => {
        // return sql.prepare(`SELECT * FROM discomon WHERE id = ${mon_id}`).get();
        const rows = await db.query(`SELECT * FROM Discomon.discomon WHERE seed = "${ seed }" LIMIT 1;`);
        return get_first_db_row(rows);
    };
}
