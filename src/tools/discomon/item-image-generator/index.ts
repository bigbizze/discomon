import * as PureImage from 'pureimage';
import prng_item from "../prng-generator/prng-items";
import { get_rarity } from "../prng-generator/prng-items/item_action_handlers";
import { DbDiscomon, DbItem } from "../../../scaffold/database_types";
import { LootboxItem } from "../../../helpers/lootbox_helpers";
import { image_buffer } from "../image-generator/image_buffer";
import { get_canvas, get_name_size } from "../image-generator/utils";
import get_formatted_hsl from "../../../helpers/discomon_helpers";
import get_alphamon from "../alpha_seed";
import { CanvasRenderingContext2D } from 'canvas';
import { get_item_blocks, PrngBlockItemActionType } from "../block_runes";
import { draw_rune_to_canvas } from "../block_runes/image_subroutines";
import { promise_then_catch } from "../../../helpers/general_helpers";

require('dotenv').config();
///////////////////////////////////////////////////////////////////////////
export const item_colors = [ '#00000000', '#2190ff', '#b829ff', '#8cfc03', '#ff7423', "#C6302E" ]; // #C6302E" ['#00000000', '#2190ff', '#b829ff', '#7bff00', '#ff5500'];
export const fnt = PureImage.registerFont(`Imagine_Font.ttf`, 'thefont32');

///////////////////////////////////////////////////////////////////////////

export async function single_item_image(props: PrngBlockItemActionType, quad_size: number, text: 1 | 0 = 1): Promise<Buffer> {
    const { canvas, ctx } = get_canvas(quad_size * 2 + (quad_size * text), quad_size * 2 + quad_size * (text * 2));
    // const canvas = node_canvas.createCanvas(quad_size * 2 + (quad_size * text), quad_size * 2 + quad_size * (text * 2));
    // const ctx = canvas.getContext('2d');
    fnt.loadSync();
    ctx.textAlign = "center";
    draw_on_canvas(props, quad_size, ctx, (quad_size * text) / 2, 0, text);
    return await image_buffer(canvas);
}

///////////////////////////////////////////////////////////////////////////

export async function inventory_image(props: PrngBlockItemActionType[], quad_size: number, text: 1 | 0 = 1): Promise<Buffer> {
    const size = 20 + quad_size * 6 + (quad_size * (text * 2) * 3) + quad_size * 2;
    const { canvas, ctx } = get_canvas(size, size);
    let ymult = -1;
    for (let i = 0; i < 9; i++) {
        if (i % 3 === 0) {
            ymult += 1;
        }
        const x = quad_size * 1.5 + size / 3 * (i % 3);
        const y = 30 + ymult * (quad_size * 2 + quad_size * (text * 2) + quad_size);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `30pt "thefont32"`;
        ctx.textAlign = "center";
        const slot = i + 1;
        ctx.fillText(`${ slot }`, x + quad_size, y - 5);

        if (props[i]) {
            draw_on_canvas(props[i], quad_size, ctx, x, y, text);
        } else {
            ctx.fillText(`empty`, x + quad_size, y + quad_size * 1.5);
        }
    }
    return await image_buffer(canvas);
}

///////////////////////////////////////////////////////////////////////////

export default function draw_on_canvas(props: PrngBlockItemActionType, quad_size: number, _ctx: CanvasRenderingContext2D, _x = 0, _y = 0, text: 0 | 1 = 1, line_width: number = 3) {
    const item_colors = [ '#00000000', '#2190ff', '#b829ff', '#8cfc03', '#ff7423', "#C6302E" ];
    _ctx.strokeStyle = item_colors[props.state.rarity];
    _ctx.fillStyle = item_colors[props.state.rarity];
    _ctx.lineWidth = line_width;
    promise_then_catch(draw_rune_to_canvas(props, quad_size, _x, _y, _ctx));
    if (text) {
        _ctx.textAlign = "center";
        _ctx.fillStyle = item_colors[props.state.rarity];
        _ctx.font = props.item.rarity !== 4 ? `22pt "thefont32"` : `16pt "thefont32"`;
        const pct = props.item.type === 'modifier' ? '' : '%';
        const rarity = get_rarity(props.item.rarity).toUpperCase();
        const v_string = `${ props.item.value }${ pct }`;
        _ctx.fillText(rarity, _x + quad_size, _y + quad_size * 2 + 20);
        _ctx.font = `25pt "thefont32"`;
        _ctx.fillText(props.item.type.toUpperCase(), _x + quad_size, _y + quad_size * 2 + 40);
        _ctx.font = props.item.type !== 'modifier' ? `22pt "thefont32"` : `16pt "thefont32"`;
        _ctx.fillText(v_string, _x + quad_size, _y + quad_size * 2 + 60);
    }
}

/////////////

export async function item_equip_image(item: DbItem, mon: DbDiscomon, slot: number): Promise<Buffer> {
    const real_item = item_from_db(item);
    const real_mon = get_alphamon(mon, "user");
    const quad_size = 40;
    const { canvas, ctx } = get_canvas(150, 200);
    ctx.textAlign = "center";
    fnt.loadSync();
    ctx.fillStyle = get_formatted_hsl(real_mon.colours.body_colour_one);
    const name_size = get_name_size(real_mon.nickname.length, 5, 15);
    ctx.font = `${ name_size }pt "thefont32"`;
    ctx.fillText(mon.nickname, canvas.width / 2, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`slot: ${ slot }`, canvas.width / 2, 30);
    draw_on_canvas(real_item, quad_size, ctx, 35, 50, 1);
    return await image_buffer(canvas);
}

export async function db_inventory_image(inventory: DbItem[]) {
    const items: PrngBlockItemActionType[] = [];
    for (let i = 0; i < inventory.length; i++) {
        const the_item = prng_item(inventory[i].id, inventory[i].seed, inventory[i].rarity, null);
        const vectors = get_item_blocks(the_item);
        items.push(vectors);
    }
    return await inventory_image(items, 40);
}

export function item_from_db(item: DbItem) {
    const the_item = prng_item(item.id, item.seed, item.rarity, null);
    return get_item_blocks(the_item);
}

export const lootbox_item_image = async (loot_box: LootboxItem, quad_size: number = 40): Promise<Buffer> => {
    const image_params = loot_box.image_params;
    const w = quad_size * (image_params.length + 1) * 2 + quad_size * image_params.length;
    const h = quad_size * 4;
    const { canvas, ctx } = get_canvas(w, h);
    ctx.textAlign = "center";
    const y = 0;
    for (let i = 0; i < image_params.length; i++) {
        const x = (10 + (i + 1) * 10) + i * quad_size * 3;
        const the_item = prng_item(0, image_params[i].seed, image_params[i].rarity, null);
        const rune = get_item_blocks(the_item);
        draw_on_canvas(rune, quad_size, ctx, x, y, 1);
    }
    return await image_buffer(canvas);
};


