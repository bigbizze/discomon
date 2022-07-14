import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

/** is mon dead? (to check if user can hatch)
 */
export default function (db: ConnectPromise) {
    return async (): Promise<number> => {
        const result = await db.query(`SELECT LAST_INSERT_ID()`);
        const row = get_first_db_row(result);
        if (!row.hasOwnProperty("LAST_INSERT_ID()")) {
            throw new Error("no id found!");
        }
        return row["LAST_INSERT_ID()"];
    };
}
