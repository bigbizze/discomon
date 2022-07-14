import { ConnectPromise } from "../client/get_db_connection";
import { date_string } from "../../helpers/date_helpers";

//

/** create new user in db
 */
export default function (db: ConnectPromise) {
    return async (user_id: string | undefined | null): Promise<void> => {
        if (user_id == null) {
            return;
        }
        await db.query(`INSERT INTO players(id, registered) VALUES("${ user_id }", ${ Date.now() })`);
        await db.query(`INSERT INTO inventory(owner, credits) VALUES("${ user_id }", 300)`);
        await db.query(`INSERT INTO eggs(owner, type, created_on) VALUES("${ user_id }", "standard", ${ Date.now() })`);
        // sql.prepare(`INSERT INTO players(id, string, premium) VALUES(${user_id}, ${Date.now()}, 0)`).run();
        // sql.prepare(`INSERT INTO inventory(owner, credits) VALUES(${user_id}, 200)`).run();
        console.log(`${ date_string() }::${ user_id } REGISTERED.`);
    };
}
