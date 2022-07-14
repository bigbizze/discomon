import express from 'express';
import http from 'http';
import DBL from 'dblapi.js';
import DBLAPI from 'dblapi.js';
import user_exists from "./tools/database/user_exists";
import increment_inventory from "./tools/database/increment_inventory";
import get_db_connection from "./tools/client/get_db_connection";

const runHooks = async () => {
    if (process?.env?.DBL_TOKEN == null) {
        throw new Error();
    }
    const app = express();
    const server = http.createServer(app);
    const dbl = new DBL(process.env.DBL_TOKEN, {
        webhookAuth: process.env.WEBHOOK_USERNAME,
        webhookServer: process.env.WEBHOOK_SERVERNAME
    });

    const conn = await get_db_connection();

    if (dbl.webhook) {
        dbl.webhook.on('ready', ({ path }: DBLAPI.ReadyEventArgs) => {
            console.log(`Webhook running with path ${ path }`);
        });
        dbl.webhook.on('vote', ({ user }: DBLAPI.VoteEventArgs) => {
            console.log(`User with ID ${ user } just voted!`);
            if (user_exists(conn)(user)) {
                increment_inventory(conn)(user, 'credits', 200);
                console.log(`${ user } received cash for votes.`);
            }
        });
        server.listen(5000, () => {
            console.log('Listening');
        });
    }
};

if (require.main === module) {
    runHooks().catch(console.error);
}

