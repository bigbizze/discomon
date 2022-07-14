import { DbDiscomon } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";

export default function (db: ConnectPromise): (board: string) => Promise<DbDiscomon[]> {
    return async function (board: string = 'threeday'): Promise<DbDiscomon[]> {
        // return sql.prepare(`SELECT * FROM discomon ORDER BY wins DESC, kills DESC, boss_damage DESC LIMIT 9`).all();
        if (board === 'threeday') {
            const max_age = Date.now() - 259200000;
            return await db.query(`SELECT * FROM discomon WHERE date_hatched > ${ max_age } AND NOT seed = "test_dummy" ORDER BY wins DESC LIMIT 9`);
        } else if (board === 'all') {
            return await db.query(`SELECT * FROM discomon WHERE NOT seed = "test_dummy::0:0:0:0:0:0:0:0:0:0" ORDER BY wins DESC LIMIT 9`);
        } else if (board === 'runeterror') {
            return await db.query(`SELECT * FROM discomon WHERE NOT seed = "test_dummy::0:0:0:0:0:0:0:0:0:0" ORDER BY boss_damage DESC LIMIT 9`);
        } else {
            const max_age = Date.now() - 259200000;
            return await db.query(`SELECT * FROM discomon WHERE date_hatched > ${ max_age } AND NOT seed = "test_dummy" ORDER BY wins DESC LIMIT 9`);
        }
    };
}
