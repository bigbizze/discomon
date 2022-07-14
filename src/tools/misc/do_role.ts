import { Client } from 'discord.js';

const app_root = require("app-root-path");

const resolve_path_for_eval = (module_path: string) => {
    const module = `${ app_root.path }${ module_path }`;
    return module.replace(/\\/g, "/");
};

/** broadcasting code to evaluate across all sharded discord bot instances of the server */
export default async function do_roles(ext_id: string | undefined, discord: Client) {
    if (ext_id == null) {
        return;
    }
    await discord?.shard?.broadcastEval(`(async shard => {
        const get_db_connection = require(\`${ resolve_path_for_eval("/prod/tools/client/get_db_connection.js") }\`).default;
        const get_active_mon = require(\`${ resolve_path_for_eval("/prod/tools/database/get_active_mon.js") }\`).get_active_mon;
        const get_alphamon = require(\`${ resolve_path_for_eval("/prod/tools/discomon/alpha_seed/index.js") }\`).default;
        try {
            const guild = this.guilds.cache.get('694030682254475315');
            if (!guild) {
                return;
            }
            const member = guild.members.cache.get("${ ext_id }");
            if (!member) {
                return;
            }
            const conn = await get_db_connection();
            const db_mon = await get_active_mon(conn)("${ ext_id }");
            await conn.end();
            if (!db_mon) {
                return;
            }
            let mon;
            if (db_mon) {
                mon = get_alphamon(db_mon, 'user');
            } else {
                mon = false;
            }
            if (!mon) {
                return;
            }
            member.roles.cache.each(async role => {
                if (role.name.includes('Level') && member && member.roles) {
                    await member.roles.remove(role);
                }
            });
            const new_role = member.guild.roles.cache.find(role => role.name === 'Level ' + mon.level);
            if (new_role) {
                await member.roles.add(new_role);
            }
        } catch (e) {
            console.log(e, "error tho");
        }
    })()`);
}
