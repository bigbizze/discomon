import { ConnectPromise } from "../client/get_db_connection";
import { DbRune } from "../../../designing/types/rune_types";

//

/** create entry in db
 */
export default function (db: ConnectPromise) {
    return async (old_runes: DbRune[], new_rune: { seed: string, hue: number }, owner_id: string): Promise<void> => {
        if (old_runes.length < 2) {
            return;
        }
        await db.query(`INSERT INTO items(seed, hue, owner) VALUES("${ new_rune.seed }", ${ new_rune.hue }, "${ owner_id }")`);
        await db.query(`UPDATE items SET destroyed = 1 WHERE id = ${ old_runes[0].id } OR id = ${ old_runes[1].id }`);
        // sql.prepare(`INSERT INTO items(seed, rarity, owner) VALUES(${seed}, ${rarity}, ${owner_id})`).run();
    };
}
