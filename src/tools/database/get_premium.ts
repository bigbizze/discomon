import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";
import { PatreonTiers } from "../../patreon-dbl-server";

//

/** get user row and store in object
 */
export default function (db: ConnectPromise): (user_id: string) => Promise<PatreonTiers> {
    return async (user_id: string): Promise<PatreonTiers> => {
        const rows = await db.query(`SELECT * FROM patreon WHERE discord_id = "${ user_id }" LIMIT 1;`);
        const premium = get_first_db_row(rows);
        return premium && premium.charge_status === 'Paid' ? premium.tier.toLowerCase() : 'none';
    };
}
