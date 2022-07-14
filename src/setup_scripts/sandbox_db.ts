import readline from "readline";
import get_db_connection from "../tools/client/get_db_connection";
import { Connection } from "mariadb";
import { sleep } from "../helpers/general_helpers";
import { DbBattleStats, DbDiscomon } from "../scaffold/database_types";
import { calculate_level } from "../helpers/discomon_helpers";
import { TypedIndexer } from "../helpers/utility_types";
import { MonState } from "../scaffold/type_scaffolding";
import get_alphamon from "../tools/discomon/alpha_seed";
import { app_root_path } from "../constants";

const get_stat_hash_and_lookup = (discomon_rows: DbDiscomon[]): { discomon_lookup: { [p: string]: MonState } | { [p: string]: MonState }; stat_hash: { passives: TypedIndexer<{ wins: number; losses: number; wr: number }>; special: TypedIndexer<{ wins: number; losses: number; wr: number }> } } => {
    const stat_hash: {
        passives: TypedIndexer<{
            wins: number,
            losses: number,
            wr: number
        }>,
        special: TypedIndexer<{
            wins: number,
            losses: number,
            wr: number
        }>
    } = {
        passives: {},
        special: {}
    };
    const discomon_lookup = discomon_rows.reduce((obj, y) => {
        if (y.owner === "test_dummy" || y.id === 0) {
            return obj;
        }
        const mon = get_alphamon(y, "user");

        if (!stat_hash.special.hasOwnProperty(mon.attributes.special)) {
            stat_hash.special[mon.attributes.special] = {
                wins: 0,
                losses: 0,
                wr: 0
            };
        }

        if (!stat_hash.passives.hasOwnProperty(mon.attributes.passive)) {
            stat_hash.passives[mon.attributes.passive] = {
                wins: 0,
                losses: 0,
                wr: 0
            };
        }

        return ({
            ...obj,
            [y.owner]: mon
        });
    }, {} as { [key: string]: MonState });
    return {
        stat_hash,
        discomon_lookup
    };
};

