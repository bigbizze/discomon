import { ConnectPromise } from "../client/get_db_connection";

/** is user in dB?
 */
export default function (db: ConnectPromise) {
    return async (user_id?: string | null): Promise<boolean> => {
        if (user_id == null) {
            return false;
        }
        const user = await db.query(`SELECT 1 FROM players WHERE id = "${ user_id }"`);
        return user.length !== 0;
    };
}

