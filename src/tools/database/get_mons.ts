import { DbDiscomon } from "../../scaffold/database_types";
import { ConnectPromise } from "../client/get_db_connection";

export function get_mons(db: ConnectPromise): (user_id: string, kind: "party" | "box", box_number?: number) => Promise<DbDiscomon[]> {
    return async (user_id: string, kind: "party" | "box", box_number?: number | null): Promise<DbDiscomon[]> => {
        if (kind === "box" && !box_number) {
            throw new Error("Requesting a box but didn't specify the box #");
        }
        const rows = await db.query(`
            SELECT * FROM discomon
             WHERE owner = "${ user_id }" ${ kind === "party" ? "and box is null" : `and box = ${ box_number }` } and alive = 1 ORDER BY slot ASC
         `);

        if (!rows || rows.length <= 0) {
            return [];
        }
        return rows;
    };
}
