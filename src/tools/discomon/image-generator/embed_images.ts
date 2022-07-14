import { MonState, ShopItem } from "../../../scaffold/type_scaffolding";
import { fnt } from "../item-image-generator";
import { image_buffer } from "./image_buffer";
import { DbBoss, DbDiscomon } from "../../../scaffold/database_types";
import { get_canvas, get_name_size, map_db_boss_to_db_mon } from "./utils";
import get_formatted_hsl from "../../../helpers/discomon_helpers";
import image_generator from "./index";
import { addHours, differenceInMinutes } from "date-fns";
import cs from "./color_schemes";
import { BalStats, PlayerStats } from "../../database/get_profile_stats";
import get_alphamon from "../alpha_seed";
import { hex_seed_2_dex_seed } from "../alpha_seed/utils";
import { grid_egg } from "./egg_images";
import { promise_then_catch } from "../../../helpers/general_helpers";

const header_color = cs.text;
const price_color = cs.text;
const dust_color = cs.hl1;
const credit_color = cs.header;
const description_color = '#AAAAAA';

export async function get_shop_img(
    items: ShopItem[]
) {
    const credits_items = items.filter(x => x.currency === 'credits');
    const dust_items = items.filter(x => x.currency === 'dust');
    const dim_y = credits_items.length > dust_items.length
        ? credits_items.length * 40 + 60
        : dust_items.length * 40 + 60;

    const { canvas: credits_canvas, ctx: credits_ctx } = get_canvas(350, dim_y);
    const { canvas: dust_canvas, ctx: dust_ctx } = get_canvas(350, dim_y);
    fnt.loadSync();
    let x = 10;
    let y = 30;
    credits_ctx.fillStyle = header_color;
    credits_ctx.font = `20pt "thefont32"`;
    credits_ctx.fillText('CREDIT SHOP', x, y);
    y += 40;
    for (let i = 0; i < credits_items.length; i++) {
        credits_ctx.font = `15pt "thefont32"`;
        credits_ctx.fillStyle = credit_color;
        credits_ctx.fillText(`${ credits_items[i].name }:`, x, y);
        credits_ctx.fillStyle = price_color;
        credits_ctx.fillText(`${ credits_items[i].cost } credits`, x + 200, y);
        credits_ctx.font = `15pt "thefont32"`;
        credits_ctx.fillStyle = description_color;
        credits_ctx.fillText(`${ credits_items[i].description }`, x, y + 17);
        y += 40;
    }
    x = 10;
    y = 30;
    dust_ctx.fillStyle = header_color;
    dust_ctx.font = `20pt "thefont32"`;
    dust_ctx.fillText('DUST SHOP', x, y);
    y += 40;
    for (let i = 0; i < dust_items.length; i++) {
        dust_ctx.font = `15pt "thefont32"`;
        dust_ctx.fillStyle = dust_color;
        dust_ctx.fillText(`${ dust_items[i].name }:`, x, y);
        dust_ctx.fillStyle = price_color;
        dust_ctx.fillText(`${ dust_items[i].cost } dust`, x + 200, y);
        dust_ctx.font = `15pt "thefont32"`;
        dust_ctx.fillStyle = description_color;
        dust_ctx.fillText(`${ dust_items[i].description }`, x, y + 17);
        y += 40;
    }
    const credits_buffer = await image_buffer(credits_canvas);
    const dust_buffer = await image_buffer(dust_canvas);
    return { credits_img: credits_buffer, dust_img: dust_buffer };
}

export async function get_purchase_img(shopping: ShopItem) {
    const color = shopping.currency === 'credits'
        ? credit_color : dust_color;
    const ysize = 90;

    const { canvas, ctx } = get_canvas(250, ysize);
    // let canvas = node_canvas.createCanvas(250, ysize);
    // let ctx = canvas.getContext('2d');
    fnt.loadSync();
    const x = 5;
    const y = 10;
    ctx.font = `15pt "thefont32"`;
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('PURCHASE', x, y);
    ctx.fillStyle = color;
    ctx.fillText('Item:', x, y + 30);
    ctx.fillText('Amount:', x, y + 50);
    ctx.fillText('Cost:', x, y + 70);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(shopping.name, x + 100, y + 30);
    ctx.fillText(shopping.amount.toString(), x + 100, y + 50);
    ctx.fillText(`${ shopping.cost.toString() } ${ shopping.currency }`, x + 100, y + 70);
    return await image_buffer(canvas);
}

