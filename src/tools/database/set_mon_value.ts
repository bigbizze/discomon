import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

export type SetMonValue = "nickname" | "box" | "slot";
export default function (db: ConnectPromise): (id: number | undefined | null, feature: SetMonValue, value: string | number | null) => Promise<void> {
    return async (id: number | undefined | null, feature: SetMonValue, value: string | number | null): Promise<void> => {
        if (is_null_or_nan(id)) {
            return;
        }
        await db.query(`UPDATE discomon SET ${ feature } = ${ typeof value === "string" ? `"${ value }"` : `${ value }` } WHERE id = ${ id }`);
        // sql.prepare(`UPDATE discomon SET ${feature} = ? WHERE id = ${id}`).run(value);
    };
}
