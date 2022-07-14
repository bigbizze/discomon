import { ConnectPromise } from "../client/get_db_connection";
import { DailyChallengeExpires, DailyChallengeProps } from "../quests";


const resolve_expiry = (expires: DailyChallengeExpires) => {
    return `date_add(CURDATE(), interval 24*60*60 + 0 second)`;
    // return `DATE_ADD(${!expires.start_time ? "CURRENT_TIMESTAMP()" : `TIMESTAMP(DATE_FORMAT(CONCAT(CURDATE(), ' 00:00:00'), '%m/%d/%Y %H:%i:%s'))`}, interval ${expires.num_time_increments} ${expires.time_increment})`;
};
/** If id & value, or id & complete are not null, update either the fields value or complete of a quest record given by id,
 *   otherwise, create a new record.
 */
export default function (db: ConnectPromise): (user_id: string, consumed_challenge: DailyChallengeProps, value?: number, id?: number, complete?: boolean) => Promise<void> {
    return async (user_id: string, consumed_challenge: DailyChallengeProps, value?: number, id?: number, complete?: boolean): Promise<void> => {
        await db.query(`
            INSERT INTO quests(${ id == null ? "" : "id, " }owner, quest_name, expires_on, command_name${ value == null ? "" : ", value" }${ complete == null ? "" : ", complete" })
             VALUES(${ id == null ? "" : `${ id }, ` }"${ user_id }", "${ consumed_challenge.name }", ${ resolve_expiry(consumed_challenge.expires) }, "${ consumed_challenge.command_name }"${ value == null ? "" : `, ${ value }` }${ complete == null ? "" : `, ${ complete ? 1 : 0 }` })
             ${ id == null && (value == null || complete == null) ? "" : `ON DUPLICATE KEY UPDATE ${ value != null ? `value = ${ value }` : `complete = ${ complete ? 1 : 0 }` }` };
        `);
    };
}
