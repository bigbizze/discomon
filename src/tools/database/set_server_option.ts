import { DbServerOption } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";

type ServerOptionKeys = keyof DbServerOption;

export default function (db: ConnectPromise): (...options: { name: ServerOptionKeys, value: any }[]) => Promise<void> {
    return async (...options: { name: ServerOptionKeys, value: any }[]): Promise<void> => {
        await db.query(`
            update server_options
            set ${ options.map(x => `${ x.name } = ${ typeof x.value === "string" ? `"${ x.value }"` : typeof x.value === "boolean" ? x.value ? 1 : 0 : x.value }`).join(",") }
            where id = 1;
        `);
    };
}
