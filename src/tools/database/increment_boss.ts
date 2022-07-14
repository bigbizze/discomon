import { ConnectPromise } from "../client/get_db_connection";

export type BossFeature = "attempts" | "hp" | "kills";
export default function (db: ConnectPromise): (feature: BossFeature, amount: number) => Promise<void> {
    return async (feature: BossFeature, amount: number): Promise<void> => {
        // sql.prepare(`UPDATE boss SET ${feature} = ${feature} + ${amount}`).run();
        await db.query(`UPDATE boss SET ${ feature } = ${ feature } + ${ amount }`);
    };
}
