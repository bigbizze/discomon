import { Vecco } from "./generic-types/vecco";
import { DbDiscomon } from "../../scaffold/database_types";
import { MonStaticProps } from "../../scaffold/type_scaffolding";
import { calculate_xp_to_next_level } from "../../helpers/discomon_helpers";
import { CheckLevel, MonsterType } from "./index";

export function check_level(level: number, experience: number, monster_type: MonsterType): CheckLevel {
    if (monster_type === "user" && level <= 18) {
        return {
            experience,
            level
        };
    } else if (monster_type === "user" && level > 18) {
        return {
            experience: 3212,
            level: 18
        };
    } else {
        return {
            experience: 5378,
            level: 23
        };
    }
}

function get_num_blocks(level: number) {
    return level + 6;
}

function get_size(level: number) {
    const size = 30 + level * 5;
    return size > 80
        ? 80
        : size;
}

function get_block_size(level: number, num_blocks: number) {
    const size = get_size(level);
    return {
        size,
        block_size: size / num_blocks
    };
}

function get_anchor_position({ x, y }: Vecco, size: number) {
    return {
        x: x + 40 - size / 2,
        y: y + 40 - size / 2
    };
}

export function calculate_static_props(db_props: DbDiscomon, { level, experience }: CheckLevel): MonStaticProps {
    const num_blocks = get_num_blocks(level);
    const { size, block_size } = get_block_size(level, num_blocks);
    const xp_to_next_level = calculate_xp_to_next_level(level);
    const anchor_parent_position = get_anchor_position({ x: 10, y: 10 }, size);
    return {
        ...db_props,
        nickname: `${ db_props.nickname }`,
        block_size,
        num_blocks,
        xp_to_next_level,
        anchor_parent_position,
        level,
        experience
    };
}
