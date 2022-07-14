import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

/** deactivate user
 */
export default function (db: ConnectPromise): (discomon_id: number) => Promise<void> {
    return async (discomon_id: number): Promise<void> => {
        if (is_null_or_nan(discomon_id)) {
            return;
        }
        // sql.prepare(`UPDATE discomon SET alive = 0, item = null WHERE id = ${discomon_id}`).run();
        await db.query(`UPDATE discomon SET alive = 0 WHERE id = ${ discomon_id }`);
    };
}
