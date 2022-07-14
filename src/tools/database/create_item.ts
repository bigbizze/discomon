import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

//

/** create entry in db
 */
export default function (db: ConnectPromise) {
    return async (seed: number, rarity: number, owner_id: string): Promise<void> => {
        if (is_null_or_nan(seed) || is_null_or_nan(rarity) || owner_id == null) {
            return;
        }
        await db.query(`INSERT INTO items(seed, rarity, owner) VALUES(${ seed }, ${ rarity }, ${ owner_id })`);
        // sql.prepare(`INSERT INTO items(seed, rarity, owner) VALUES(${seed}, ${rarity}, ${owner_id})`).run();
    };
}
