//


import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";
import { is_null_or_nan } from "../../helpers/general_helpers";

/** is mon dead? (to check if user can hatch)
 */
export default function (db: ConnectPromise) {
    return async (discomon_id: number): Promise<boolean> => {
        if (is_null_or_nan(discomon_id)) {
            return false;
        }
        const rows = await db.query(`SELECT * FROM discomon WHERE id = "${ discomon_id }" LIMIT 1;`);
        const alive = get_first_db_row(rows);
        return "alive" in alive && alive.alive === 1;
    };
}
