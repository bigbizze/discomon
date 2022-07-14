import { DbInventory } from "../../scaffold/database_types";


import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

/** get focus_user row and store in object
 */
export function get_inventory(db: ConnectPromise): (owner_id: string) => Promise<DbInventory>;

export function get_inventory(db: ConnectPromise): (owner_id: string) => Promise<void | DbInventory> {
    return async (owner_id: string | undefined): Promise<void | DbInventory> => {
        if (owner_id == null) {
            return;
        }
        const rows = await db.query(`SELECT * FROM inventory WHERE owner = "${ owner_id }" LIMIT 1;`);
        return get_first_db_row(rows);
    };
}
