import { CanvasRenderingContext2D } from "canvas";
import { den, PrngBlockItemActionType } from "./index";

export async function draw_rune_to_canvas(props: PrngBlockItemActionType, quad_size: number, x: number, y: number, ctx: CanvasRenderingContext2D) {
    const step = quad_size / (den + 1);
    const item_colors = [ '#00000000', '#2190ff', '#b829ff', '#8cfc03', '#ff7423', "#C6302E" ];
    ctx.fillStyle = item_colors[props.state.rarity];
    for (let i = 0; i < props.state.blocks.length; i++) {
        ctx.fillRect(x + props.state.blocks[i].x * step, y + props.state.blocks[i].y * step, step, step);
        ctx.fillRect(x + quad_size * 2 - step - props.state.blocks[i].x * step, y + props.state.blocks[i].y * step, step, step);
        ctx.fillRect(x + props.state.blocks[i].x * step, y + quad_size * 2 - step - props.state.blocks[i].y * step, step, step);
        ctx.fillRect(x + quad_size * 2 - step - props.state.blocks[i].x * step, y + quad_size * 2 - step - props.state.blocks[i].y * step, step, step);
    }
}

