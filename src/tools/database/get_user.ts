import { DbPlayer } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

//

/** get user row and store in object
 */
export default function (db: ConnectPromise): (user_id: string) => Promise<DbPlayer> {
    return async (user_id: string): Promise<DbPlayer> => {
        // return sql.prepare(`SELECT * FROM players WHERE id = "${user_id}"`).get();
        const rows = await db.query(`SELECT * FROM players WHERE id = "${ user_id }" LIMIT 1;`);
        return get_first_db_row(rows);
    };
}

