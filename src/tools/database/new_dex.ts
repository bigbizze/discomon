import { ConnectPromise } from "../client/get_db_connection";


export default function (db: ConnectPromise) {
    return async (seed: string, owner_id: string, name: string): Promise<void> => {
        await db.query(`INSERT INTO seeds(seed, times_used, discovered_by, discovered_date, global_name) VALUES("${ seed }", 1, "${ owner_id }", ${ Date.now() }, "${ name }")`);
        console.log(`:: Dex Entry #${ seed } :: name: ${ name } ::`);
    };
}
