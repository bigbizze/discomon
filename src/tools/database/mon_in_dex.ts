import { ConnectPromise } from "../client/get_db_connection";


export default function (db: ConnectPromise) {
    return async (seed: string): Promise<boolean> => {
        const entry = await db.query(`SELECT * FROM seeds WHERE seed = "${ seed }"`);
        return !!entry[0];
    };
}
