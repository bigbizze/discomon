import { DbItem } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

export default function (db: ConnectPromise) {
    return async (item_id?: number): Promise<DbItem[]> => {
        if (is_null_or_nan(item_id)) {
            return [];
        }
        // return sql.prepare(`SELECT * FROM items WHERE id = ${item_id}`).all();
        return await db.query(`SELECT * FROM items WHERE id = '${ item_id }'`);
    };
}
