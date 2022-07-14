import { ActionState } from "../tools/discomon/prng-generator/action_handlers";
import { map_action_state } from "../tools/discomon/prng-generator/utils";

export type Mapper<T, R> = (a: T) => R;
export type Functor<T> = (a: T) => T;
export type Functors<T> = Functor<T>[];


export const compose_with_option = <T>(...fns: Functors<T>) => (option_handler: (fn: Functor<T>, state: T) => T) => (init: any) => (
    fns.reduce((y, fn) => option_handler(fn, y), init)
);

export const compose_wrap_apply_map_ins = <T, M>(...fns: Functors<M>) => (apply: (fn: Functor<M>, state: M) => M) => (map_in: Mapper<T, M>) => (map_out: Mapper<M, T>) => (init: any) => (
    map_out(fns.reduce((y, fn) => apply(fn, y), map_in(init)))
);

export const compose = <T>(init: any, ...fns: Functors<T>) => (
    fns.reduce((y, fn) => fn(y), init)
);

export const compose_map = <T, R>(...fns: Functors<T>) => (init: any) => (map_to: Mapper<T, R>): R => (
    map_to(compose(init, ...fns))
);

export const composePrngState = <TState, TVersion, R>(...fns: Functors<ActionState<TState, TVersion>>) => (init: ActionState<TState, TVersion>) => (map_to: Mapper<TState, R>): R => (
    compose_map<ActionState<TState, TVersion>, R>(...fns)(init)((t: ActionState<TState, TVersion>) => map_to(map_action_state<TState, TVersion>(t)))
);
