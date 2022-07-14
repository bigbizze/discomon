import { DbReturnTypes } from "../tools/database";

export const is_null = <T>(v: T | null): v is null => v == null;

export const is_not_null = <T>(v: T | null): v is T => v != null;

export const is_function_type = <T, F>(v: T | F): v is F => typeof v === "function";

export const is_type_one = <T, O>(v: T | O, condition: boolean): v is T => condition;

export const is_null_or_nan = (n?: number | null): boolean => n == null || Number.isNaN(n);
// export const is_id_null_not_a_string_or_not_18_len = (id?: string | null | any): id is undefined => id == null || typeof id !== "string" || (id.length !== 18 && id !== "test_dummy");
export const do_cache = (cache: Map<string, string> = new Map<string, string>()) =>
    (fn: (...args: any[]) => DbReturnTypes) =>
        async (key: string, ...args: any[]): Promise<DbReturnTypes> => {
            if (process.env.CACHE_COMMANDS == null || process.env.CACHE_COMMANDS === "0") {
                return fn(...args);
            }
            const string_lookup = JSON.stringify({ key, args });
            if (cache.has(string_lookup)) {
                return parse_json_as<DbReturnTypes>(cache.get(string_lookup) as string);
            }
            const result = await fn(...args);
            cache.set(string_lookup, JSON.stringify(result));
            return result;
        };

export const logo = 'https://i.imgur.com/70hH6hp.png';

export const sleep = async (sleep_for: number) => (
    await new Promise(resolve => setTimeout(resolve, sleep_for))
);

export const parse_json_as = <T>(serialized_input: string) => JSON.parse(serialized_input) as T;

export const promise_then_catch = <T>(e: Promise<T>) => e.then().catch(err => console.log(err)) && null;

/** Usage:
 *      const start = timer();
 *      // (do some computation you want to test the execution time of)
 *      timer(start);
 *      >> 6346ms
 * @param start the start value of the interval to test the time of
 *               (usually the return of the first time this function was called)
 * @param should_return if true, return the result of the time in ms elapsed in calculation
 *                       otherwise, print the result prettily.
 */
export function timer(start?: any, should_return = false) {
    if (!start) {
        return process.hrtime();
    }
    const end = process.hrtime(start);
    const result = Math.round((end[0] * 1000) + (end[1] / 1000000));
    if (should_return) {
        return result;
    }
    console.log(`${ Math.round((end[0] * 1000) + (end[1] / 1000000)) }ms`);
}
