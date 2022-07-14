import { ConnectPromise } from "../client/get_db_connection";
import { DbDiscomon } from "../../scaffold/database_types";
import { get_first_db_row } from "../../helpers/db_helpers";

export function get_mon_at_slot(db: ConnectPromise): (user_id: string, kind: "party" | "box", slot: number, box_number?: number) => Promise<DbDiscomon | undefined> {
    return async (user_id: string, kind: "party" | "box", slot: number, box_number?: number | null): Promise<DbDiscomon | undefined> => {
        const rows = await db.query(`
            SELECT * FROM discomon
             WHERE owner = "${ user_id }" ${ kind === "party" ? " and box is null" : ` and box = ${ box_number }` } and alive = 1 and slot = ${ slot } ORDER BY id ASC
         `);
        if (!rows || rows.length <= 0) {
            return;
        }
        return get_first_db_row(rows);
    };
}
