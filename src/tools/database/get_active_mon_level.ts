import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";
import { calculate_level } from "../../helpers/discomon_helpers";

export default function (db: ConnectPromise) {
    return async (user_id: string): Promise<number | undefined> => {
        const rows = await db.query(`
SELECT d.experience
FROM discomon as d
inner join players as p on d.id = p.active_mon 
WHERE p.id = "${ user_id }" LIMIT 1;
         `);
        const mon = get_first_db_row(rows);
        if (mon?.experience == null) {
            return;
        }
        return calculate_level(mon.experience);
    };
}
