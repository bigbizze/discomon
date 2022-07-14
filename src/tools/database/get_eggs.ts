import { DbEgg } from "../../scaffold/database_types";
import { ConnectPromise } from "../client/get_db_connection";

function get_eggs(db: ConnectPromise): (user_id: string) => Promise<DbEgg[]>;

function get_eggs(db: ConnectPromise): (user_id: string) => Promise<DbEgg[] | undefined> {
    return async (user_id: string | undefined): Promise<DbEgg[] | undefined> => {
        if (user_id == null) {
            return [];
        }
        const result = await db.query(`SELECT * FROM eggs WHERE owner = "${ user_id }" AND used = 0 ORDER BY id ASC`);
        return result == null
            ? []
            : result;
    };
}

export default get_eggs;
