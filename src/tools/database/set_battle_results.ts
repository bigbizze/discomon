import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

const resolve_cash_and_cmd = async (db: ConnectPromise, discomon_id: number, owner_id: string, outcome: "won" | "lost", exp: number) => {
    const _exp = outcome === "won" ? exp : Math.floor(exp / 2);
    if (owner_id !== "boss" && outcome === "won") {
        await db.query(`UPDATE discomon SET wins = wins+1, experience = experience+${ exp } WHERE id = ${ discomon_id }`);
    } else {
        await db.query(`UPDATE discomon SET losses = losses+1, experience = experience+${ exp } WHERE id = ${ discomon_id }`);
    }
    return _exp;
};

/** update battle results against player
 */
export default function (db: ConnectPromise): (discomon_id: number, owner_id: string, outcome: "won" | "lost", exp: number) => Promise<void> {
    return async (discomon_id: number, owner_id: string, outcome: "won" | "lost", exp: number): Promise<void> => {
        if (is_null_or_nan(discomon_id)) {
            return;
        }
        const cash = await resolve_cash_and_cmd(db, discomon_id, owner_id, outcome, exp);
        await db.query(`UPDATE inventory SET credits = credits+${ cash } WHERE owner = "${ owner_id }"`);
        // sql.prepare(`UPDATE inventory SET credits = credits+${cash} WHERE owner = ${owner_id}`).run();
    };
}
