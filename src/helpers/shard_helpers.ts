import { Client } from "discord.js";


export async function get_shard_name(discord: Client, user_id: string): Promise<string> {
    if (discord?.shard == null) {
        return 'unknown';
    }
    const name = (await discord?.shard?.broadcastEval(`
					(() => {
						let name = this.users.cache.get('` + user_id + `');
						if(!name){
							return false;
						}else{
							return name.username;
						}
					})();
					`)).reduce((a, b) => b ? b : a);
    if (name) {
        return name.replace(/[^a-zA-Z0-9 ]/g, "?");
    } else {
        return 'unknown';
    }
}

