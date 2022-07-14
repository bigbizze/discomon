import { MonState } from "../../../scaffold/type_scaffolding";
import { PrngBlockItemActionType } from "../block_runes";
import image_generator from "./index";
import { image_buffer } from "./image_buffer";
import { get_canvas } from "./utils";

export async function get_mon_img(
    mon: MonState,
    items: PrngBlockItemActionType[] | null = null
) {
    const disc = items ? 50 : 0;
    const { canvas, ctx } = get_canvas(110 + disc, 120);
    image_generator({
        ...mon,
        anchor_parent_position: { x: canvas.width / 2 - mon.size / 2, y: 40 - mon.size / 2 }
    }, ctx, items);
    return await image_buffer(canvas);
}
