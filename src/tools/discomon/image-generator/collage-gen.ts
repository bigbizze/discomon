import { Colour } from "../generic-types/colour";
import * as cc from 'color-convert';
import { DiscomonColours } from "../prng-generator/prng-discomon/discomon_action_handlers";
import { MonState } from "../../../scaffold/type_scaffolding";
import DeltaE from 'delta-e';
import PureImage from "pureimage";
import { get_colour_switch } from "./index";
import { createWriteStream, writeFileSync } from "fs";
import { very_randint } from "../../../helpers/rng_helpers";
import { get_mon_img } from "./get-mon-image";
import get_alphamon, { get_alpha_db } from "../alpha_seed";

function get_formatted_hsl({ hue, lum, sat }: Colour): { h: number, s: number, l: number, a: number } {
    return { h: hue, l: lum, s: sat, a: 1 };
}

function get_formatted_hsl_values(colours: DiscomonColours) {
    return {
        body_one: get_formatted_hsl(colours.body_colour_one),
        body_two: get_formatted_hsl(colours.body_colour_two),
        outline: get_formatted_hsl(colours.outline_colour)
    };
}

function get_colour_switch_hsl(colours: DiscomonColours) {
    const { body_one, body_two, outline } = get_formatted_hsl_values(colours);
    return (state: number) => {
        switch (state) {
            case 0:
                return { h: 0, s: 0, l: 100, a: 0 };
            case 1:
                return body_one;
            case 2:
                return outline;
            case 3:
                return body_two;
            default:
                return body_one;
        }
    };
}

function to_lab(colour: Colour, is_array?: true): [ number, number, number ];
function to_lab(colour: Colour, is_array: boolean = false) {
    const [ L, A, B ] = cc.hsl.lab([ colour.hue, colour.sat, colour.lum ]);
    if (is_array) {
        return [ L, A, B ];
    }
    return { L, A, B };
}

const render = (
    ctx: any,
    mon: MonState,
    x_offset: number,
    y_offset: number
) => {
    const colour_switch = get_colour_switch(mon.colours);
    for (let x = 0; x < mon.num_blocks; x++) {
        for (let y = 0; y < mon.num_blocks; y++) {
            ctx.fillStyle = colour_switch(mon.cells[x][y]);
            ctx.fillRect(
                (mon.anchor_parent_position.x + x * mon.block_size) + x_offset,
                (mon.anchor_parent_position.y + y * mon.block_size) + y_offset,
                mon.block_size,
                mon.block_size
            );
        }
    }
};

const is_not_similar_enough = (colours: DiscomonColours, to_match_lab: { L: number, A: number, B: number }) => [
    DeltaE.getDeltaE94(to_lab(colours.body_colour_one), to_match_lab),
    DeltaE.getDeltaE94(to_lab(colours.body_colour_two), to_match_lab),
    DeltaE.getDeltaE94(to_lab(colours.outline_colour), to_match_lab)
].reduce((a, b) => a + b) / 3;

const get_img_until_colour = async (to_match: Colour, similarity: number): Promise<MonState> => {
    let db_props = get_alpha_db(very_randint(), 1111);
    let new_mon = get_alphamon(db_props, "user");
    let [ L, A, B ] = to_lab(to_match, true);
    while (is_not_similar_enough(new_mon.colours, { L, A, B }) > similarity) {
        db_props = get_alpha_db(very_randint(), 1111);
        new_mon = get_alphamon(db_props, "user");
        [ L, A, B ] = to_lab(to_match, true);
    }
    return new_mon;
};

const find_collage_items_for_mon = async (mon: MonState, fn: string, similarity: number = 30) => {
    const buffer = await get_mon_img(mon);
    writeFileSync("C:\\Users\\Charles\\source\\WebstormProjects\\Discomon_03\\src\\tools\\discomon\\image-generator\\test-image-start.png", buffer);
    const sized = mon.num_blocks * mon.block_size;
    const canvas = PureImage.make(sized * mon.num_blocks, sized * mon.num_blocks);
    const ctx = canvas.getContext('2d');
    const colour_switch = get_colour_switch_hsl(mon.colours);
    let x_offset = 0;
    for (let cell_row of mon.cells) {
        if (x_offset % Math.ceil(mon.cells.length / 100) === 0) {
            console.log(`${ Math.round((x_offset / mon.cells.length) * 100) }%`);
        }
        let y_offset = 0;
        for (let cell of cell_row) {
            const { h, s, l } = colour_switch(cell);
            const rgb_sum = cc.hsv.rgb([ h, s, l ]).reduce((a, b) => a + b);
            if (rgb_sum !== 0 && rgb_sum !== 765) {
                const result = await get_img_until_colour({ hue: h, sat: s, lum: l }, similarity);
                render(ctx, result, x_offset * sized, y_offset * sized);
            }
            y_offset++;
        }
        x_offset++;
    }
    await PureImage.encodePNGToStream(canvas, createWriteStream(fn));
};

if (require.main === module) {
    const seed = very_randint();
    const db_props = get_alpha_db(seed, 3500);
    const mon = get_alphamon(db_props, "user");
    find_collage_items_for_mon(mon, "C:\\Users\\Charles\\source\\WebstormProjects\\Discomon_03\\src\\tools\\discomon\\image-generator\\test-image2.png", 30).then().catch(err => console.log(err));
}
