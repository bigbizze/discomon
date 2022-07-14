require("../load-env");
import { BOT_TOKEN } from "./tools/discord/bot_token";
import { app_root_path } from "./constants";
import { ShardingManager } from 'discord.js';

/** main bot entry file */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const manager = new ShardingManager(`${ app_root_path }/prod/bot.js`, {
    totalShards: 'auto',
    token: BOT_TOKEN
});

manager.spawn(manager.totalShards, 5500, -1)
    .catch(console.error);

manager.on('shardCreate', (shard) => console.log(`Shard ${ shard.id } launched`));

