import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";


/** reset user with new mon
 */
export default function (db: ConnectPromise): (owner_id: string, seed: string, egg: number) => Promise<number> {
    return async (owner_id: string, seed: string, egg: number): Promise<number> => {
        await db.query(`INSERT INTO discomon(seed, date_hatched, owner) VALUES("${ seed }", "${ Date.now() }", "${ owner_id }")`);
        // sql.prepare(`INSERT INTO discomon(seed, date_hatched, owner) VALUES(${seed}, ${Date.now()}, ${owner_id})`).run();
        const rows = await db.query(`SELECT id FROM discomon WHERE owner = "${ owner_id }" ORDER BY id DESC LIMIT 1;`);
        // const id = sql.prepare(`SELECT id FROM discomon WHERE owner = ${owner_id} ORDER BY id DESC`).get();
        await db.query(`UPDATE eggs SET used = 1 WHERE id = ${ egg }`);
        return get_first_db_row(rows).id;
    };
}

