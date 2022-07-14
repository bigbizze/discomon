import { DbDiscomon } from "../../scaffold/database_types";


import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

//

export function get_active_mon(db: ConnectPromise): (user_id: string) => Promise<DbDiscomon>;

export function get_active_mon(db: ConnectPromise): (user_id: string) => Promise<DbDiscomon | void> {
    return async (user_id: string | undefined): Promise<void | DbDiscomon> => {
        if (user_id == null) {
            return;
        }
        try {
            const rows = await db.query(`
SELECT d.id, d.seed, d.nickname, d.experience, d.date_hatched, d.alive, d.wins, d.losses, d.kills, d.boss_damage, d.owner, d.boss_kills, d.slot, d.box 
FROM discomon as d
inner join players as p on d.id = p.active_mon 
WHERE p.id = "${ user_id }" LIMIT 1;
`);
            return get_first_db_row(rows);
        } catch (e) {
            console.log(e);
            return;
        }
    };
}

// export default get_active_mon;
