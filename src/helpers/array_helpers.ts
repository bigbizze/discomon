export const any = <T>(arr: T[]): boolean => (
    Array.isArray(arr) && arr.length > 0
);

export const first = <T>(arr: T[]): T | null => (
    arr.length > 0 ? arr[0] : null
);

export const second = <T>(arr: T[]): T | null => (
    arr.length > 1 ? arr[1] : null
);

export const last = <T>(arr: T[]): T => (
    arr[arr.length - 1]
);

export const empty = <T>(arr: T[]): boolean => arr != null && arr.length === 0;

export const resolve_type_array_union = <T>(v: T[] | T): T[] => is_array(v) ? v : [ v ];

export const is_array = <T>(arr: T[] | T): arr is T[] => Array.isArray(arr);

export const isNotArray = <T>(arr: T[] | T): arr is T => !Array.isArray(arr);

export const filter_false_from_type = <T>(v: T | false): v is T => v !== false;
