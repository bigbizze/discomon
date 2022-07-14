extern crate wasm_bindgen;

use std::borrow::{Borrow, BorrowMut};
use std::mem;
use wasm_bindgen::prelude::*;

use crate::cellular_automata::CaRules;
use crate::utils::{borders, borders_usize, check_if_broke, neighbors, neighbors_usize};

mod cellular_automata;
mod mirror_cell;
mod utils;

const WASM_MEMORY_BUFFER_SIZE: usize = 842;
static mut WASM_MEMORY_BUFFER: [u8; WASM_MEMORY_BUFFER_SIZE] = [0; WASM_MEMORY_BUFFER_SIZE];

pub struct CellsAccess {}

pub trait CellsAccessAccessors {
    fn get_value_at(num_blocks: usize, x: usize, y: usize) -> u8;
    fn set_value_at(num_blocks: usize, x: usize, y: usize, new_value: u8);
}

impl CellsAccessAccessors for CellsAccess {
    fn get_value_at(num_blocks: usize, x: usize, y: usize) -> u8 {
        unsafe {
            WASM_MEMORY_BUFFER[x * num_blocks + y]
        }
    }
    fn set_value_at(num_blocks: usize, x: usize, y: usize, new_value: u8) {
        unsafe {
            WASM_MEMORY_BUFFER[x * num_blocks + y] = new_value;
        }
    }
}

pub fn do_generation(num_blocks: usize, num_blocks_float: f64, mut passes: usize, initial_seed: f64, ca_rules: &CaRules) {
    mirror_cell::generate(num_blocks, initial_seed);
    cellular_automata::generate(num_blocks, passes, ca_rules);
    let mut broke = check_if_broke(num_blocks);
    while broke {
        passes += 1;
        do_generation(num_blocks, num_blocks_float, passes, initial_seed, ca_rules.borrow());
        broke = check_if_broke(num_blocks);
    }
    generate_outline(num_blocks);
    generate_secondaries(num_blocks);
}


pub fn generate_outline(num_blocks: usize) {
    for x in 0..num_blocks {
        for y in 0..num_blocks {
            let neighbours = neighbors_usize(x, y, num_blocks);
            if CellsAccess::get_value_at(num_blocks, x, y) == 0 && neighbours != 0. {
                CellsAccess::set_value_at(num_blocks, x, y, 2);
            }
        }
    }
}

pub fn generate_secondaries(num_blocks: usize) {
    for x in 0..num_blocks {
        for y in 0..num_blocks {
            let borders = borders_usize(x, y, num_blocks);
            if CellsAccess::get_value_at(num_blocks, x, y) == 1 && borders == 4. {
                CellsAccess::set_value_at(num_blocks, x, y, 3);
            }
        }
    }
}

#[wasm_bindgen]
pub struct CellGenerator {}

fn get_rule_vec(v1: f64, v2: f64) -> Vec<f64> {
    let mut vec: Vec<f64> = Vec::new();
    if v1 != 0. {
        vec.push(v1);
    }
    if v2 != 0. {
        vec.push(v2);
    }
    vec
}

pub fn resolve_ca_rules(live_1: f64, live_2: f64, die_1: f64, die_2: f64) -> CaRules {
    CaRules {
        live: get_rule_vec(live_1, live_2),
        die: get_rule_vec(die_1, die_2),
    }
}

#[wasm_bindgen]
impl CellGenerator {
    pub fn generate_cells(num_blocks: f64, passes: f64, initial_seed: f64, live_1: f64, live_2: f64, die_1: f64, die_2: f64) {
        let num_blocks_usize = num_blocks as usize;
        let ca_rules = resolve_ca_rules(live_1, live_2, die_1, die_2);
        do_generation(num_blocks_usize, num_blocks, passes as usize, initial_seed, ca_rules.borrow());
    }
    pub fn get_cells_ptr() -> *const u8 {
        let pointer: *const u8;
        unsafe {
            pointer = WASM_MEMORY_BUFFER.as_ptr();
        }
        pointer
    }
}
