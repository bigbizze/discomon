import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

//

/** get user row and store in object
 */
export default function (db: ConnectPromise): (user_id: string) => Promise<boolean> {
    return async (user_id: string): Promise<boolean> => {
        const rows = await db.query(`
            SELECT EXISTS(
              SELECT * from battle_stats
              WHERE attacker = "${ user_id }" OR defender = "${ user_id }" AND time_of_battle > DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
              LIMIT 1
            );
        `);
        return Object.values(get_first_db_row(rows)).some(x => x === 1);
    };
}

