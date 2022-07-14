//


import { ConnectPromise } from "../client/get_db_connection";
import { get_first_db_row } from "../../helpers/db_helpers";
import { UserGateType } from "../quests";

function get_sum_of_experience(db: ConnectPromise) {
    return async (user_id: string): Promise<number> => {
        const rows = await db.query(`
            SELECT SUM(experience)
             FROM discomon
             where owner = "${ user_id }"
        `);
        const first_row = get_first_db_row(rows);
        if (first_row.hasOwnProperty("SUM(experience)")) {
            return first_row["SUM(experience)"];
        }
        return 0;
    };
}

const gate_type_switch = (sum_of_exp: number): UserGateType => {
    if (sum_of_exp < 5000) {
        return "beginner";
    } else {
        return "advanced";
    }
};

/** is mon dead? (to check if user can hatch)
 */
export default function (db: ConnectPromise) {
    return async (user_id: string): Promise<UserGateType> => {
        const sum_of_exp = await get_sum_of_experience(db)(user_id);
        return gate_type_switch(sum_of_exp);
    };
}
