// Dependencies
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import express from 'express';
import crypto from 'crypto';
import * as bodyParser from 'body-parser';
import get_db_connection from "./tools/client/get_db_connection";
import DBL from "dblapi.js";
import user_exists from "./tools/database/user_exists";
import increment_inventory from "./tools/database/increment_inventory";
import get_premium from "./tools/database/get_premium";
import { get_premium_tier } from "./tools/misc/premium_tiers";
import { date_to_mysql } from "./helpers/date_helpers";

require('dotenv').config();

const app = express();

// Certificate
const key = fs.readFileSync('/etc/letsencrypt/live/discomonapi.xyz/privkey.pem', 'utf8');
const cert = fs.readFileSync('/etc/letsencrypt/live/discomonapi.xyz/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/discomonapi.xyz/chain.pem', 'utf8');

const credentials = {
    key,
    cert,
    ca
};
app.use(bodyParser.text({ type: '*/*' }));
// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

// DBL
if (process?.env?.DBL_TOKEN == null) {
    throw new Error();
}
const dbl = new DBL(process.env.DBL_TOKEN, {
    webhookAuth: process.env.WEBHOOK_USERNAME,
    webhookServer: httpServer
});


export type PatreonTiers = "none" | "epic" | "mythic" | "legendary";

interface PatreonPledge {
    patron_id: number;
    patron_full_name: string;
    patron_email: string;
    patron_discord: string;
    charge_status: string;
    tier: PatreonTiers;
}

type PatreonEvent = 'members:pledge:create' | 'members:pledge:update' | 'members:pledge:delete' | string | undefined;

if (dbl.webhook) {
    dbl.webhook.on('ready', hook => {
        console.log(`Webhook running with path ${ hook.path }`);
    });

    dbl.webhook.on('vote', async hook => {
        console.log(`User with ID ${ hook.user } just voted!`);
        const db = await get_db_connection();
        if (await user_exists(db)(hook.user)) {
            const user_premium = await get_premium(db)(hook.user);
            const { vote_credit_multiplier } = get_premium_tier(user_premium);
            const amount = Math.round(200 * vote_credit_multiplier);
            await increment_inventory(db)(hook.user, 'credits', amount);
            console.log(`${ hook.user } received ${ amount } cash for voting.`);
        }
        await db.end();
    });
}


app.post('/patreonwebhook', async (req, res) => {
    const webhookSecret = 'HW4wWMVa3BBwlhP9xWFDkHKgNB7qIsoNzn_KrMD5Fb4MajzjDysZ_fG1I19_CHOe';

    const hash = crypto.createHmac('md5', webhookSecret).update(req.body).digest('hex');
    const success = (req.header('x-patreon-signature') === hash);

    if (!success) {
        return 400;
    }

    const event_type = req.header('x-patreon-event');
    const pledge_data = JSON.parse(req.body);

    if (!pledge_data) {
        return console.log('no request body');
    }

    const data = pledge_data.data;
    const payment = data.attributes.last_charge_status;
    const included = pledge_data.included;
    for (let i = 0; i < included.length; i++) {
        console.log(included[i]);
    }
    const pledge: PatreonPledge = {
        patron_id: included[1].id,
        patron_full_name: included[1].attributes.full_name,
        patron_email: included[1].attributes.email
            ? included[1].attributes.email
            : 'none',
        patron_discord: included[1].attributes.social_connections.discord
            ? included[1].attributes.social_connections.discord.user_id
            : "none",
        charge_status: payment,
        tier: (included[2]
            ? included[2].attributes.title
                ? included[2].attributes.title.toLowerCase()
                : 'none'
            : 'none')
    };

    const db = await get_db_connection();
    const exists_row = await db.query(`SELECT * FROM patreon WHERE patron_id = ${ pledge.patron_id }`);
    const exists = !exists_row || exists_row.length <= 0 ? false : true;
    console.log(`user exists already: ${ exists }`);
    const query = resolve_patreon_query(event_type, { ...pledge }, exists);
    if (!query) {
        return console.log('incorrect pledge type');
    }
    await db.query(`${ query }`);
    console.log('pledge should_effect_fire updated');
    await db.end();
    return res.status(success ? 200 : 400).json({ result: success });
});

httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

function resolve_patreon_query(event: PatreonEvent, p: PatreonPledge, exists: boolean): string | undefined {
    switch (event) {
        case 'members:pledge:create':
            if (!exists) {
                return `
                    INSERT INTO patreon(patron_id, discord_id, name, tier, charge_status, paid_on) 
                    VALUES(${ p.patron_id }, "${ p.patron_discord }", "${ p.patron_full_name }", "${ p.tier }", "${ p.charge_status }", "${ date_to_mysql() }")
            `;
            } else {
                return `
                    UPDATE patreon SET tier = "${ p.tier }", discord_id = "${ p.patron_discord }", charge_status = "${ p.charge_status }", paid_on = "${ date_to_mysql() }" 
                    WHERE patron_id = ${ p.patron_id }
            `;
            }
        case 'members:pledge:update':
            return `
                UPDATE patreon SET tier = "${ p.tier }", discord_id = "${ p.patron_discord }", charge_status = "${ p.charge_status }", paid_on = "${ date_to_mysql() }" 
                WHERE patron_id = ${ p.patron_id }
            `;
        case 'members:pledge:delete':
            return `
                UPDATE patreon SET tier = "none", charge_status = "cancelled"
                WHERE patron_id = ${ p.patron_id }
             `;
        default:
            return;
    }
}
