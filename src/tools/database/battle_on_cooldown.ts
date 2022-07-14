import { ConnectPromise } from "../client/get_db_connection";

//

/** is attack on cooldown
 */
export default function (db: ConnectPromise): (user_id: string) => Promise<boolean> {
    return async function battle_on_cooldown(user_id: string): Promise<boolean> {
        const cooldown = await db.query(`SELECT last_battle FROM players WHERE id = "${ user_id }"`);
        // const cooldown = sql.prepare(`SELECT last_battle FROM players WHERE id = "${user_id}"`).get();
        if (!("last_battle" in cooldown)) {
            return false;
        }
        return Date.now() - cooldown.last_battle <= 20000;
    };
}
