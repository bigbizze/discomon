export type WithProperty<K extends string, V = <A, R>(arg: A) => Promise<R>> = {
    [P in K]: V
};

export type Indexer = { [key: string]: any };

export type TypedIndexer<T> = { [key: string]: T };

export type VoidFn = () => void;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
