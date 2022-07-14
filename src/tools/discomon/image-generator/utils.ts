import { DbBoss, DbDiscomon } from "../../../scaffold/database_types";
import node_canvas, { Canvas, CanvasRenderingContext2D } from "canvas";


export function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}

export const get_name_size = (name_length: number, min = 0, max = 20): number => (
    clamp(17 / name_length * 10, min, max)
);

export const get_canvas = (width: number, height: number): { canvas: Canvas; ctx: CanvasRenderingContext2D } => {
    const canvas = node_canvas.createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.quality = 'fast';
    ctx.patternQuality = 'fast';
    return { canvas, ctx };
};
// TESTING
// KEEP THIS ->> NEEDED FOR PROD.
export function get_db_info(seed: string, _exp: number = 3601, id: number = 1): DbDiscomon {
    return {
        alpha_seed: 'aaaa',
        boss_damage: 0,
        alive: true,
        boss_kills: 0,
        item_id: 0,
        kills: 0,
        losses: 0,
        nickname: "wololo",
        owner: "",
        wins: 0,
        id,
        seed,
        experience: _exp,
        date_hatched: 0
    };
}

export const map_db_boss_to_db_mon = (b: DbBoss): DbDiscomon => ({
    id: b.id,
    alpha_seed: 'aaaa',
    seed: b.seed,
    boss_damage: 0,
    nickname: b.name,
    experience: 6000,
    date_hatched: 0,
    alive: true,
    wins: b.wins,
    losses: 0,
    kills: b.kills,
    item_id: 0,
    owner: '123123',
    boss_kills: 0
});
