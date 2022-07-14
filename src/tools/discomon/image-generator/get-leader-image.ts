import { DbDiscomon } from "../../../scaffold/database_types";
import image_generator from "./index";
import get_formatted_hsl from "../../../helpers/discomon_helpers";
import { image_buffer } from "./image_buffer";
import { clamp, get_canvas } from "./utils";
import get_alphamon from "../alpha_seed";

export async function get_leader_image(leaders: DbDiscomon[], stat: string) {
    const { canvas, ctx } = get_canvas(570, 420);
    let counter = 0;
    let x = 0;
    let y = 0;
    for (let i = 0; i < 3; i++) {
        y = 140 * i;
        for (let j = 0; j < 3; j++) {
            x = 190 * j;
            if (leaders[counter]) {
                const mon = get_alphamon(leaders[counter], "user");
                image_generator({
                    ...mon,
                    anchor_parent_position: { x: x + 40 - mon.size / 2, y: y + 40 - mon.size / 2 }
                }, ctx);
                ctx.fillStyle = '#FFFFFF';
                const stat_string = stat === 'boss_damage' ? 'damage' : stat;
                const statsize = clamp(10 / stat_string.length * 10, 0, 25);
                ctx.font = `${ statsize }pt "thefont32"`;
                ctx.fillText(`${ stat_string }:`, x + 90, y + 35);
                const numbersize = clamp(10 / leaders[counter][stat].toString().length * 10, 0, 25);
                ctx.font = `${ numbersize }pt "thefont32"`;
                ctx.fillText(`${ leaders[counter][stat].toString() }`, x + 90, y + 55);
                const namesize = clamp(15 / leaders[counter].nickname.length * 10, 0, 25);
                ctx.fillStyle = get_formatted_hsl(mon.colours.body_colour_one);
                ctx.font = `${ namesize }pt "thefont32"`;
                ctx.fillText(`${ leaders[counter].nickname }`, x, y + 100);
                ctx.fillStyle = '#FFFFFF';
                const onamesize = clamp(25 / (leaders[counter].owner.length + 5) * 10, 0, 25);
                ctx.font = `${ onamesize }pt "thefont32"`;
                ctx.fillText(`${ leaders[counter].owner }`, x, y + 125);
            }
            counter++;
        }
    }
    return await image_buffer(canvas);
}
