import { ConnectPromise } from "../client/get_db_connection";

export default function (db: ConnectPromise): (user_id: string) => Promise<void> {
    return async (user_id: string): Promise<void> => {
        await db.query(`UPDATE players SET last_battle = ${ Date.now() } WHERE id = "${ user_id }"`);
        // sql.prepare(`UPDATE players SET last_battle = ${Date.now()} WHERE id = "${user_id}"`).run();
    };
}
