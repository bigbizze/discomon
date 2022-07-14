import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";

export default function (db: ConnectPromise) {
    return async (): Promise<number> => {
        const rows = await db.query(`
            select COUNT(*)
            from  players
            where from_unixtime(last_pray / 1000,'%Y-%m-%d %hh:%mm:%ss') > DATE_SUB(CURRENT_TIMESTAMP(), interval 1 day); 
        `);

        return get_first_db_row(rows)["COUNT(*)"];
    };
}
