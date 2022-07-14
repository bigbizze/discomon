import { RngAction } from "../prng-generator/rng_actions";

export const block_action: RngAction = {
    step_name: 'block',
    range: [
        {
            min: 0,
            max: 4
        }
    ]
};
