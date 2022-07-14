import { BOT_TOKEN } from "./tools/discord/bot_token";

require("../load-env");

import commands from './commands';
import register_events from './events';
import { Client } from "discord.js";
import DBLAPI from "dblapi.js";
import db_fns, { ResolvedDbFns } from './tools/database';
import get_db_connection from "./tools/client/get_db_connection";
import { ClientOperator } from "./bot-types";
import { check_discord_client_user_not_null, DiscordNotNull } from "./helpers/discomon_helpers";
import { registerFont } from "canvas";

/** main bot entry file */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

registerFont('Imagine_Font.ttf', { family: 'thefont32' });

function dbl(discord: Client) {
    if (!process.env.DBL_TOKEN) {
        throw new Error("Problem with .env file!");
    }
    const dbl = new DBLAPI(process?.env?.DBL_TOKEN, discord);
    dbl.on("posted", () => console.log('Server count posted!'));
    dbl.on("error", err => console.log(err));
}


export const get_client_obj = async (): Promise<ClientOperator> => {
    const discord = await get_and_init_discord_client();
    const db_connection = await get_db_connection();
    if (BOT_TOKEN == null || process?.env?.BOT_PREFIX == null) {
        throw new Error("Problem with .env file!");
    }
    return {
        discord,
        commands,
        db_fns: Object.entries(db_fns).reduce((obj, v) => ({
            ...obj,
            [v[0]]: v[1](db_connection)
        }), {} as ResolvedDbFns),
        prefix: process.env.BOT_PREFIX,
        battles: {
            servers: {},
            channels: {},
            players: {}
        },
        logo: '<:Logo:711829261815644171>'
    };
};


export default async function get_and_init_discord_client(): Promise<DiscordNotNull> {
    const discord = new Client();
    if (!process?.env?.DEV_MODE) {
        await dbl(discord);
    }
    return check_discord_client_user_not_null(discord) as DiscordNotNull;
}


get_and_init_discord_client()
    .then(async discord => {
        if (BOT_TOKEN == null || process?.env?.BOT_PREFIX == null) {
            throw new Error("Problem with .env file!");
        }
        await register_events({
            discord,
            commands,
            db_fns,
            prefix: process.env.BOT_PREFIX,
            battles: {
                servers: {},
                channels: {},
                players: {}
            },
            logo: '<:Logo:711829261815644171>'
        });
        await discord.login(BOT_TOKEN);
    })
    .then(() => console.log("Discomon Bot Started"))
    .catch(err => console.log(err));