export async function boss_profile_image(boss: DbBoss, damage: number | null): Promise<Buffer> {
    const boss_db_mon = map_db_boss_to_db_mon(boss);
    const boss_mon = get_alphamon(boss_db_mon, "boss");
    const { canvas, ctx } = get_canvas(350, 210);
    // const canvas = node_canvas.createCanvas(350, 210);
    // const ctx = canvas.getContext('2d');
    fnt.loadSync();
    const b_color = get_formatted_hsl(boss_mon.colours.body_colour_one);
    ctx.fillStyle = b_color;
    ctx.font = `15pt "thefont32"`;
    ctx.textAlign = "center";
    ctx.fillText(boss_mon.nickname, 175, 10);
    ctx.textAlign = "left";
    ctx.fillStyle = '#FFFFFF';
    image_generator({ ...boss_mon, anchor_parent_position: { x: 135, y: 30 } }, ctx);
    ctx.fillStyle = b_color;
    ctx.fillText(`attempts:`, 10, 140);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${ boss.attempts }`, 155, 140);
    ctx.fillStyle = b_color;
    ctx.fillText(`hp:`, 10, 155);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${ boss.hp } / ${ boss.max_hp }`, 155, 155);
    ctx.fillStyle = b_color;
    const time_text = boss.hp === 0 ? 'rewards in:' : 'time left:';
    ctx.fillText(time_text, 10, 170);
    ctx.fillStyle = '#FFFFFF';
    const next_reset = addHours(boss.last_reset, 3);
    ctx.fillText(`${ differenceInMinutes(next_reset, Date.now()) } min`, 155, 170);
    ctx.fillStyle = b_color;
    if (damage !== null) {
        ctx.fillText(`your damage:`, 10, 185);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${ damage }`, 155, 185);
    }
    return image_buffer(canvas);
}


export async function key_value_image(input: PlayerStats | BalStats, name: string): Promise<Buffer> {
    const width = 'credits' in input ? 250 : 330;
    const { canvas, ctx } = get_canvas(width, 20 * Object.keys(input).length + 20);
    // const canvas = node_canvas.createCanvas(width, 20 * Object.keys(input).length + 20);
    // const ctx = canvas.getContext('2d');
    const horiz_disc = 'credits' in input ? 140 : 180;
    fnt.loadSync();
    const nsize = get_name_size(name.length, 20, 25);
    ctx.font = `${ nsize }pt "thefont32"`;
    ctx.fillStyle = cs.hl1;
    ctx.fillText(name, 10, 20);
    ctx.font = `15pt "thefont32"`;
    let y = 60;
    for (let key in input) {
        if (!input.hasOwnProperty(key)) {
            continue;
        }
        ctx.fillStyle = cs.header;
        ctx.fillText(`${ key }:`, 10, y);
        ctx.fillStyle = cs.text;
        ctx.fillText(input[key].toString(), horiz_disc, y);
        y += 15;
    }
    return await image_buffer(canvas);
}

export async function discover_image(mon: MonState, seed: string, mon_name: string, player_name: string): Promise<Buffer> {
    const mon_size = get_name_size(mon_name.length, 10, 20);
    const player_size = get_name_size(player_name.length + 3, 10, 20);

    const { canvas, ctx } = get_canvas(160, 160);
    // const canvas = node_canvas.createCanvas(160, 160);
    // const ctx = canvas.getContext('2d');
    fnt.loadSync();
    ctx.textAlign = "center";
    ctx.fillStyle = `#FFFFFF`;
    ctx.font = `12pt "thefont32"`;
    const _seed = hex_seed_2_dex_seed(seed, mon.type);
    ctx.fillText(`#${ _seed }`, 80, 20);
    ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_one);
    ctx.font = `${ mon_size }pt "thefont32"`;
    ctx.fillText(mon_name, 80, 40);
    ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_two);
    ctx.font = `${ player_size }pt "thefont32"`;
    ctx.fillText(`by ${ player_name }`, 80, 60);
    image_generator({ ...mon, anchor_parent_position: { x: 40, y: 70 } }, ctx);
    return await image_buffer(canvas);
}

export async function breed_image(p1: DbDiscomon, p2: DbDiscomon, egg_seed: string): Promise<Buffer> {
    const { canvas, ctx } = get_canvas(380, 130);
    // const canvas = node_canvas.createCanvas(380, 130);
    // const ctx = canvas.getContext('2d');
    fnt.loadSync();
    ctx.textAlign = "center";
    ctx.font = `30pt "thefont32"`;
    const _p1 = get_alphamon(p1, "user");
    const _p2 = get_alphamon(p2, "user");
    image_generator({ ..._p1, anchor_parent_position: { x: 0, y: 15 } }, ctx);
    ctx.fillStyle = `#FFFFFF`;
    ctx.fillText('+', 107.5, 65);
    image_generator({ ..._p2, anchor_parent_position: { x: 135, y: 15 } }, ctx);
    ctx.fillStyle = `#FFFFFF`;
    ctx.fillText('=', 242.5, 65);
    promise_then_catch(grid_egg(ctx, egg_seed, 270, 15));
    return await image_buffer(canvas);
}
