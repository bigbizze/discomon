import user_exists from "./user_exists";

import { ConnectPromise } from "../client/get_db_connection";

/** Does the user have any discomon?
 */
export default function (db: ConnectPromise): (user_id?: string | null) => Promise<boolean> {
    return async (user_id?: string | null): Promise<boolean> => {
        if (user_id == null) {
            return false;
        }
        return await user_exists(db)(user_id)
            && (await db.query(`SELECT 1 FROM discomon where owner = "${ user_id }" AND alive = 1`)).length !== 0;
        // && (await db.query(`SELECT * FROM players WHERE id = "${user_id}"`)).active_mon;
        // && sql.prepare(`SELECT * FROM players WHERE id = "${user_id}"`).get().active_mon;
    };
}
