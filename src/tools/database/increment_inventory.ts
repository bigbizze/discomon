import { ConnectPromise } from "../client/get_db_connection";

export type InventoryFeature =
    "token"
    | "runebox"
    | "credits"
    | "candy"
    | "lootbox"
    | "tag"
    | "chip"
    | "current_boss_damage"
    | "shield"
    | "dust"
    | "egg"
    | "dna"
    | ":((((";

export default function (db: ConnectPromise): (owner_id: string | null | undefined, feature: InventoryFeature, amount: number) => Promise<void> {
    return async (owner_id: string | null | undefined, feature: InventoryFeature, amount: number): Promise<void> => {
        if (owner_id == null) {
            return;
        }
        // sql.prepare(`UPDATE inventory SET ${feature} = ${feature} + ${amount} WHERE owner = ${owner_id}`).run();
        await db.query(`UPDATE inventory SET ${ feature } = ${ feature } + ${ amount } WHERE owner = "${ owner_id }"`);
    };
}
