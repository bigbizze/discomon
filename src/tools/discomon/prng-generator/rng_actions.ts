export type Range = {
    min: number
    max: number
};

export interface RngAction {
    step_name: string
    range: Range[],
    return_initial_seed?: boolean
}

