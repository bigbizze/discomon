import get_formatted_hsl, { send_to_discord } from "../helpers/discomon_helpers";
import { Message, MessageEmbed } from 'discord.js';
import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { map_db_boss_to_db_mon } from "../tools/discomon/image-generator/utils";
import { boss_profile_image } from "../tools/discomon/image-generator/embed_images";
import get_alphamon from "../tools/discomon/alpha_seed";
import get_db_connection, { withDb } from "../tools/client/get_db_connection";
import { get_first_db_row } from "../helpers/db_helpers";
import { logo } from "../helpers/general_helpers";

export default async function ({ discord, db_fns }: ClientOperator, message: Message): Promise<DefaultCommandsReturn> {
    if (message?.member?.id == null || discord?.user == null) {
        return;
    }
    const db_boss = await db_fns.get_boss();
    const mon_boss = get_alphamon(map_db_boss_to_db_mon(db_boss), "boss");
    const color = get_formatted_hsl(mon_boss.colours.body_colour_one);
    const boss_damage = await withDb<number>(async conn => {
        if (message?.member?.id == null || discord?.user == null) {
            return;
        }
        return get_first_db_row(await conn.query(`
            SELECT current_boss_damage from inventory
            where owner = "${ message.member.id }";
        `))?.current_boss_damage;
    });
    if (!boss_damage) {
        return;
    }
    const image = await boss_profile_image(db_boss, boss_damage);
    const filename = `${ Date.now() }.png`;

    const embed = new MessageEmbed()
        .setAuthor(message.member.displayName, logo)
        .setColor(color)
        .attachFiles([ { 'name': filename, 'attachment': image } ])
        .setImage(`attachment://${ filename }`);
    return send_to_discord(message.channel, { embed });
}
