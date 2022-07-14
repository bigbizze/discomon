/* tslint:disable */

/* eslint-disable */
/**
 */
export class CellGenerator {
    /**
     * @param {number} num_blocks
     * @param {number} passes
     * @param {number} initial_seed
     * @param {number} live_1
     * @param {number} live_2
     * @param {number} die_1
     * @param {number} die_2
     */
    static generate_cells(num_blocks: number, passes: number, initial_seed: number, live_1: number, live_2: number, die_1: number, die_2: number): void;

    /**
     * @returns {number}
     */
    static get_cells_ptr(): number;

    free(): void;
}
