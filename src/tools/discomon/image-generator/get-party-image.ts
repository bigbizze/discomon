import { PrngBlockItemActionType } from "../block_runes";
import { fnt } from "../item-image-generator";
import image_generator from "./index";
import { image_buffer } from "./image_buffer";
import { DbDiscomon } from "../../../scaffold/database_types";
import get_alphamon from "../alpha_seed";
import { get_canvas, get_name_size } from "./utils";
import get_formatted_hsl from "../../../helpers/discomon_helpers";

export async function get_party_img(
    party: DbDiscomon[],
    items: Array<PrngBlockItemActionType[] | null>,
    max_slots: number,
    active_slot: number | null = null
) {
    const dim_x = 70 + (180 * 3) + 80; // 110
    const dim_y = max_slots > 3 ? 400 : 190; // 110
    const { canvas, ctx } = get_canvas(dim_x, dim_y);
    fnt.loadSync();
    let x = 50;
    let y = 30;
    for (let i = 0; i < max_slots; i++) {
        const slot = (i + 1);
        const slot_string = slot.toString();
        const active_string = slot === active_slot ? ' - ACTIVE' : '';
        const text = slot_string + active_string;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `22pt "thefont32"`;
        ctx.textAlign = "center";
        if (party[i]) {
            const mon = get_alphamon(party[i], "user");
            ctx.fillText(text, x + mon.size / 2, y - 10);
            image_generator({
                ...mon,
                anchor_parent_position: { x: x, y: y + 60 - mon.size / 2 }
            }, ctx, items[i]);
            ctx.fillStyle = '#FFFFFF';
            const abilitysize = get_name_size(mon.attributes.special.length, 0, 20);
            const passivesize = get_name_size(mon.attributes.passive.length, 0, 20);
            const nsize = get_name_size(mon.nickname.length, 15, 20);
            ctx.textAlign = 'left';
            ctx.font = `${ abilitysize }pt "thefont32"`;
            ctx.fillText(`LVL ${ mon.level.toString() }`, x + 90, y + 40);
            ctx.fillText(mon.attributes.special, x + 90, y + 60);
            ctx.font = `${ passivesize }pt "thefont32"`;
            ctx.fillText(mon.attributes.passive, x + 90, y + 80);
            ctx.textAlign = "center";
            ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_one);
            ctx.font = `${ nsize }pt "thefont32"`;
            ctx.fillText(mon.nickname, x + 40, y + 15);
        } else {
            ctx.fillText(text, x + 80, y - 10);
            ctx.fillText('empty', x + 80, y + 30);
        }
        x += 220; // 120
        if (i > 0 && i % 3 === 2) {
            x = 50;
            y += 200;
        }
    }
    return await image_buffer(canvas);
}
