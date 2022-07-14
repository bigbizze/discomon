import { DbItem } from "../../scaffold/database_types";


import { ConnectPromise } from "../client/get_db_connection";

//

export default function (db: ConnectPromise) {
    return async (owner_id: string): Promise<DbItem[]> => {
        if (owner_id == null) {
            return [];
        }
        return await db.query(`SELECT * FROM items WHERE owner = "${ owner_id }" AND discomon IS NULL AND destroyed = 0 ORDER BY id ASC`);
    };
}
