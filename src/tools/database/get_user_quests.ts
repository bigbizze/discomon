import { DbQuest } from "../../scaffold/database_types";


import { ConnectPromise } from "../client/get_db_connection";

//

export default function (db: ConnectPromise): (owner_id: string, command_name?: string | string[]) => Promise<DbQuest[]> {
    return async (owner_id: string, command_name?: string | string[]): Promise<DbQuest[]> => {
        if (owner_id == null) {
            return [];
        }
        const cmd_name = !command_name ? "" : !Array.isArray(command_name) ? ` AND command_name = "${ command_name }"` : ` AND (command_name = ${ command_name.map(x => `"${ x }"`).join(" or command_name = ") })`;
        return await db.query(`
            SELECT * FROM quests
             WHERE expires_on > CURRENT_TIMESTAMP() and owner = "${ owner_id }"${ !command_name ? "" : cmd_name };
        `);
    };
}
