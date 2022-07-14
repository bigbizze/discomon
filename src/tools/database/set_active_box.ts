import { ConnectPromise } from "../client/get_db_connection";

//

/** get user row and store in object
 */
export default function (db: ConnectPromise): (user_id: string, box: number) => Promise<void> {
    return async (user_id: string, box: number): Promise<void> => {
        await db.query(`update players set active_box = ${ box } where id = "${ user_id }";`);
    };
}

