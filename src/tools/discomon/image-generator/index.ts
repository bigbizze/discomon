import { DiscomonColours } from "../prng-generator/prng-discomon/discomon_action_handlers";
import get_formatted_hsl from "../../../helpers/discomon_helpers";
import { Vecco } from "../generic-types/vecco";
import draw_on_canvas from "../item-image-generator";
import { CanvasRenderingContext2D } from "canvas";
import { PrngBlockItemActionType } from "../block_runes";

function get_formatted_hsl_values(colours: DiscomonColours) {
    return {
        body_one: get_formatted_hsl(colours.body_colour_one),
        body_two: get_formatted_hsl(colours.body_colour_two),
        outline: get_formatted_hsl(colours.outline_colour)
    };
}

export function get_colour_switch(colours: DiscomonColours) {
    const { body_one, body_two, outline } = get_formatted_hsl_values(colours);
    return (state: number) => {
        switch (state) {
            case 0:
                return "rgba(0,0,0,0)";
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

interface ImageGeneratorMon {
    anchor_parent_position: Vecco;
    size: number;
    colours: DiscomonColours;
    num_blocks: number;
    cells: number[][];
    block_size: number;
}

export const OFFSET_AMOUNT = 0.5;
export default function image_generator(mon: ImageGeneratorMon, ctx: any, items: PrngBlockItemActionType[] | null = null) {
    const colour_switch = get_colour_switch(mon.colours);
    for (let x = 0; x < mon.num_blocks; x++) {
        for (let y = 0; y < mon.num_blocks; y++) {
            ctx.fillStyle = colour_switch(mon.cells[x][y]);
            ctx.fillRect(
                (mon.anchor_parent_position.x + x * mon.block_size) + OFFSET_AMOUNT,
                (mon.anchor_parent_position.y + y * mon.block_size) + OFFSET_AMOUNT,
                mon.block_size + OFFSET_AMOUNT,
                mon.block_size + OFFSET_AMOUNT
            );
        }
    }
    if (items) {
        items_around_mon({
            size: mon.size,
            anchor_parent_position: mon.anchor_parent_position
        }, items, 15, ctx);
    }
}

export interface ImageMon {
    anchor_parent_position: Vecco;
    size: number;
}

export function items_around_mon(mon: ImageMon, items: PrngBlockItemActionType[], quad_size: number, ctx: CanvasRenderingContext2D, count: number = 0): void {
    if (count === items.length) {
        return;
    }
    const xy = { x: 0, y: 0 };

    switch (count) {
        case 2:
            xy.x = mon.anchor_parent_position.x + mon.size;
            xy.y = mon.anchor_parent_position.y + 40 + mon.size / 2 + 10;
            break;
        case 1:
            xy.x = mon.anchor_parent_position.x + mon.size / 2 - quad_size;
            xy.y = mon.anchor_parent_position.y + 40 + mon.size / 2 + 10; // mon.anchor_parent_position.y - disc - quad_size * 2.5;
            break;
        default:
            xy.x = mon.anchor_parent_position.x - quad_size * 2;
            xy.y = mon.anchor_parent_position.y + 40 + mon.size / 2 + 10;
            break;
    }
    draw_on_canvas(items[count], quad_size, ctx, xy.x, xy.y, 0, 2);
    return items_around_mon(mon, items, quad_size, ctx, count + 1);
}
