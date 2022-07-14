import { RngAction } from "../rng_actions";


export const item_selector_action: RngAction = {
    step_name: 'type',
    range: [
        {
            min: 0,
            max: 2
        }
    ]
};

export const legendary_item_action: RngAction = {
    step_name: 'type',
    range: [
        {
            min: 0,
            max: 3
        }
    ]
};

export const hp_action: RngAction = {
    step_name: 'hp',
    range: [
        {
            min: 10,
            max: 15
        },
        {
            min: 10,
            max: 15
        },
        {
            min: 11,
            max: 15
        },
        {
            min: 12,
            max: 18
        }
    ]
};


export const damage_action: RngAction = {
    step_name: 'damage',
    range: [
        {
            min: 5,
            max: 10
        },
        {
            min: 6,
            max: 10
        },
        {
            min: 7,
            max: 10
        },
        {
            min: 8,
            max: 11
        }
    ]
};

export const special_action: RngAction = {
    step_name: 'special',
    range: [
        {
            min: 2,
            max: 5
        },
        {
            min: 3,
            max: 5
        },
        {
            min: 4, // 3.5
            max: 5
        },
        {
            min: 4,
            max: 6
        }
    ]
};

export const modifier_action: RngAction = {
    step_name: 'modifier',
    range: [
        {
            min: 0,
            max: 3
        }
    ]
};


export const item_actions: RngAction[] = [
    hp_action,
    damage_action,
    special_action,
    modifier_action
];

export const egg_colour_action: RngAction = {
    step_name: 'egg_colour',
    range: [
        {
            min: 0,
            max: 100
        }
    ]
};
