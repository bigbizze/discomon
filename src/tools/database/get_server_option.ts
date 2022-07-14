import { DbServerOption } from "../../scaffold/database_types";

import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";
import { OptionalAccessor } from "../battles/resolvers";

type ServerOptionKeys = keyof DbServerOption;

export default function (db: ConnectPromise): (...options: ServerOptionKeys[]) => Promise<OptionalAccessor<DbServerOption>> {
    return async (...options: ServerOptionKeys[]): Promise<OptionalAccessor<DbServerOption>> => {
        const rows = await db.query(`SELECT ${ options.join(",") } FROM server_options ORDER BY id DESC limit 1`);
        return get_first_db_row(rows);
    };
}
