import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

//

/** get user row and store in object
 */
export default function (db: ConnectPromise): (user_id: string) => Promise<number> {
    return async (user_id: string): Promise<number> => {
        const rows = await db.query(`select active_box from players where id = "${ user_id }"`);
        return get_first_db_row(rows).active_box;
    };
}

