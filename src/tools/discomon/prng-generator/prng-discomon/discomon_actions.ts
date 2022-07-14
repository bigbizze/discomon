import { RngAction } from "../rng_actions";


export const ca_rule_action: RngAction = {
    step_name: "ca_rule",
    range: [ {
        min: 0,
        max: 4
    } ]
};

export const passes_action: RngAction = {
    step_name: "passes",
    range: [ {
        min: 1,
        max: 5
    } ],
    return_initial_seed: true
};

export const hue_action: RngAction = {
    step_name: "hue",
    range: [ {
        min: 0,
        max: 360
    } ]
};

export const lightness_action: RngAction = {
    step_name: "lightness",
    range: [ {
        min: 45,
        max: 90
    } ]
};

export const special_action: RngAction = {
    step_name: "special",
    range: [ {
        min: 0,
        max: 2
    } ]
};


export const passive_action: RngAction = {
    step_name: "passive",
    range: [ {
        min: 0,
        max: 3
    },
        {
            min: 0,
            max: 4
        } ]
};

export const hp_action: RngAction = {
    step_name: "hp",
    range: [ {
        min: 10,
        max: 100
    } ]
};

export const damage_action: RngAction = {
    step_name: "damage",
    range: [ {
        min: 2,
        max: 25
    } ]
};

export const special_chance_action: RngAction = {
    step_name: "special_chance",
    range: [ {
        min: 0,
        max: 2
    } ]
};

export const rare_boost_chance_action: RngAction = {
    step_name: "passive",
    range: [ {
        min: 0,
        max: 1000
    } ]
};

export const rare_black_chance_action: RngAction = {
    step_name: "black",
    range: [ {
        min: 0,
        max: 10000
    } ]
};