const sandbox_db = async (conn: Connection) => {
    const all_vals = await conn.query(`
SELECT experience, owner
FROM discomon
order by owner;
    `) as { experience: number, owner: string }[];
    let cache: { [key: string]: number[] } = {};
    for (let { experience, owner } of all_vals) {
        if (!cache.hasOwnProperty(owner)) {
            cache[owner] = [];
        }
        cache[owner].push(experience);
        cache[owner].sort((a, b) => {
            return a > b ? -1 : 1;
        });
    }
    // let total = ;
    type UnitExperienceStat = {
        id: string
        total_hatched: number
        number_mons_18: number
        avg_level_hatched: number
    };
    let unit_experience_stats: UnitExperienceStat[] = [];
    for (let [ id, mons ] of Object.entries(cache)) {
        if (id === "279344233607987210" || id === "222310905935822848" || id === "98882846130720768") {
            continue;
        }
        const number_mons_18 = mons.filter(x => x > 3212).length;
        const total_hatched = mons.length;
        const avg_level_hatched = mons.reduce((a, b) => calculate_level(a === 0 ? 1 : a) + calculate_level(b === 0 ? 1 : b)) / number_mons_18 === 0 ? 1 : number_mons_18;
        unit_experience_stats.push({ id, number_mons_18, avg_level_hatched, total_hatched });
    }

    const totals: {
        avg_number_mons_18_per_person: number,
        avg_number_hatched: number
    } = {
        avg_number_mons_18_per_person: unit_experience_stats.reduce((obj, y) => (y.number_mons_18 === 0 ? 1 : y.number_mons_18) + obj, 0) / unit_experience_stats.length,
        avg_number_hatched: unit_experience_stats.reduce((obj, y) => (y.total_hatched === 0 ? 1 : y.total_hatched) + obj, 0) / unit_experience_stats.length
    };
    const xx = unit_experience_stats.reduce((obj, y) => {
        if (!obj.hasOwnProperty(y.total_hatched)) {
            obj[y.total_hatched] = {
                total: 0,
                avg: 0
            };
        }
        const next_total = obj[y.total_hatched].total + 1;
        obj[y.total_hatched] = {
            total: next_total,
            avg: next_total / unit_experience_stats.length
        };
        return obj;
    }, {} as { [key: number]: { total: number, avg: number } });
    const csv = `total hatched,num in group,avg of all hatched`;
    let csv_row: string[] = [];
    for (let [ total_hatched, { total, avg } ] of Object.entries(xx)) {
        csv_row.push(`${ total_hatched },${ total },${ avg }`);
    }
    // console.log(`${csv}\n${csv_row.join("\n")}`)
    // const percentage_of_people_above_three_hatches = unit_experience_stats.reduce((obj, y) => {
    //     if (!obj.hasOwnProperty(y.total_hatched)) {
    //         obj[y.total_hatched] = [];
    //     }
    // }, {} as {[key: number]: number[]}) / unit_experience_stats.length;
    // console.log(JSON.stringify(xx, null, 4));
    // console.log(JSON.stringify({
    //     percentage_of_people_above_three_hatches,
    //     totals,
    //     data: unit_experience_stats.sort((a, b) => a.number_mons_18 > b.number_mons_18 ? -1 : 1)
    // }, null, 4));
    // const avgs = all_vals.map(x => ({ exp: x["SUM(experience)"]})).reduce((obj, y) => {
    //     if (y.exp > 3212) {
    //         return {
    //             ...obj,
    //             above: [
    //                 ...obj.above,
    //                 y.exp
    //             ]
    //         };
    //     } else {
    //         return {
    //             ...obj,
    //             below: [
    //                 ...obj.below,
    //                 y.exp
    //             ]
    //         };
    //     }
    // }, {
    //     above: [],
    //     below: []
    // } as { above: number[], below: number[]});
    // const get_avg = (arr: number[]) => [arr.length, arr.reduce((a, b) => a + b)];
    // const total = avgs.below.length + avgs.above.length;
    // const avg_below = avgs.below.length / total;
    // const avg_above = avgs.above.length / total;
    // console.log(avg_below, avg_above);
    const battles = await conn.query(`
        select * from battle_stats
    `) as DbBattleStats[];
    const battle_lookup = battles.reduce((obj, y) => {
        if (!obj.hasOwnProperty(y.attacker)) {
            obj[y.attacker] = [];
        }
        obj[y.attacker] = [
            ...obj[y.attacker],
            y
        ];
        if (!obj.hasOwnProperty(y.defender)) {
            obj[y.defender] = [];
        }
        obj[y.defender] = [
            ...obj[y.defender],
            y
        ];
        return obj;
    }, {} as { [key: string]: DbBattleStats[] });
    const discomon_rows = await conn.query(`
        select * from discomon;
    `) as DbDiscomon[];
    const discomon_lookup = discomon_rows.reduce((obj, y) => {
        if (y.owner === "test_dummy" || y.id === 0) {
            return obj;
        }
        if (!obj.hasOwnProperty(y.owner)) {
            obj[y.owner] = [];
        }
        obj[y.owner].push(get_alphamon(y, "user"));
        return obj;
    }, {} as { [key: string]: MonState[] });
    let data = {} as { [key: string]: { mons: { discomon_id: number, level: number, special: string, passive: string, hp: number, dmg: number, spec: number }[], battles: DbBattleStats[] } };
    const id_list = unit_experience_stats.filter(x => x.total_hatched <= 4).map((x): string => x.id);
    for (let id of unit_experience_stats.filter(x => x.total_hatched <= 4).map((x): string => x.id)) {
        const mons = discomon_lookup[id];
        const battles = battle_lookup[id];
        if (mons == null || battles == null) {
            continue;
        }
        if (mons.some(x => x.id === 0 || x.id === 1198)) {
            continue;
        }
        data[id] = {
            mons: mons.reduce((obj, y) => {
                // if (y == null) {
                //     console.log(obj);
                //     return obj;
                // }
                return [
                    ...obj,
                    {
                        discomon_id: y.id,
                        level: y.level,
                        special: y.attributes.special,
                        passive: y.attributes.passive,
                        hp: y.stats.hp,
                        dmg: y.stats.damage,
                        spec: y.stats.special_chance
                    }
                ];
            }, [] as any),
            battles: battle_lookup[id]
        };
        // if (!data.hasOwnProperty(id)) {
        //
        // }
        // data[id].mons = [
        //     ...data[id].mons,
        //     ...mons.reduce((obj, y) => {
        //         // if (y == null) {
        //         //     console.log(obj);
        //         //     return obj;
        //         // }
        //         return [
        //             ...obj,
        //             {
        //                 level: y.level,
        //                 special: y.attributes.special,
        //                 passive: y.attributes.passive,
        //                 hp: y.stats.hp,
        //                 dmg: y.stats.damage,
        //                 spec: y.stats.special_chance
        //             }
        //         ];
        //     }, [] as any)
        // ];
        // data[id].battles = [
        //     ...data[id].battles,
        //     ...battle_lookup[id]
        // ];
    }
    await require("fs").promises.writeFile(`${ app_root_path }/data/big_data1.csv`,
        // JSON.stringify(
        `player_id,discomon_id,special,passive,level,hp,dmg,spec\n${ Object.entries(data).map(x => x[1].mons.map(y => `${ x[0] },${ y.discomon_id },${ y.special },${ y.passive },${ y.level },${ y.hp },${ y.dmg },${ y.spec }`).join("\n")).join("\n") }`,
        // , null, 4),
        "utf-8");
    await require("fs").promises.writeFile(`${ app_root_path }/data/battles.csv`,
        // JSON.stringify(
        `player_id,num_turns,is_pve,winner,attacker_id,attacker_discomon_id,attacker_exp,defender_id,defender_discomon_id,defender_exp\n${ Object.entries(data).map(x => x[1].battles.map(y => `${ x[0] },${ y.num_turns },${ y.is_pve },${ y.winner },${ y.attacker },${ y.attacker_discomon },${ y.attacker_exp },${ y.defender },${ y.defender_discomon },${ y.defender_exp }`).join("\n")).join("\n") }`,
        // , null, 4),
        "utf-8");
    // for (let battle of battles.filter(x => [
    //     calculate_level(x.attacker_exp) === calculate_level(x.defender_exp),
    //     // calculate_level(x.defender_exp) === 18,
    //     // calculate_level(x.attacker_exp) === 18,
    //     x.attacker !== "222310905935822848",
    //     x.defender !== "222310905935822848",
    //     x.attacker !== "756715401429123226",
    //     x.defender !== "756715401429123226",
    //     x.defender_discomon !== 1198,
    //     x.attacker_discomon !== 1198,
    //     x.defender_discomon !== 0,
    //     x.attacker_discomon !== 0
    // ].every(Boolean))) {
    //     const is_attacker_winner = battle.winner === "attacker";
    //     const attacker = discomon_lookup[battle.attacker_discomon];
    //     const defender = discomon_lookup[battle.defender_discomon];
    //     const [ winner, loser ] = is_attacker_winner ? [ attacker, defender ] : [ defender, attacker ];
    //     stat_hash.passives[winner.attributes.passive].wins++;
    //     stat_hash.passives[loser.attributes.passive].losses++;
    //     stat_hash.special[winner.attributes.special].wins++;
    //     stat_hash.special[loser.attributes.special].losses++;
    //     stat_hash.passives[winner.attributes.passive].wr = stat_hash.passives[winner.attributes.passive].wins / (stat_hash.passives[winner.attributes.passive].losses + stat_hash.passives[winner.attributes.passive].wins);
    //     stat_hash.special[winner.attributes.special].wr = stat_hash.special[winner.attributes.special].wins / (stat_hash.special[winner.attributes.special].losses + stat_hash.special[winner.attributes.special].wins);
    // }
    // await require("fs").promises.writeFile(`${ app_root_path }/data/battle-update-2-attribute-stats.json`, JSON.stringify(stat_hash, null, 4), "utf-8");
    // console.log(stat_hash);
};

if (require.main === module) {
    const line_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    line_reader.question(`Are you sure? [Yes/No]: `, (answer: string) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            get_db_connection().then(async conn => {
                try {
                    await sandbox_db(conn);
                } catch (e) {
                    console.log(e);
                }
                await conn.end();
                await sleep(250);
                process.kill(process.pid);
            }).catch(async err => {
                console.log(err);
                await sleep(250);
                process.kill(process.pid);
            });
        }
    });
}





