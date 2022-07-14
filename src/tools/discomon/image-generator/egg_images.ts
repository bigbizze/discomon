import { alpha_mon_state, prng_alphamon } from "../alpha_seed/utils";
import get_formatted_hsl from "../../../helpers/discomon_helpers";
import { roll_single_stat } from "../alpha_seed/prng";
import { egg_colour_action } from "../prng-generator/prng-items/item_actions";
import { next_seed } from "../prng-generator/action_handlers";
import { image_buffer } from "./image_buffer";
import { CanvasRenderingContext2D } from "canvas";
import { get_canvas } from "./utils";
import { promise_then_catch } from "../../../helpers/general_helpers";

export async function grid_egg(ctx: CanvasRenderingContext2D, seed: string, _x: number, _y: number) {
    const size = 110;
    const pixel = size / 10;
    let c1;
    let c2;
    let oc;
    let _seed;
    if (seed === 'standard') {
        c1 = '#faeaaf';
        c2 = '#c2852b';
        oc = '#47300e';
        _seed = 100;
    } else {
        const prng_state = alpha_mon_state(seed);
        const mon = prng_alphamon(prng_state, 1);
        c1 = get_formatted_hsl(mon.colours.body_colour_one);
        c2 = get_formatted_hsl(mon.colours.body_colour_two);
        oc = get_formatted_hsl(mon.colours.outline_colour);
        _seed = prng_state.seeds.grid;
    }
    let y = _y;
    for (let x = 0; x < 4; x++) {
        const l_edge = _x + size / 2 - pixel * (x + 1);
        const r_edge = _x + size / 2 + pixel * x;
        ctx.fillStyle = oc;
        ctx.fillRect(l_edge, y, pixel, pixel);
        ctx.fillRect(r_edge, y, pixel, pixel);
        for (let b = l_edge + pixel; b < r_edge; b += pixel) {
            ctx.fillStyle = roll_single_stat(_seed, egg_colour_action.range[0]) > 70
                ? c2
                : c1;
            ctx.fillRect(b, y, pixel, pixel);
            _seed = next_seed(_seed);
        }
        y += 11;
    }
    for (let x = 3; x > 1; x--) {
        const l_edge = _x + size / 2 - pixel * (x + 1);
        const r_edge = _x + size / 2 + pixel * x;
        ctx.fillStyle = oc;
        ctx.fillRect(l_edge, y, pixel, pixel);
        ctx.fillRect(r_edge, y, pixel, pixel);
        for (let b = l_edge + pixel; b < r_edge; b += pixel) {
            ctx.fillStyle = roll_single_stat(_seed, egg_colour_action.range[0]) > 70
                ? c2
                : c1;
            ctx.fillRect(b, y, pixel, pixel);
            _seed = next_seed(_seed);
        }
        y += 11;
    }
    ctx.fillStyle = oc;
    ctx.fillRect(_x + size / 2 - pixel * 2, y, pixel, pixel);
    ctx.fillRect(_x + size / 2 + pixel, y, pixel, pixel);
    ctx.fillRect(_x + size / 2 - pixel, y, pixel, pixel);
    ctx.fillRect(_x + size / 2, y, pixel, pixel);
}


export async function draw_egg(seed: string) {
    // const canvas = node_canvas.createCanvas(110, 110);
    // const ctx = canvas.getContext('2d');
    const { canvas, ctx } = get_canvas(110, 110);
    promise_then_catch(grid_egg(ctx, seed, 0, 10));
    return await image_buffer(canvas);
}

const seeds = [
    '0D2CDD0D2CDC0D2CDB0D2CDA5C39EF0D2CD80D2CD70D2CD60D2CD50D2CD4',
    '0A04440A04430A04420A0441461DC00A043F0A043E0A043D0A043C0A043B',
    'standard'
];

if (require.main === module) {
    for (const seed of seeds) {
        draw_egg(seed);
    }
}
