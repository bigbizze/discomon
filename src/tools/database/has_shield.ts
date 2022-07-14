import { ConnectPromise } from "../client/get_db_connection";

/** make sure user has no shield
 */
export default function (db: ConnectPromise): (owner_id: string) => Promise<boolean> {
    return async (owner_id: string): Promise<boolean> => {
        const shield = await db.query(`SELECT shield FROM inventory WHERE owner = ${ owner_id }`);
        return Date.now() - shield[0].shield < 86400000 / 2;
    };
}
