import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

// TODO: Is this ever used?
export default function (db: ConnectPromise): (id: string, feature: string, amount: number) => Promise<void> {
    return async (id: string, feature: string, amount: number): Promise<void> => {
        if (is_null_or_nan(amount)) {
            return;
        }
        await db.query(`UPDATE players SET ${ feature } = ${ feature } + ${ amount } WHERE id = ${ id }`);
    };
}
