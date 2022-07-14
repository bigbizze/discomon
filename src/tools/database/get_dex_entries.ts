import { DbSeed } from "../../scaffold/database_types";


import { ConnectPromise } from "../client/get_db_connection";

export default function (db: ConnectPromise) {
    return async (user_id: string | "all" | "random" = 'all'): Promise<DbSeed[]> => {
        if (user_id == null) {
            return [];
        }
        if (user_id === "all") {
            return await db.query(`SELECT * FROM seeds ORDER BY id ASC`);
        } else if (user_id === "random") {
            return await db.query(`select * from seeds ORDER BY RAND() LIMIT 1;`);
        }
        return await db.query(`SELECT * FROM seeds WHERE discovered_by = "${ user_id }" ORDER BY id ASC`);

    };
}
