import { ConnectPromise } from "../client/get_db_connection";

export type PlayerValue = "last_hatch" | "last_pray" | "active_mon";

export default function (db: ConnectPromise): (id: string, feature: PlayerValue, value: number) => Promise<void> {
    return async (id: string, feature: PlayerValue, value: number): Promise<void> => {
        await db.query(`UPDATE players SET ${ feature } = ${ value } WHERE id = "${ id }"`);
        // sql.prepare(`UPDATE players SET ${feature} = ${value} WHERE id = ${id}`).run();
    };
}
