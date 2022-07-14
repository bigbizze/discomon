import { MonState } from "../../../scaffold/type_scaffolding";
import get_formatted_hsl, { get_item_values } from "../../../helpers/discomon_helpers";
import image_generator from "./index";
import { item_from_db } from "../item-image-generator";
import { image_buffer } from "./image_buffer";
import { clamp, get_canvas } from "./utils";
import prng_item from "../prng-generator/prng-items";
import { DbItem } from "../../../scaffold/database_types";
import { item_rarity_colour_switch } from "../../database/open_lootbox";

export async function get_mon_profile_img(
    mon: MonState,
    items: DbItem[]
) {
    const kdr = mon.losses === 0
        ? mon.wins
        : (mon.wins / mon.losses).toFixed(2);
    const real_items = items.map(x => prng_item(x.id, x.seed, x.rarity, null));
    const item_stats = get_item_values(real_items);
    const vectors = items.map(x => item_from_db(x));
    const dimy = items.length !== 0 ? 215 : 160;
    const { canvas, ctx } = get_canvas(400, dimy);
    const xp_vals = mon.level >= 18 ? { now: 'MAX', next: 'MAX' } : { now: mon.experience, next: mon.xp_to_next_level };
    image_generator({ ...mon, anchor_parent_position: { x: 70 - mon.size / 2, y: 80 - mon.size / 2 } }, ctx, vectors);
    ctx.textAlign = "left";
    const namesize = clamp(20 / mon.nickname.length * 10, 0, 20);
    ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_one);
    ctx.font = `${ namesize }pt "thefont32"`;
    ctx.fillText(`${ mon.nickname }`, 0, 15);
    ctx.font = `15pt "thefont32"`;
    ctx.fillText(`type: `, 180, 40);
    ctx.fillText(`level: `, 180, 55);
    ctx.fillText(`exp: `, 180, 70);
    ctx.fillText(`hp: `, 180, 100);
    ctx.fillText(`damage: `, 180, 115);
    ctx.fillText(`sp.chance: `, 180, 130);
    ctx.fillText(`special: `, 180, 145);
    ctx.fillText(`passive: `, 180, 160);
    ctx.fillStyle = `#FFFFFF`;
    ctx.fillText(`${ mon.type }`, 270, 40);
    ctx.fillText(`${ mon.level }`, 270, 55);
    ctx.fillText(`${ xp_vals.now } / ${ xp_vals.next }`, 270, 70);
    ctx.fillText(`${ mon.stats.hp }  +${ item_stats.hp }%`, 300, 100);
    ctx.fillText(`${ mon.stats.damage }  +${ item_stats.damage }%`, 300, 115);
    ctx.fillText(`${ mon.stats.special_chance }%  +${ item_stats.special_chance }`, 300, 130);
    ctx.fillText(`${ mon.attributes.special }`, 300, 145);
    ctx.fillText(`${ mon.attributes.passive }`, 300, 160);
    ctx.font = `12pt "thefont32"`;
    ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_two);
    ctx.fillText(`w: `, 180, 10);
    ctx.fillText(`l: `, 240, 10);
    ctx.fillText(`wlr: `, 300, 10);
    ctx.fillStyle = `#FFFFFF`;
    ctx.fillText(`${ mon.wins }`, 195, 10);
    ctx.fillText(`${ mon.losses }`, 255, 10);
    ctx.fillText(`${ kdr }`, 335, 10);
    // item text
    const item_strings = [];
    const colors = [];
    for (let item of items) {
        if (item.slot) {
            const index = item.slot - 1;
            item_strings[index] = `${ real_items[items.indexOf(item)].type } ${ real_items[items.indexOf(item)].value }`;
            colors[index] = item_rarity_colour_switch(real_items[items.indexOf(item)].rarity);
        }
    }
    for (let i = 0; i < 3; i++) {
        if (!item_strings[i]) {
            item_strings[i] = 'none';
        }
        if (!colors[i]) {
            colors[i] = '#FFFFFF';
        }
    }
    ctx.fillStyle = colors[0];
    ctx.fillText(` 1: ${ item_strings[0] }`, 0, 175);
    ctx.fillStyle = colors[1];
    ctx.fillText(`2: ${ item_strings[1] }`, 0, 190);
    ctx.fillStyle = colors[2];
    ctx.fillText(`3: ${ item_strings[2] }`, 0, 205);
    return await image_buffer(canvas);
}
