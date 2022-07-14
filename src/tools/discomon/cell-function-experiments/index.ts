import { CellularAutomataRule } from "../prng-generator/prng-discomon/discomon_action_handlers";
import { ActionState, do_action } from "../prng-generator/action_handlers";
import { neighbours } from "../cell-generator/rust-cells";

require('dotenv').config();

export interface CellGeneratorProps {
    num_blocks: number;
    seed: number;
    ca_rule: CellularAutomataRule;
}

const get_test_ca_rule = (idx: number) => [
    { 'live': [ 3, 2 ], 'die': [ 1, 4 ], name: 'one' },
    { 'live': [ 4, 3 ], 'die': [ 1, 2 ], name: 'two' },
    { 'live': [ 1 ], 'die': [ 4, 2 ], name: 'three' },
    { 'live': [ 1, 4 ], 'die': [ 3, 2 ], name: 'four' },
    { 'live': [ 0, 2 ], 'die': [ 4, 3 ], name: 'five' }
][idx];

// test /////////////////
const CGProps = { num_blocks: 6, seed: 5000, ca_rule: get_test_ca_rule(3) };
const initial_cells = seed_cells({ seed: 5000, state: CGProps, created_on: null, initial_seed: 5000 });

for (let i = 1; i < 19; i++) {
    const cells = generate_cells_continuous(CGProps, initial_cells, i);
    const output = temp_borders(cells.length, cells);
    test_output(output);
}

function test_output(output: number[][]) {
    let pstring = '';
    for (let x = 0; x < output.length; x++) {
        for (let y = 0; y < output.length; y++) {
            pstring += output[y][x].toString() + ' ';
        }
        pstring += '\n';
    }
    return console.log(pstring);
}

/////////////////////////

export default function generate_cells_continuous(props: CellGeneratorProps, cells: number[][], level: number): number[][] {
    for (let x = 0; x < Math.ceil(props.num_blocks / 2); x++) {
        if (!cells[x]) {
            cells[x] = [];
        }
        for (let y = 0; y < props.num_blocks; y++) {
            if (!cells[x][y]) {
                cells[x][y] = 0;
            }
        }
    }
    const mirrored_cells = mirror(props, cells);
    const new_cells = apply_ca(props, mirrored_cells, 3);
    const split_cells = split(props, new_cells);
    const new_props = { ...props, num_blocks: props.num_blocks + 1 };
    if (props.num_blocks === level + 6) {
        return mirror(props, split_cells);
    }
    return generate_cells_continuous(new_props, split_cells, level);
}

function seed_cells(props: ActionState<CellGeneratorProps, any>, cells: number[][] = []) {
    for (let x = 0; x < Math.ceil(props.state.num_blocks / 2); x++) {
        cells[x] = [];
        for (let y = 0; y < props.state.num_blocks; y++) {
            if (x === 0 || y === 0 || y === props.state.num_blocks - 1) {
                cells[x][y] = 0;
            } else {
                const { context: { generated_value, seed } } = do_action(props, {
                    step_name: 'cell_state',
                    range: [ { min: 0, max: 1 } ]
                });
                cells[x][y] = generated_value;
                props.seed = seed;
            }
        }
    }
    return [ ...cells ];
}

function apply_ca(props: CellGeneratorProps, cells: number[][], passes: number): number[][] {
    if (passes === 0) {
        return [ ...cells ];
    }
    for (let x = 1; x < props.num_blocks - 1; x++) {
        for (let y = 1; y < props.num_blocks - 1; y++) {
            if (props.ca_rule['live'].includes(neighbours(cells, x, y, props.num_blocks))) {
                cells[x][y] = 1;
            }
            if (props.ca_rule['die'].includes(neighbours(cells, x, y, props.num_blocks))) {
                cells[x][y] = 0;
            }
        }
    }
    return apply_ca(props, [ ...cells ], passes - 1);
}

function mirror(props: CellGeneratorProps, cells: number[][]) {
    for (let x = 0; x < Math.ceil(props.num_blocks / 2); x++) {
        for (let y = 0; y < props.num_blocks; y++) {
            if (x !== (props.num_blocks - 1) / 2.00) {
                if (!cells[props.num_blocks - 1 - x]) {
                    cells[props.num_blocks - 1 - x] = [];
                }
                cells[props.num_blocks - 1 - x][y] = cells[x][y];
            }
        }
    }
    return [ ...cells ];
}

function split(props: CellGeneratorProps, cells: number[][]) {
    const half: number[][] = [];
    for (let x = 0; x < Math.ceil(props.num_blocks / 2); x++) {
        half.push([ ...cells[x] ]);
    }
    return [ ...half ];
}

function temp_borders(num_blocks: number, cells: number[][]) {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells.length; y++) {
            if (cells[x][y] === 0 && neighbours(cells, x, y, num_blocks) > 0) {
                cells[x][y] = 2;
            }
        }
    }
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells.length; y++) {
            if (cells[x][y] === 1 && neighbours(cells, x, y, num_blocks) === 0) {
                cells[x][y] = 3;
            }
        }
    }
    return [ ...cells ];
}
