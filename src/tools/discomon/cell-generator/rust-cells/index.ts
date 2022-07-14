import { app_root_path } from "../../../../constants";
import { CellularAutomataRule } from "../../prng-generator/prng-discomon/discomon_action_handlers";

const wasm_package = require(`${ app_root_path }/src/tools/discomon/cell-generator/rust-cells/pkg`);

export interface CellGeneratorProps {
    num_blocks: number;
    passes: number;
    seed: number;
    ca_rule: CellularAutomataRule;
}

function resolve_ca(rules: number[]) {
    if (rules.length === 2) {
        return rules;
    } else if (rules.length === 1) {
        return [ rules[0], 0 ];
    } else {
        return [ 0, 0 ];
    }
}

function expand_ca_rules({ die, live }: CellularAutomataRule) {
    const [ live_1, live_2 ] = resolve_ca(live);
    const [ die_1, die_2 ] = resolve_ca(die);
    return { live_1, live_2, die_1, die_2 };
}

function do_generation(wasm_package: any, { ca_rule, num_blocks, passes, seed }: CellGeneratorProps) {
    const { die_1, die_2, live_1, live_2 } = expand_ca_rules(ca_rule);
    wasm_package.CellGenerator.generate_cells(num_blocks, passes, seed, live_1, live_2, die_1, die_2);
    const memPtr = wasm_package.CellGenerator.get_cells_ptr();
    const buff = new Uint8Array(wasm_package.__wasm.memory.buffer, memPtr, 842);
    let cells = [];
    for (let x = 0; x < num_blocks; x++) {
        cells.push(Array.from(buff.slice(x * num_blocks, x * num_blocks + num_blocks)));
    }
    return cells;
}

export default function cell_generator(props: CellGeneratorProps) {
    return do_generation(wasm_package, props);
}

export function neighbours(cells: number[][], x: number, y: number, num_blocks: number): number {
    return wasm_package.neighbors(x, y, num_blocks, cells[x - 1][y], cells[x + 1][y], cells[x][y - 1], cells[x][y + 1]);
}

export function borders(cells: number[][], x: number, y: number, num_blocks: number): number {
    return wasm_package.borders(x, y, num_blocks, cells[x - 1][y], cells[x + 1][y], cells[x][y - 1], cells[x][y + 1]);
}

