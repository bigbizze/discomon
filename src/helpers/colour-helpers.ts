import cc from "color-convert";
import { random } from "./rng_helpers";
import { parse_json_as } from "./general_helpers";
import { ColourStore } from "../setup_scripts/mine-colours";
import { app_root_path } from "../constants";
import { Colour } from "../scaffold/type_scaffolding";

export default function average_hue(h1: number, h2: number) {
    const x = (Math.cos(h1 / 180 * Math.PI) + Math.cos(h2 / 180 * Math.PI)) / 2;
    const y = (Math.sin(h1 / 180 * Math.PI) + Math.sin(h2 / 180 * Math.PI)) / 2;

    return (((Math.atan2(y, x) * 180 / Math.PI) % 360) + 360) % 360;
}


type MinMaxRange = {
    min: number
    max: number
};

function get_mean(arr: number[]) {
    const n = arr.length;
    return arr.reduce((a, b) => a + b) / n;
}

function get_st_dev(arr: number[]) {
    const n = arr.length;
    const mean = get_mean(arr);
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function get_one_st_dev_range(arr: number[]): MinMaxRange {
    const hue_st_dev = get_st_dev(arr);
    const hue_mean = get_mean(arr);
    return {
        min: Math.floor(hue_mean - hue_st_dev),
        max: Math.floor(hue_mean + hue_st_dev)
    };
}

export const hsl_to_hex = (hsl: number[] | Colour): string => (
    Array.isArray(hsl) ? `#${ cc.hsl.hex([ hsl[0], hsl[1], hsl[2] ]) }` : `#${ cc.hsl.hex([ hsl.hue, hsl.sat, hsl.lum ]) }`
);

const get_random_colour_fn = (min_maxes: [ MinMaxRange, MinMaxRange, MinMaxRange ]): () => string => {
    return () => `#${ cc.hsl.hex(cc.rgb.hsl([
        random(min_maxes[0].min, min_maxes[0].max, true),
        random(min_maxes[1].min, min_maxes[0].max, true),
        random(min_maxes[2].min, min_maxes[0].max, true)
    ])) }`;
};

async function get_min_maxes(recalc: boolean): Promise<[ MinMaxRange, MinMaxRange, MinMaxRange ]> {
    const fs = require("fs");
    if (!fs.existsSync(`${ app_root_path }/data/hsl_stdev_ranges.json`) || recalc) {
        const primary_colours = parse_json_as<{ colour_store: ColourStore[] }>(await fs.promises.readFile(`${ app_root_path }/data/seed_colours_1.json`, "utf-8")).colour_store;
        return [
            get_one_st_dev_range(primary_colours.map(x => x.b1[0])),
            get_one_st_dev_range(primary_colours.map(x => x.b1[1])),
            get_one_st_dev_range(primary_colours.map(x => x.b1[2]))
        ];
    }
    return parse_json_as<{ data: [ MinMaxRange, MinMaxRange, MinMaxRange ] }>(await fs.promises.readFile(`${ app_root_path }/data/hsl_stdev_ranges.json`, "utf-8")).data;
}

export async function get_random_hsl_in_st_dev_range_fn(recalc = false) {
    const hsl_min_maxes = await get_min_maxes(recalc);
    const next_random_colour = get_random_colour_fn(hsl_min_maxes);
    return () => next_random_colour();
}


if (require.main === module) {
    console.log(average_hue(330, 5));
}
