import { MonState } from "../../../scaffold/type_scaffolding";
import { DbItem } from "../../../scaffold/database_types";
import { item_from_db } from "../item-image-generator";
import get_formatted_hsl from "../../../helpers/discomon_helpers";
import image_generator from "./index";
import { image_buffer } from "./image_buffer";
import { clamp, get_canvas } from "./utils";

export async function get_battle_img(
    mon1: MonState,
    mon2: MonState,
    items1: DbItem[] | null = null,
    items2: DbItem[] | null = null
) {
    const items_1 = items1?.map(x => item_from_db(x));
    const items_2 = items2?.map(x => item_from_db(x));
    const { canvas, ctx } = get_canvas(350, 150);
    ctx.textAlign = "center";
    const namesize_1 = clamp(15 / mon1.nickname.length * 10, 0, 20);
    ctx.font = `${ namesize_1 }pt "thefont32"`;
    ctx.fillStyle = get_formatted_hsl(mon1.colours.body_colour_one);
    ctx.fillText(mon1.nickname, canvas.width / 5, 20);

    const namesize_2 = clamp(15 / mon2.nickname.length * 10, 0, 20);
    ctx.font = `${ namesize_2 }pt "thefont32"`;
    ctx.fillStyle = get_formatted_hsl(mon2.colours.body_colour_one);
    ctx.fillText(mon2.nickname, canvas.width * (4 / 5), 20);

    ctx.font = `15pt "thefont32"`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('VS', canvas.width / 2, 70);

    image_generator({
        ...mon1,
        anchor_parent_position: { x: canvas.width / 5 - mon1.size / 2, y: 70 - mon1.size / 2 }
    }, ctx, items_1);
    image_generator({
        ...mon2,
        anchor_parent_position: { x: canvas.width * (4 / 5) - mon2.size / 2, y: 70 - mon2.size / 2 }
    }, ctx, items_2);
    return await image_buffer(canvas);
}
