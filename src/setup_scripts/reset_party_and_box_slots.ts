import get_db_connection from "../tools/client/get_db_connection";
import { DbDiscomon } from "../scaffold/database_types";
import { sleep } from "../helpers/general_helpers";
import readline from 'readline';

const FOR_ID: string | null | string[] = [
    "wololo"
    // "244464896954204160",
    // "634516128605143067",
    // "663070679423385621",
    // "742969895603666964"
];

const get_sql_string = () => {
    const base = "select * from discomon when alive = 1";
    if (FOR_ID && Array.isArray(FOR_ID)) {
        return `${ base } and owner "${ FOR_ID.join("\" or owner = \"") };`;
    } else if (FOR_ID) {
        return `${ base } and owner = "${ FOR_ID }";`;
    }
    return `${ base };`;
};

export const reset_party_and_box_slots = async () => {
    const conn = await get_db_connection();
    const sql_string = get_sql_string();
    const all_discomon = (await conn.query(sql_string)) as DbDiscomon[];
    let cachishs: { [key: string]: DbDiscomon[] } = {};
    for (let discomon of all_discomon) {
        if (!cachishs.hasOwnProperty(discomon.owner)) {
            cachishs[discomon.owner] = [];
        }
        if (discomon.alive) {
            cachishs[discomon.owner].push(discomon);
        }
    }
    for (let [ _, mons ] of Object.entries(cachishs)) {
        let ghetto_count = 0;
        const sort_mons = mons.sort((a, b) => a.date_hatched < b.date_hatched ? -1 : 1);
        for (let i = 0; i < sort_mons.length; i++) {
            if (i < 3) {
                const sql_string = `update discomon set slot = ${ i + 1 }, box = null where id = ${ sort_mons[i].id };`;
                console.log(sql_string);
                await conn.query(sql_string);
            } else {
                const box_number = Math.ceil((i - 2) / 6);
                const slot_number_naive = (i - 2) % 6;
                const sql_string = `update discomon set slot = ${ slot_number_naive !== 0 ? slot_number_naive : 6 }, box = ${ box_number } where id = ${ sort_mons[i].id };`;
                console.log(sql_string);
                await conn.query(sql_string);
                if (slot_number_naive === 0) {
                    ghetto_count++;
                }
            }
        }
    }
    await conn.end();
    await sleep(3000);
    process.kill(process.pid);
};

const get_are_you_sure_question = () => {
    const base = "Are you sure? Doing this will reset the party and box slots of every Discomon for";
    if (FOR_ID && Array.isArray(FOR_ID)) {
        return `${ base } ${ FOR_ID.length + 1 } users!`;
    } else if (FOR_ID) {
        return `${ base } the user ${ FOR_ID }!`;
    }
    return `${ base } ALL Discomon users!`;
};

if (require.main === module) {
    if ((typeof FOR_ID === "string" && FOR_ID === "") || (Array.isArray(FOR_ID) && FOR_ID.length === 0)) {
        console.log("No Ids specified to reset!");
        process.kill(process.pid);
    }
    const line_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    line_reader.question(`${ get_are_you_sure_question() } [Yes/No]: `, (answer: string) => {
        console.log(answer);
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
            reset_party_and_box_slots().then().catch(err => console.log(err));
        }
    });
}
