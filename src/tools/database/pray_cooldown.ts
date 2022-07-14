import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

const minutes = 30;

export default function (db: ConnectPromise): (user_id: string) => Promise<boolean> {
    return async (user_id: string): Promise<boolean> => {
        // const last_prayer = sql.prepare(`SELECT last_pray FROM players WHERE id = ${user.id}`).get();
        const rows = await db.query(`SELECT last_pray FROM players WHERE id = "${ user_id }" LIMIT 1;`);
        const last_prayer = get_first_db_row(rows);
        return Date.now() - last_prayer.last_pray <= 60000 * minutes;
    };
}
