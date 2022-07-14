const MersenneTwister = require('mersenne-twister');

export const random = (min: number, max: number, discrete = true): number => {
    if (discrete) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        return Math.random() * (max - min + 1) + min;
    }
};

export const chance = (chance_num: number, multiplier?: number): boolean => {
    const disc = random(0, 100, false);
    if (!multiplier) {
        return chance_num > disc;
    }
    return chance_num + (chance_num * multiplier) > disc;
};

export const very_randint = () => {
    return new MersenneTwister().random_int();
};

export function choice<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
}
