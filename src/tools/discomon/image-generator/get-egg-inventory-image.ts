import { image_buffer } from "./image_buffer";
import { DbEgg } from "../../../scaffold/database_types";
import { grid_egg } from "./egg_images";
import { get_canvas } from "./utils";
import { promise_then_catch } from "../../../helpers/general_helpers";

export async function get_egg_img(
    eggs: DbEgg[]
) {
    const dim_x = (130 * 3); // 110
    const dim_y = eggs.length > 3 ? 270 : 130; // 110

    const { canvas, ctx } = get_canvas(dim_x, dim_y);
    let x = 10;
    let y = 30;
    for (let i = 0; i < eggs.length; i++) {
        const text = (i + 1).toString();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `20pt "thefont32"`;
        ctx.textAlign = "center";
        ctx.fillText(text, x + 110 / 2, y - 10);
        promise_then_catch(grid_egg(ctx, eggs[i].type, x, y));
        x += 130; // 120
        if (i > 0 && i % 3 === 2) {
            x = 10;
            y += 130;
        }
    }
    return await image_buffer(canvas);
}
