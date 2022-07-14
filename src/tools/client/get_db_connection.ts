require("../../../load-env");
import mariadb, { Connection, QueryOptions } from "mariadb";
import { promises } from 'fs';
import mysqlTz from "mysql-tz";

const pool = mariadb.createPool({
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    timezone: mysqlTz(),
    connectionLimit: 500
});

export const create_connection = (): Promise<Connection> => pool.getConnection();

async function get_table_info() {
    const conn = await create_connection();
    const tables = await conn.query(`show tables in information_schema;`);
    console.log(tables);
    const data = await Promise.all(tables.map((table: any) => conn.query(`select * in information_schema.${ table.Tables_in_information_schema }`)));
    console.log(data);
    await promises.writeFile(`./file.json`, JSON.stringify({ data }));
}

export interface ConnectPromise extends Connection {
    query: (sql: string) => Promise<any>;
    _query?: (sql: string | QueryOptions, values?: any) => Promise<any>;
}

export default async function get_db_connection(): Promise<ConnectPromise> {
    return await create_connection();
}

if (require.main === module) {
    get_table_info().then().catch(err => console.log(err));
}
