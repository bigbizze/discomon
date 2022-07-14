import * as wasm from './cell_generator_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', {ignoreBOM: true, fatal: true});

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;

function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) {
    return heap[idx];
}

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

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
     * @returns {any}
     */
    static generate_cells(num_blocks, passes, initial_seed, live_1, live_2, die_1, die_2) {
        var ret = wasm.cellgenerator_generate_cells(num_blocks, passes, initial_seed, live_1, live_2, die_1, die_2);
        return takeObject(ret);
    }

    /**
     * @returns {number}
     */
    static get_cells_ptr() {
        var ret = wasm.cellgenerator_get_cells_ptr();
        return ret;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_cellgenerator_free(ptr);
    }
}

export const __wbindgen_json_parse = function (arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

