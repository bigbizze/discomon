import { DbItem } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

export default function (db: ConnectPromise) {
    return async (mon_id: number): Promise<DbItem[]> => {
        if (is_null_or_nan(mon_id)) {
            return [];
        }
        return await db.query(`SELECT * FROM items WHERE discomon = ${ mon_id } AND destroyed = 0 ORDER BY slot ASC`);
    };
}
