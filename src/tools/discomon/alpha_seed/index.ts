import { alpha_mon_state, compress_num_to_hex, expand_hex_to_num, map_alpha_to_array, prng_alphamon } from "./utils";
import { DbDiscomon } from "../../../scaffold/database_types";
import { MonState } from "../../../scaffold/type_scaffolding";
import { calculate_level } from "../../../helpers/discomon_helpers";
import { calculate_static_props, check_level } from "../utils";
import cell_generator from "../cell-generator/rust-cells";
import { MonsterType } from "../index";
import { roll_dna, roll_single_stat } from "./prng";
import { clamp } from "../image-generator/utils";
import { most_recent_battle_update_notes } from "../../../constants";

export default function get_alphamon(db_props: DbDiscomon, mon_type: MonsterType): MonState {
    const level = calculate_level(db_props.experience);
    const static_props = calculate_static_props(db_props, check_level(level, db_props.experience, mon_type));
    const pre_prng_state = alpha_mon_state(db_props.seed);
    const rng_props = prng_alphamon(pre_prng_state, static_props.level);
    return {
        ...static_props,
        ...rng_props,
        cells: cell_generator({
            num_blocks: static_props.num_blocks,
            ca_rule: rng_props.ca_rule,
            passes: rng_props.passes,
            seed: pre_prng_state.seeds.grid
        }),
        size: 30 + level * 5 >= 80 ? 80 : 30 + level * 5
    };
}

export function alpha_breed(mummy: string, daddy: string, breed_seed: number = Date.now()): string {
    const { generation: da, versioning: da_version } = map_alpha_to_array(daddy);
    const { generation: ma, versioning: ma_version } = map_alpha_to_array(mummy);
    const grid_modifier = roll_single_stat(breed_seed, { min: 0, max: 1000 });
    const baby_grid_seed = compress_num_to_hex(clamp(Math.round(
        (expand_hex_to_num(ma[0]) / 2 + expand_hex_to_num(da[0])) / 2) - grid_modifier, 0, 16777216));
    const discriminant = roll_dna(breed_seed);
    const versions = most_recent_battle_update_notes.generation_values;
    const genes = [
        baby_grid_seed
    ];
    const gene_versions = [
        compress_num_to_hex(versions.grid, false)
    ];
    for (let i = 0; i < discriminant.length; i++) {
        if (i === 2) {
            const col = discriminant[i] === 0 ? 3 : 4;
            genes.push(da[col]);
            gene_versions.push(da_version[col]);
        } else if (i === 3) {
            const col = discriminant[i] === 0 ? 3 : 4;
            genes.push(ma[col]);
            gene_versions.push(ma_version[col]);
        } else {
            genes.push(discriminant[i] === 0 ? da[i + 1] : ma[i + 1]);
            gene_versions.push(discriminant[i] === 0 ? da_version[i + 1] : ma_version[i + 1]);
        }
    }
    return `${ genes.join("-") }::${ gene_versions.join(":") }`;
}

export const get_alpha_db = (seed: string, exp: number = 3213): DbDiscomon => ({
    id: 1,
    seed,
    boss_damage: 0,
    nickname: 'bo',
    experience: exp,
    date_hatched: 123123234123,
    alive: true,
    wins: 0,
    losses: 0,
    kills: 0,
    item_id: 0,
    owner: 'bo_owner',
    boss_kills: 0
});
