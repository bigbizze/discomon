import { DbSeed } from "../../../scaffold/database_types";
import { registerFont } from 'canvas';
import { get_shard_name } from "../../../helpers/shard_helpers";
import image_generator from "./index";
import get_formatted_hsl from "../../../helpers/discomon_helpers";
import { dex_date } from "../../../helpers/date_helpers";
import { image_buffer } from "./image_buffer";
import { Client } from "discord.js";
import { clamp, get_canvas } from "./utils";
import get_alphamon, { get_alpha_db } from "../alpha_seed";
import { hex_seed_2_dex_seed } from "../alpha_seed/utils";

export async function get_dex_image(page: DbSeed[], discord: Client) {
    registerFont('Imagine_Font.ttf', { family: 'thefont32' });
    const { canvas, ctx } = get_canvas(570, 480);
    // const canvas = node_canvas.createCanvas(570, 480);
    // const ctx = canvas.getContext('2d');
    let counter = 0;
    let x = 0;
    let y = 0;
    for (let i = 0; i < 3; i++) {
        y = 160 * i;
        for (let j = 0; j < 3; j++) {
            x = 190 * j;
            if (page[counter]) {
                const db_mon = get_alpha_db(page[counter].seed);
                const mon = get_alphamon(db_mon, "user");
                const _registration = `#${ hex_seed_2_dex_seed(db_mon.seed, mon.type) }`;
                const discovered = await get_shard_name(discord, page[counter].discovered_by);
                image_generator({ ...mon, anchor_parent_position: { x: x, y: y } }, ctx);
                ctx.fillStyle = '#FFFFFF';
                const seedsize = clamp(11 / _registration.length * 10, 5, 20);
                ctx.font = `${ seedsize }pt "thefont32"`;
                ctx.fillText(`${ _registration }`, x + 90, y + 20);
                ctx.font = `15pt "thefont32"`;
                ctx.fillText(`${ mon.attributes.special }`, x + 90, y + 35);
                ctx.fillText(`${ mon.attributes.passive }`, x + 90, y + 50);
                const namesize = clamp(15 / page[counter].global_name.length * 10, 8, 23);
                ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_one);
                ctx.font = `${ namesize }pt "thefont32"`;
                ctx.fillText(`${ page[counter].global_name }`, x, y + 100);
                const discsize = clamp(15 / discovered.length * 10, 10, 20);
                ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_two);
                ctx.font = `${ discsize }pt "thefont32"`;
                ctx.fillText(`by ${ discovered }`, x, y + 123);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `15pt "thefont32"`;
                ctx.fillText(`${ dex_date(page[counter].discovered_date) }`, x, y + 145);
            }
            counter++;
        }
    }
    return await image_buffer(canvas);
}
