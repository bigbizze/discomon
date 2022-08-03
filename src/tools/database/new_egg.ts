import { ConnectPromise } from "../client/get_db_connection";


/** reset user with new mon
 */
export default function (db: ConnectPromise): (owner_id: string, type: string, p1: string | null, p2: string | null, created: number) => Promise<void> {
    return async (owner_id: string, type: string, p1: string | null = null, p2: string | null = null, created: number = Date.now()): Promise<void> => {
        await db.query(`INSERT INTO eggs(owner, type, adam, eve) VALUES("${ owner_id }", "${ type }", "${ p1 }", "${ p2 }")`);
    };
}
