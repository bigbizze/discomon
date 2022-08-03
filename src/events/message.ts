import { Message } from 'discord.js';
import { ClientOperator, UnresolvedClientOperator } from "../bot-types";
import { Command, CommandsMap, DefaultCommandsReturn } from "../commands";
import get_db_connection, { withDb } from "../tools/client/get_db_connection";
import { ResolvedDbFns } from "../tools/database";
import get_server_option from "../tools/database/get_server_option";
import { date_string } from "../helpers/date_helpers";
import get_spam_cache from "../tools/client/spam-cache";
import do_quests from "../tools/quests";
import { check_not_null_props } from "../helpers/discomon_helpers";
import discomon_prefix, { get_guild_prefix } from "./guild-and-prefix";

const bans = [ '733603242814210101', '714786338888744980', '715384311380967486', '745914344843509793' ];

const LIMIT = 5;
const PER_SECONDS = 15;

const resolve_command_name = (commands: CommandsMap, command?: string): Command | undefined => {
    if (command && commands.hasOwnProperty(command)) {
        return command as Command;
    }
};

export function message(client: UnresolvedClientOperator) {
    const is_user_spamming = get_spam_cache(LIMIT, PER_SECONDS);
    return async (message: Message): Promise<DefaultCommandsReturn> => {
        // Ignore all bots
        if (message.author.bot) {
            return;
        }
        if (!message.member) {
            return console.log('no message member');
        }
        const not_null_check = check_not_null_props(message, client.discord);
        if (not_null_check == null) {
            return await message.channel.send("**User, channel or guild effect not exist or we were unable to find it!**");
        }
        if (message.content.startsWith(".discomon-prefix")) {
            return await discomon_prefix(not_null_check.discord, not_null_check.message, message.content.replace(".discomon-prefix", ""));
        }
        const prefix = await get_guild_prefix(client, message);
        // Ignore messages not starting with the prefix (in config.json)
        if (!message.content.startsWith(prefix)) {
            return;
        }
        // Our standard argument/command name definition.
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const first_arg = args.shift();
        if (first_arg == null) {
            return;
        }

        const command = resolve_command_name(client.commands, first_arg.toLowerCase());
        if (!command) {
            return;
        }
        if (bans.includes(message.member.id)) {
            console.log(`banned user trying to use commands.`);
            return await message.channel.send(`**You are banned from Discomon.**`);
        }
        const spam_timeout = is_user_spamming(message.member.id);
        if (spam_timeout) {
            return await message.channel.send(`**You are sending commands too quickly! You have sent ${ (spam_timeout + 1) - LIMIT } more commands than you are allowed to in the last ${ PER_SECONDS } seconds!**`);
        }
        console.log(`${ date_string('yyyy/MM/dd HH:mm:ss') } :: ${ first_arg } ${ args } | ${ message.member.displayName } ${ message.member.id }`);
        await withDb(async conn => {
            const server_options = await get_server_option(conn)("reboot", "reboot_reason");
            if (server_options.reboot && command !== 'reboot') {
                return await message.channel.send(`\`${ server_options.reboot_reason }\``);
            }
            const client_arg: ClientOperator = {
                ...client,
                discord: not_null_check.discord,
                db_fns: Object.entries(client.db_fns).reduce((obj, v) => ({
                    ...obj,
                    [v[0]]: v[1](conn)
                }), {} as ResolvedDbFns)
            };
            const command_result = await client.commands[command](client_arg, not_null_check.message, ...args);
            if (command_result) {
                await do_quests(command, client_arg, not_null_check.message, command_result);
            }
        });
    };
}
