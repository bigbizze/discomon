import { RngAction } from "./rng_actions";
import { Indexer } from "../../../helpers/utility_types";

require('dotenv').config();


const modulus = 2 ** 31 - 1;

interface NextRngState {
    min: number;
    max: number;
    seed: number;
}

interface NextContent {
    seed: number;
    generated_value: any;
}

export interface ActionState<TSpread, TVersion> extends Indexer {
    state: TSpread;
    seed: number;
    initial_seed: number;
    version?: TVersion;
}


export const next_seed_calc = (seed: number, [ coefficient_one, coefficient_two ]: number[]) => (
    ((coefficient_one * seed) + coefficient_two) % modulus
);

export const next_seed = (seed: number) => {
    return next_seed_calc(seed, [ 16807, 0 ]);
};

export const next_rng_state = ({ seed, min, max }: NextRngState): NextContent => {
    const _next_seed = next_seed(seed);
    return {
        generated_value: min + (_next_seed % (max + 1 - min)),
        seed: _next_seed
    };
};

interface ProcessActionResult<TSpread, TVersion> {
    context: NextContent,
    next: (next_state: NextContent) => ActionState<TSpread, TVersion>
}

/** process_action_state --
 *    - context (object): Contains the next seed & the generated pseudo-random number.
 *
 *    - next (method): Takes the next seed & the value the operation calling this function
 *                      wants to assign to the stat.
 *                     This value can simply be the psrn itself, or some other value determined using
 *                      the psrn (or by any other means tbh).
 *                     The property name this value is assigned to is defined with "step_name" in the action.
 *                     Ultimately, it returns the next stat.
 */
export const process_action_state = <TSpread, TVersion>(props: ActionState<TSpread, TVersion>, action: RngAction, rarity?: number): ProcessActionResult<TSpread, TVersion> => ({
    context: next_rng_state({ seed: props.seed, ...action.range[props.generation ? props.generation : rarity ? rarity : 0] }),
    next: (({ generated_value, seed }: NextContent) => ({
        ...props,
        seed,
        state: {
            ...props.state,
            [action.step_name]: generated_value
        }
    }))
});

/** These can be thought of as resolving the dependencies needed for the next stat,
 *   and resolving the function to update the stat from those dependencies.
 *
 *  "do_action" allows you to inject functionality in between the RNG dependencies & the stat update function
 *    in a convenient way.
 *
 *  "do_next_action" resolves the property name to the random number directly
 */
export function do_next_action<TSpread, TVersion>(props: ActionState<TSpread, TVersion>, action: RngAction): ActionState<TSpread, TVersion> {
    const { initial_seed } = props;
    if ("return_initial_seed" in action && action.return_initial_seed && !initial_seed) {
        throw new Error("requested that the initial seed be returned instead of the next seed but did not provide the initial seed!");
    }
    const { context: { generated_value, seed }, next } = process_action_state(props, action);
    return next({
        generated_value,
        seed: initial_seed != null ? initial_seed : seed
    });
}

/** do_action --
 *      Returns both the context & function to update the stat to allow for injecting functionality.
 *      This is used in situations when the random-number isn't the value you want directly
 *      For e.g., to get the random value used to loc & assign a cellular automata rule to the stat.
 */
export function do_action<TSpread, TVersion>(props: ActionState<TSpread, TVersion>, action: RngAction, value?: number) {
    return value ? process_action_state(props, action, value) : process_action_state(props, action);
}
