import { ConnectPromise } from "../client/get_db_connection";


export type SetInventory = "shield";
export default function (db: ConnectPromise): (owner_id: string, feature: SetInventory, amount: number) => Promise<void> {
    return async (owner_id: string, feature: SetInventory, amount: number): Promise<void> => {
        await db.query(`UPDATE inventory SET ${ feature } = ${ amount } WHERE owner = "${ owner_id }"`);
        // sql.prepare(`UPDATE inventory SET ${feature} = ${amount} WHERE owner = ${owner_id}`).run();
    };
}
