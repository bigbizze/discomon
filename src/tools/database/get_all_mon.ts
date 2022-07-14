import { DbDiscomon } from "../../scaffold/database_types";
import { ConnectPromise } from "../client/get_db_connection";

function get_all_mon(db: ConnectPromise): (user_id: string) => Promise<DbDiscomon[]>;

function get_all_mon(db: ConnectPromise): (user_id: string) => Promise<DbDiscomon[] | undefined> {
    return async (user_id: string | undefined): Promise<DbDiscomon[] | undefined> => {
        if (user_id == null) {
            return [];
        }
        const result = await db.query(`SELECT * FROM discomon WHERE owner = "${ user_id }" ORDER BY id ASC`);
        // const result = sql.prepare(`SELECT * FROM discomon WHERE owner = ${user_id} AND alive = 1 ORDER BY id ASC`).all();
        return result == null
            ? []
            : result;
    };
}

export default get_all_mon;
