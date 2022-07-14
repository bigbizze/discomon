use std::borrow::{Borrow, BorrowMut};
use std::mem;

use crate::{CellsAccess, CellsAccessAccessors, WASM_MEMORY_BUFFER, WASM_MEMORY_BUFFER_SIZE};
use crate::utils::{cell_is_not_edge, neighbors, neighbors_usize};

pub struct CaRules {
    pub live: Vec<f64>,
    pub die: Vec<f64>,
}

static mut TEMP_MEMORY_BUFFER: [u8; WASM_MEMORY_BUFFER_SIZE] = [0; WASM_MEMORY_BUFFER_SIZE];

struct TempCellsAccess {}

impl TempCellsAccess {
    pub fn reset_byte_arr() {
        unsafe {
            TEMP_MEMORY_BUFFER = [0; WASM_MEMORY_BUFFER_SIZE];
        }
    }
    pub fn set_value_at(num_blocks: usize, x: usize, y: usize, new_value: u8) {
        unsafe {
            TEMP_MEMORY_BUFFER[x * num_blocks + y] = new_value;
        }
    }
}

pub fn generate(num_blocks: usize, passes: usize, rules: &CaRules) {
    for pass in 0..passes {
        if pass != 0 {
            TempCellsAccess::reset_byte_arr();
        }
        for x in 0..num_blocks {
            for y in 0..num_blocks {
                let num_blocks_f64 = num_blocks as f64;
                let x_f64 = x as f64;
                let y_f64 = y as f64;
                let cur_cell_value;
                cur_cell_value = CellsAccess::get_value_at(num_blocks, x, y);
                TempCellsAccess::set_value_at(num_blocks, x, y, cur_cell_value);
                if cell_is_not_edge(num_blocks_f64, x_f64, y_f64) {
                    let num_neighbors = neighbors_usize(x, y, num_blocks);
                    if cur_cell_value == 1 && rules.die.contains(num_neighbors.borrow()) {
                        TempCellsAccess::set_value_at(num_blocks, x, y, 0);
                    } else if cur_cell_value == 0 && rules.live.contains(num_neighbors.borrow()) {
                        TempCellsAccess::set_value_at(num_blocks, x, y, 1);
                    }
                }
            }
        }
    }
    unsafe {
        mem::replace(WASM_MEMORY_BUFFER.borrow_mut(), TEMP_MEMORY_BUFFER);
    }
}
