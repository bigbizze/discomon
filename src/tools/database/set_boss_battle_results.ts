import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

/** update battle results against player
 */
export default function (db: ConnectPromise): (discomon_id: number, outcome: "won" | "lost", new_hp?: number) => Promise<void> {
    return async (discomon_id: number, outcome: "won" | "lost", new_hp?: number): Promise<void> => {
        if (is_null_or_nan(discomon_id)) {
            return;
        }
        if (outcome === "won" && new_hp) {
            await db.query(`UPDATE boss SET wins = wins+1, attempts = attempts+1, hp = ${ new_hp } WHERE id = ${ discomon_id }`);
        } else {
            await db.query(`UPDATE boss SET alive = 0, hp = 0 WHERE id = ${ discomon_id }`);
        }
    };
}
