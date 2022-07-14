import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

//

export default function (db: ConnectPromise) {
    return async (mon_id?: number | null, item_id?: number | null, slot_id?: number | null): Promise<void> => {
        if (is_null_or_nan(mon_id) || is_null_or_nan(item_id) || is_null_or_nan(slot_id)) {
            return;
        }
        await db.query(`UPDATE items SET destroyed = 1, discomon = null, slot = null WHERE discomon = ${ mon_id } AND slot = ${ slot_id }`);
        await db.query(`UPDATE items SET discomon = ${ mon_id }, slot = ${ slot_id } WHERE id = ${ item_id }`);
    };
}
