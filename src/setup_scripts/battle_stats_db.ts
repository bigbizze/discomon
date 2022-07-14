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

const get_stat_hash_and_lookup = (discomon_rows: DbDiscomon[]) => {
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
        if (y.owner === "test_dummy") {
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
            [y.id]: mon
        });
    }, {} as { [key: number]: MonState });
    return {
        stat_hash,
        discomon_lookup
    };
};

const sandbox_db = async (conn: Connection) => {
    const battles = await conn.query(`
        select * from battle_stats
        where battle_update_number = 2;
    `) as DbBattleStats[];
    const discomon_rows = await conn.query(`
        select * from discomon;
    `) as DbDiscomon[];
    const { discomon_lookup, stat_hash } = get_stat_hash_and_lookup(discomon_rows);
    for (let battle of battles.filter(x => [
        calculate_level(x.attacker_exp) === calculate_level(x.defender_exp),
        x.defender_discomon !== 1198,
        x.attacker_discomon !== 1198
    ].every(Boolean))) {
        const is_attacker_winner = battle.winner === "attacker";
        const attacker = discomon_lookup[battle.attacker_discomon];
        const defender = discomon_lookup[battle.defender_discomon];
        const [ winner, loser ] = is_attacker_winner ? [ attacker, defender ] : [ defender, attacker ];
        stat_hash.passives[winner.attributes.passive].wins++;
        stat_hash.passives[loser.attributes.passive].losses++;
        stat_hash.special[winner.attributes.special].wins++;
        stat_hash.special[loser.attributes.special].losses++;
        stat_hash.passives[winner.attributes.passive].wr = stat_hash.passives[winner.attributes.passive].wins / (stat_hash.passives[winner.attributes.passive].losses + stat_hash.passives[winner.attributes.passive].wins);
        stat_hash.special[winner.attributes.special].wr = stat_hash.special[winner.attributes.special].wins / (stat_hash.special[winner.attributes.special].losses + stat_hash.special[winner.attributes.special].wins);
    }
    await require("fs").promises.writeFile(`${ app_root_path }/data/battle-update-3-attribute-stats.json`, JSON.stringify(stat_hash, null, 4), "utf-8");
    console.log(stat_hash);
};

if (require.main === module) {
    const line_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    line_reader.question(`Are you sure? [Yes/No]: `, (answer: string) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            get_db_connection().then(async conn => {
                await sandbox_db(conn);
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




