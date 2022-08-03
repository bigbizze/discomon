import { UnresolvedClientOperator } from "../bot-types";
import { Guild, Message } from "discord.js";
import { date_to_mysql } from "../helpers/date_helpers";
import { differenceInWeeks } from "date-fns";
import { ConnectPromise, withDb } from "../tools/client/get_db_connection";
import { promise_then_catch } from "../helpers/general_helpers";
import { DiscordNotNull, get_discord_sender, MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import { DefaultCommandsReturn } from "../commands";
import { first } from "../helpers/array_helpers";
import send_help_embed from "../tools/discord/send_help_embed";
import user_exists from "../tools/database/user_exists";
import { escape_string } from "../helpers/db_helpers";

type GuildCacheItem = {
    prefix: string
    last_sql_update: Date
};

const get_guild_commands = () => {
    return {
        initialize_cache: async (cache: Map<string, GuildCacheItem>) => {
            await withDb(async conn => {
                const rows = await conn.query(`SELECT id,prefix,last_updated FROM guilds;`) as { id: string, prefix: string, last_updated: Date }[];
                // await conn.end();
                for (let { id, prefix, last_updated } of rows) {
                    cache.set(id, {
                        prefix,
                        last_sql_update: last_updated
                    });
                }
            });
        },
        update_or_insert_guild: async (guild: Guild, conn?: ConnectPromise | null, new_prefix?: string) => {
            const name = guild.name && guild.name !== "" ? guild.name : "null";
            const locale = guild.preferredLocale && guild.preferredLocale !== "" ? guild.preferredLocale : "null";
            const num_text_channels = guild.channels.cache.filter((x: any) => x?.type && x.type === "text").size;
            const last_sql_update = new Date();
            await withDb(async conn => {
                await conn.query(`
                INSERT INTO guilds (id, owner, shard_id, name, locale, num_members, num_text_channels${ new_prefix ? `, prefix` : "" }, last_updated)
                 VALUES("${ guild.id }", "${ guild.ownerID }", ${ guild.shardID }, "${ escape_string(name) }", "${ locale }", ${ guild.memberCount }, ${ num_text_channels }${ new_prefix ? `, "${ escape_string(new_prefix) }"` : "" }, "${ date_to_mysql(last_sql_update) }")
                  ON DUPLICATE KEY UPDATE name="${ escape_string(name) }", num_members=${ guild.memberCount }, num_text_channels=${ num_text_channels }, last_updated="${ date_to_mysql(last_sql_update) }"${ new_prefix ? `, prefix="${ escape_string(new_prefix) }"` : "" }
            `);
            }, false, conn != null ? conn : undefined)
            return last_sql_update;
        }
    };
};

const guild_cache = (function setup_guild_cache() {
    const cache = new Map<string, GuildCacheItem>();
    const guild_commands = get_guild_commands();
    promise_then_catch(guild_commands.initialize_cache(cache));
    return {
        get_prefix: async (guild: Guild) => {
            if (!cache.has(guild.id)) {
                const last_sql_update = await guild_commands.update_or_insert_guild(guild, null, process.env.BOT_PREFIX);
                cache.set(guild.id, {
                    last_sql_update,
                    prefix: process.env.BOT_PREFIX as string
                });
            }
            const cached_item = cache.get(guild.id) as GuildCacheItem;
            if (differenceInWeeks(new Date(), cached_item.last_sql_update) > 1) {
                await guild_commands.update_or_insert_guild(guild);
            }
            return cached_item.prefix;
        },
        update_prefix: async (conn: ConnectPromise, guild: Guild, prefix: string) => {
            const last_sql_update = await guild_commands.update_or_insert_guild(guild, conn, prefix);
            cache.set(guild.id, {
                last_sql_update,
                prefix
            });
        }
    };
})();

export async function get_guild_prefix(client: UnresolvedClientOperator, message: Message): Promise<string> {
    if (!process?.env?.BOT_PREFIX) {
        throw new Error("BOT_PREFIX not in .env!");
    }
    if (!message?.guild?.id) {
        return process.env.BOT_PREFIX;
    }
    const guild = await client.discord.guilds.fetch(message.guild?.id);
    return await guild_cache.get_prefix(guild);
}

export async function update_guild_prefix(conn: ConnectPromise, discord: DiscordNotNull, message: MessageNonNull, prefix: string) {
    const guild = await discord.guilds.fetch(message.guild?.id);
    await guild_cache.update_prefix(conn, guild, prefix);
}

export default async function discomon_prefix(discord: DiscordNotNull, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    const sender = get_discord_sender(message.channel);
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        return sender(`***You don't have permission to change the prefix...***`);
    }
    const first_arg = first(args)?.trim();
    if (first_arg === 'help') {
        return send_help_embed(
            message,
            'Type `.prefix <new prefix> to equip a rune to your active Discomon. This cannot contain any spaces.',
            'prefix',
            discord.user.avatarURL(),
            ".discomon-prefix $ :: .battle -> $battle "
        );
    }
    await withDb(async conn => {
        if (!await user_exists(conn)(message.member.id)) {
            await conn.end();
            return send_to_discord(message.channel, '❌`user has no Discomon.`');
        }
        if (!first_arg) {
            await conn.end();
            return sender("You didn't provide a new prefix to change to!");
        } else if (first_arg.length >= 8) {
            await conn.end();
            return sender("The prefix you supplied is too long! (Max 8 characters)");
        }
        await update_guild_prefix(conn, discord, message, first_arg);
        sender(`**Discomon prefix updated to** ***${ first_arg }***`);
    });
}
