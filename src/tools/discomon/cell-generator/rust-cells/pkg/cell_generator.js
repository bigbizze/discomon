let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const {TextDecoder} = require(String.raw`util`);

let cachedTextDecoder = new TextDecoder('utf-8', {ignoreBOM: true, fatal: true});

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

/**
 */
class CellGenerator {

    /**
     * @param {number} num_blocks
     * @param {number} passes
     * @param {number} initial_seed
     * @param {number} live_1
     * @param {number} live_2
     * @param {number} die_1
     * @param {number} die_2
     */
    static generate_cells(num_blocks, passes, initial_seed, live_1, live_2, die_1, die_2) {
        wasm.cellgenerator_generate_cells(num_blocks, passes, initial_seed, live_1, live_2, die_1, die_2);
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

module.exports.CellGenerator = CellGenerator;

module.exports.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'cell_generator_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

