import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

export type IncrementMonTypes = "experience" | "kills" | "boss_kills" | "boss_damage";

export default function (db: ConnectPromise): (id: number, feature: IncrementMonTypes, amount: number) => Promise<void> {
    return async (id: number, feature: IncrementMonTypes, amount: number): Promise<void> => {
        if (is_null_or_nan(id) || is_null_or_nan(amount)) {
            return;
        }
        // sql.prepare(`UPDATE discomon SET ${feature} = ${feature} + ${amount} WHERE id = ${id}`).run();
        await db.query(`UPDATE discomon SET ${ feature } = ${ feature } + ${ amount } WHERE id = ${ id }`);
    };
}
