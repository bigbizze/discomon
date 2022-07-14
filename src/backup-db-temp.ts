import { Connection } from "mariadb";
import { Indexer } from "./helpers/utility_types";
import compressing from 'compressing';
import { create_connection } from "./tools/client/get_db_connection";

const BACKUP_DIRECTORY = "S:\\discomon-backup\\";

/** creates local backup of database */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function get_data(conn: Connection, table: string) {
    return await conn.query(`select * from ${ table }`);
}

function data_dump_done() {
    process.kill(process.pid);
}

async function backup_data_shitty() {
    const conn = await create_connection();
    const tables = (await conn.query('show tables;')).map((x: any) => x.Tables_in_Discomon) as string[];
    const data: Indexer = {};
    for (let table of tables) {
        data[table] = await get_data(conn, table);
    }
    const buf = Buffer.from(JSON.stringify(data), 'utf8');
    compressing.gzip.compressFile(buf, `${ BACKUP_DIRECTORY }backup-${ new Date().toDateString() }.gzip`)
        .then(data_dump_done)
        .catch((e: any) => {
            console.log(e);
            data_dump_done();
        });
}


function main() {
    backup_data_shitty().then().catch(err => console.log(err));
}


main();









