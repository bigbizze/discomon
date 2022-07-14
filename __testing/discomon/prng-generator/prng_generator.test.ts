import prng_generator_parsed, { prng_generator } from "../../../src/tools/discomon/prng-generator";

const test_one_items = [
    {
        seed: 5,
        level: 20,
        xResult: '{"ca_rule":{"live":[6],"die":[1,2]},"damage":234,"defend_chance":9,"hp":1032,"hue":284,"hue2":262,"kill_chance":5,"lightness":46,"lightness2":62,"passes":1,"passive":"wounded","special":"confuse","special_chance":24}'
    },
    {
        seed: 10000,
        level: 13,
        xResult: '{"ca_rule":{"live":[6],"die":[1,2]},"damage":168,"defend_chance":7,"hp":704,"hue":67,"hue2":177,"kill_chance":6,"lightness":54,"lightness2":62,"passes":2,"passive":"dodge","special":"stun","special_chance":13}'
    },
    {
        seed: 214,
        level: 1,
        xResult: '{"ca_rule":{"live":[5],"die":[1]},"damage":18,"defend_chance":0,"hp":61,"hue":56,"hue2":150,"kill_chance":0,"lightness":70,"lightness2":82,"passes":5,"passive":"wounded","special":"stun","special_chance":2}'
    },
    {
        seed: 5523,
        level: 5,
        xResult: '{"ca_rule":{"live":[3,4],"die":[1,2]},"damage":47,"defend_chance":2,"hp":203,"hue":239,"hue2":118,"kill_chance":0,"lightness":63,"lightness2":45,"passes":2,"passive":"heal","special":"crit","special_chance":2}'
    },
    {
        seed: 511,
        level: 6,
        xResult: '{"ca_rule":{"live":[4],"die":[1,2]},"damage":85,"defend_chance":4,"hp":270,"hue":112,"hue2":219,"kill_chance":1,"lightness":46,"lightness2":88,"passes":2,"passive":"wounded","special":"stun","special_chance":8}'
    }
];

const test_two_items = [
    {
        seed: 5,
        level: 20,
        xResult: '{"passes":1,"ca_rule":{"live":[6],"die":[1,2]},"colours":{"body_colour_one":{"hue":284,"sat":100,"lum":46},"body_colour_two":{"hue":262,"sat":100,"lum":62},"outline_colour":{"hue":284,"sat":55,"lum":7.666666666666667}},"stats":{"hp":1032,"damage":234,"defend_chance":9,"special_chance":24,"kill_chance":5},"attributes":{"special":"confuse","passive":"wounded"}}'
    },
    {
        seed: 10000,
        level: 13,
        xResult: '{"passes":2,"ca_rule":{"live":[6],"die":[1,2]},"colours":{"body_colour_one":{"hue":67,"sat":100,"lum":54},"body_colour_two":{"hue":177,"sat":100,"lum":62},"outline_colour":{"hue":67,"sat":55,"lum":9}},"stats":{"hp":704,"damage":168,"defend_chance":7,"special_chance":13,"kill_chance":6},"attributes":{"special":"stun","passive":"dodge"}}'
    },
    {
        seed: 214,
        level: 1,
        xResult: '{"passes":5,"ca_rule":{"live":[5],"die":[1]},"colours":{"body_colour_one":{"hue":56,"sat":100,"lum":70},"body_colour_two":{"hue":150,"sat":100,"lum":82},"outline_colour":{"hue":56,"sat":55,"lum":11.666666666666666}},"stats":{"hp":61,"damage":18,"defend_chance":0,"special_chance":2,"kill_chance":0},"attributes":{"special":"stun","passive":"wounded"}}'
    },
    {
        seed: 5523,
        level: 5,
        xResult: '{"passes":2,"ca_rule":{"live":[3,4],"die":[1,2]},"colours":{"body_colour_one":{"hue":239,"sat":100,"lum":63},"body_colour_two":{"hue":118,"sat":100,"lum":45},"outline_colour":{"hue":239,"sat":55,"lum":10.5}},"stats":{"hp":203,"damage":47,"defend_chance":2,"special_chance":2,"kill_chance":0},"attributes":{"special":"crit","passive":"heal"}}'
    },
    {
        seed: 511,
        level: 6,
        xResult: '{"passes":2,"ca_rule":{"live":[4],"die":[1,2]},"colours":{"body_colour_one":{"hue":112,"sat":100,"lum":46},"body_colour_two":{"hue":219,"sat":100,"lum":88},"outline_colour":{"hue":112,"sat":55,"lum":7.666666666666667}},"stats":{"hp":270,"damage":85,"defend_chance":4,"special_chance":8,"kill_chance":1},"attributes":{"special":"stun","passive":"wounded"}}'
    }
];

test("testing prng generation", () => {
    for (let { level, seed, xResult } of test_one_items) {
        const result = prng_generator(seed, level);
        expect(JSON.stringify(result)).toBe(xResult);
    }
    for (let { level, seed, xResult } of test_two_items) {
        const result = prng_generator_parsed(seed, level);
        expect(JSON.stringify(result)).toBe(xResult);
    }
});
