extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

use crate::{CellsAccess, CellsAccessAccessors};

pub fn num_relatives(x: usize, y: usize, num_blocks: usize, state_type: u8) -> f64 {
    let num_blocks_f64 = num_blocks as f64;
    let x_f64 = x as f64;
    let y_f64 = y as f64;

    let mut result: f64 = 0.;
    if x_f64 != 0. && CellsAccess::get_value_at(num_blocks, x - 1, y) == state_type {
        result += 1.;
    }
    if x_f64 != num_blocks_f64 - 1. && CellsAccess::get_value_at(num_blocks, x + 1, y) == state_type {
        result += 1.;
    }
    if y_f64 != 0. && CellsAccess::get_value_at(num_blocks, x, y - 1) == state_type {
        result += 1.;
    }
    if y_f64 != num_blocks_f64 - 1. && CellsAccess::get_value_at(num_blocks, x, y + 1) == state_type {
        result += 1.;
    }

    result
}

pub fn neighbors_usize(x: usize, y: usize, num_blocks: usize) -> f64 {
    num_relatives(x, y, num_blocks, 1)
}

pub fn borders_usize(x: usize, y: usize, num_blocks: usize) -> f64 {
    num_relatives(x, y, num_blocks, 2)
}

#[wasm_bindgen]
pub fn neighbors(x: f64, y: f64, num_blocks: f64) -> f64 {
    num_relatives(x as usize, y as usize, num_blocks as usize, 1)
}

#[wasm_bindgen]
pub fn borders(x: f64, y: f64, num_blocks: f64) -> f64 {
    num_relatives(x as usize, y as usize, num_blocks as usize, 2)
}

pub fn check_if_broke(num_blocks: usize) -> bool {
    for x in 0..num_blocks {
        for y in 0..num_blocks {
            if CellsAccess::get_value_at(num_blocks, x, y) != 0 {
                return false;
            }
        }
    }
    true
}

pub fn cell_is_not_edge(num_blocks: f64, x: f64, y: f64) -> bool {
    x > 0. && y > 0. && x < num_blocks - 1. && y < num_blocks - 1.
}

pub fn cell_is_edge(num_blocks: f64, x: f64, y: f64) -> bool {
    x == 0. || x == num_blocks - 1. || y == 0. || y == num_blocks - 1.
}
