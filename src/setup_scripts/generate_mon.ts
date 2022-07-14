import get_db_connection from "../tools/client/get_db_connection";
import { promise_then_catch, sleep } from "../helpers/general_helpers";
import get_alphamon from "../tools/discomon/alpha_seed";
import { DbDiscomon } from "../scaffold/database_types";
import { clamp } from "../tools/discomon/image-generator/utils";
import { calculate_level } from "../helpers/discomon_helpers";

const test: DbDiscomon = {
    id: 1198,
    alive: true,
    boss_damage: 0,
    boss_kills: 0,
    date_hatched: 0,
    experience: 3312,
    item_id: 0,
    kills: 0,
    level: clamp(calculate_level(3312), 1, 18),
    losses: 0,
    modifiers: [],
    nickname: "",
    owner: "",
    seed: "227E05-2C3E95-2C3E94-35B5FE-35B5FE-2C3E91-21117A-211179-AD2C95-9661F3::0:0:0:0:0:0:0:0:0:0",
    wins: 0
};
const want = {
    ca_rule: "XXXXXX",
    type: "2C3E95",
    passes: "XXXXXX",
    colours: "2C3E93",
    special: "XXXXXX",
    passive: "F483E7",
    not_sure: "XXXXXX",
    hp: "4EBD2D",
    damage: "AD2C95",
    sp_chance: "9661F3"
};

async function gen_mon() {
    const seed = "5F9009-21117F-AD2C9B-BC382F-21117D-F483E7-21117A-AD2C96-AD2C95-AD2C94";
    const conn = await get_db_connection();
    const discomon_rows = await conn.query(`
        select * from discomon;
    `) as DbDiscomon[];
    const highest_stats: {
        hp: number[],
        dmg: number[],
        spec: number[]
    } = {
        hp: [],
        dmg: [],
        spec: []
    };
    const mon = get_alphamon(test, "user");
    console.log({
        ca: mon.ca_rule,
        type: mon.type,
        passes: mon.passes,
        colours: mon.colours,
        attributes: mon.attributes,
        stats: mon.stats
    });
    // const get_lowest = (d: number[]) => d.reduce((a, b) => a < b ? a : b);
    // for (let row of discomon_rows) {
    //     if (row.id === 1198 || row.id === 0) {
    //         continue;
    //     }
    //     if (row.owner !== "689080101295751174") {
    //         continue;
    //     }
    //     try {
    //         // const mon_db = get_first_db_row(await conn.query(`SELECT * FROM discomon WHERE seed = "${ seed }::0:0:0:0:0:0:0:0:0:0";`));
    //         const mon = get_alphamon({
    //             ...row,
    //             experience: 3400
    //         }, "user");
    //         if (!highest_stats.hp.includes(mon.stats.hp)) {
    //             highest_stats.hp.push(mon.stats.hp);
    //         }
    //         if (!highest_stats.dmg.includes(mon.stats.damage)) {
    //             highest_stats.dmg.push(mon.stats.damage);
    //         }
    //         if (!highest_stats.spec.includes(mon.stats.special_chance)) {
    //             highest_stats.spec.push(mon.stats.special_chance);
    //         }
    //         // if (mon.stats.hp > get_lowest(highest_stats.hp)) {
    //         //     highest_stats.hp = highest_stats.h
    //         // }
    //         // if (mon.stats.damage > get_lowest(highest_stats.dmg)) {
    //         //     highest_stats.dmg = mon.stats.damage;
    //         // }
    //         // if (mon.stats.special_chance > get_lowest(highest_stats.spec)) {
    //         //     highest_stats.spec = mon.stats.special_chance;
    //         // }
    //         // if (mon.stats.special_chance === 34) {
    //         //     console.log(mon.owner);
    //         // }
    //         console.log({
    //             ca: mon.ca_rule,
    //             type: mon.type,
    //             passes: mon.passes,
    //             colours: mon.colours,
    //             attributes: mon.attributes,
    //             stats: mon.stats
    //         // });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    // console.log({
    //     hp: highest_stats.hp.sort((a, b) => a < b ? 1 : -1).slice(0, 5),
    //     dmg: highest_stats.dmg.sort((a, b) => a < b ? 1 : -1).slice(0, 5),
    //     spec: highest_stats.spec.sort((a, b) => a < b ? 1 : -1).slice(0, 5)
    // });
    // await conn.end();
    await sleep(500);
    process.kill(process.pid);
}

if (require.main === module) {
    promise_then_catch(gen_mon());
}
