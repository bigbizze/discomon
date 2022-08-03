import { ConnectPromise } from "../client/get_db_connection";
import { date_string } from "../../helpers/date_helpers";

//

/** create new user in db
 */
export default function create_user(db: ConnectPromise) {
    return async (user_id: string | undefined | null): Promise<void> => {
        if (user_id == null) {
            return;
        }
        await db.query(`INSERT INTO players(id, registered) VALUES("${ user_id }", ${ Date.now() })`);
        await db.query(`INSERT INTO inventory(owner, credits, dust) VALUES("${ user_id }", 300,  7)`);
        await db.query(`INSERT INTO eggs(owner, type) VALUES("${ user_id }", "standard")`);
        console.log(`${ date_string() }::${ user_id } REGISTERED.`);
    };
}
