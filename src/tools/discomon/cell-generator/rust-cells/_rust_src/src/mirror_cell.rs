use crate::{CellsAccess, CellsAccessAccessors};
use crate::utils::cell_is_edge;

const MODULUS: f64 = 2147483647_f64;

struct PrngGenerator {
    current_seed: f64
}

pub fn get_half_square(num_blocks: f64) -> usize {
    (((num_blocks + 1_f64) / 2_f64) as f64).floor() as usize
}

impl PrngGenerator {
    fn next_seed(seed: f64) -> f64 {
        ((676_f64 * seed) + 875_f64) % MODULUS
    }

    fn generate_value(&mut self) -> u8 {
        self.current_seed = PrngGenerator::next_seed(self.current_seed);
        (self.current_seed % 2_f64) as u8
    }
}

pub fn generate(num_blocks: usize, initial_seed: f64) {
    let num_blocks_f64 = num_blocks as f64;
    let half_square = get_half_square(num_blocks_f64) as usize;
    let mut generator = PrngGenerator {
        current_seed: initial_seed
    };
    for x in 0..half_square {
        for y in 0..num_blocks {
            let x_f64 = x as f64;
            let y_f64 = y as f64;
            let mut state = generator.generate_value();
            if cell_is_edge(num_blocks_f64, x_f64, y_f64) {
                state = 0;
            }
            CellsAccess::set_value_at(num_blocks, x, y, state);
            if x_f64 != (num_blocks_f64 - 1_f64) / 2_f64 {
                CellsAccess::set_value_at(num_blocks, num_blocks - 1 - x, y, state);
            }
        }
    }
}
