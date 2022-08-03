// const SQLite = require("better-sqlite3");
// const sql = new SQLite('../discomon.db');
import { withDb } from "../tools/client/get_db_connection";
import { get_random_boss_name } from "../helpers/discomon_helpers";
import { get_alpha_from_seed } from "../tools/discomon/alpha_seed/utils";
import readline from "readline";


const players = `
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(18) PRIMARY KEY NOT NULL,
	active_mon INTEGER NOT NULL DEFAULT 0,
	last_battle DATETIME DEFAULT NULL,
	last_pray BIGINT DEFAULT 0,
	registered BIGINT NOT NULL DEFAULT ${ Date.now() },
	active_box INTEGER NOT NULL DEFAULT 1
);`;

const discomon = `
CREATE TABLE IF NOT EXISTS discomon (
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
	seed TEXT NOT NULL,
	nickname VARCHAR(255) NOT NULL DEFAULT 'unknown',
	experience INTEGER NOT NULL DEFAULT 0,
	date_hatched BIGINT NOT NULL,
	alive TINYINT NOT NULL DEFAULT 1,
	wins INTEGER NOT NULL DEFAULT 0,
	losses INTEGER NOT NULL DEFAULT 0,
	kills INTEGER NOT NULL DEFAULT 0,
	boss_damage INTEGER NOT NULL DEFAULT 0,
	owner VARCHAR(18) NOT NULL,
	boss_kills INTEGER NOT NULL DEFAULT 0,
	box INTEGER DEFAULT null,
	slot INTEGER DEFAULT 1,
	FOREIGN KEY(owner) REFERENCES players(id)
);`;

const items = `
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    seed VARCHAR(255) NOT NULL,
	hue INTEGER NOT NULL,
	owner VARCHAR(18) NOT NULL,
	discomon INTEGER DEFAULT null,
	destroyed TINYINT NOT NULL DEFAULT 0,
	slot INTEGER DEFAULT null,
	FOREIGN KEY(owner) REFERENCES players(id),
	FOREIGN KEY(discomon) REFERENCES discomon(id)
);`;

// TODO: foreign key should probably not be primary key.
const inventory = `
CREATE TABLE IF NOT EXISTS inventory (
    owner VARCHAR(18) PRIMARY KEY NOT NULL,
	credits INTEGER NOT NULL DEFAULT 0,
	dust INTEGER NOT NULL DEFAULT 0,
	chip INTEGER NOT NULL DEFAULT 2,
	dna INTEGER NOT NULL DEFAULT 0,
	token INTEGER NOT NULL DEFAULT 0,
	shield BIGINT NOT NULL DEFAULT 0,
	lootbox INTEGER NOT NULL DEFAULT 0,
	runebox INTEGER NOT NULL DEFAULT 0,
	tag INTEGER NOT NULL DEFAULT 0,
	current_boss_damage INTEGER NOT NULL DEFAULT 0,
	candy INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY(owner) REFERENCES players(id)
);`;

const boss = `
CREATE TABLE IF NOT EXISTS boss(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    seed TEXT NOT NULL,
	experience INTEGER NOT NULL,
	name VARCHAR(44) NOT NULL,
	hp INTEGER NOT NULL,
	max_hp INTEGER NOT NULL,
	damage INTEGER NOT NULL,
	proc INTEGER NOT NULL,
	wins INTEGER NOT NULL DEFAULT 0,
	kills INTEGER NOT NULL DEFAULT 0,
	alive TINYINT NOT NULL DEFAULT 1,
	attempts INTEGER NOT NULL DEFAULT 0,
	last_reset BIGINT NOT NULL DEFAULT ${ Date.now() }
);`;

const seeds = `
CREATE TABLE IF NOT EXISTS seeds(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    seed TEXT NOT NULL,
	times_used INTEGER NOT NULL,
	discovered_by VARCHAR(255) NOT NULL,
	discovered_date BIGINT NOT NULL,
	global_name VARCHAR(255) NOT NULL
);`;

const eggs = `
CREATE TABLE IF NOT EXISTS eggs(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    owner VARCHAR(18) NOT NULL,
    type VARCHAR(255) NOT NULL,
    adam VARCHAR(255) DEFAULT NULL,
    eve VARCHAR(255) DEFAULT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_on TIMESTAMP NOT NULL DEFAULT current_timestamp
);`;

const patreon = `
CREATE TABLE IF NOT EXISTS patreon(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    patron_id INTEGER NOT NULL,
    discord_id VARCHAR(255) NOT NULL DEFAULT "none",
    name VARCHAR(255) NOT NULL DEFAULT "unknown",
    tier VARCHAR(255) NOT NULL DEFAULT "none",
    charge_status VARCHAR(255) NOT NULL DEFAULT "none",
    paid_on DATETIME NOT NULL
);`;

const quests = `
CREATE TABLE IF NOT EXISTS quests(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    owner VARCHAR(18) NOT NULL,
    command_name VARCHAR(30),
    expires_on DATETIME,
    value INTEGER,
    complete TINYINT(4),
	FOREIGN KEY(owner) REFERENCES players(id)
);`;

const battle_stats = `
CREATE TABLE IF NOT EXISTS battle_stats(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
	num_turns SMALLINT NOT NULL,
	is_pve TINYINT NOT NULL,
	winner VARCHAR(8) NOT NULL,
	attacker VARCHAR(18) NOT NULL,
	attacker_discomon INTEGER NOT NULL,
	attacker_exp INTEGER NOT NULL,
	defender VARCHAR(18) NOT NULL,
	defender_discomon INTEGER NOT NULL,
	defender_exp INTEGER NOT NULL,
    battle_update_number INT(11) NOT NULL DEFAULT 1,
	time_of_battle DATETIME NOT NULL
);`;

const battle_turns_stats = `
CREATE TABLE IF NOT EXISTS battle_turns_stats(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    owner VARCHAR(18) NOT NULL,
	discomon INTEGER NOT NULL,
	battle_id INTEGER NOT NULL,
    turn_num SMALLINT NOT NULL,
    status_special VARCHAR(20) NOT NULL,
    status_passive VARCHAR(20) NOT NULL,
    status_item VARCHAR(20) NOT NULL,
	dmg INTEGER NOT NULL,
    dmg_taken INTEGER NOT NULL,
    heal INTEGER NOT NULL,
    special_dmg INTEGER NOT NULL,
    passive_dmg INTEGER NOT NULL,
    item_dmg INTEGER NOT NULL,
    special_dmg_recv INTEGER NOT NULL,
    passive_dmg_recv INTEGER NOT NULL,
    item_dmg_recv INTEGER NOT NULL,
    time_of_turn DATETIME NOT NULL,
	FOREIGN KEY(owner) REFERENCES players(id),
	FOREIGN KEY(discomon) REFERENCES discomon(id),
	FOREIGN KEY(battle_id) REFERENCES battle_stats(id)
);`;


const server_options = `
CREATE TABLE IF NOT EXISTS server_options(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    reboot BOOLEAN NOT NULL DEFAULT 0,
    reboot_reason TEXT NOT NULL
);`;

const guilds = `
CREATE TABLE IF NOT EXISTS guilds (
    id VARCHAR(18) PRIMARY KEY NOT NULL,
    owner VARCHAR(18) NOT NULL,
    shard_id SMALLINT(6) UNSIGNED NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    locale VARCHAR(25) DEFAULT NULL,
    num_members INTEGER UNSIGNED DEFAULT NULL,
    num_text_channels SMALLINT(6) UNSIGNED DEFAULT NULL,
    prefix VARCHAR(8) DEFAULT NULL,
    last_updated DATETIME NOT NULL,
    FOREIGN KEY(owner) REFERENCES players(id)
);`;

// const box = `
// CREATE TABLE IF NOT EXISTS server_options(
//     id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
//     mon_one INTEGER DEFAULT NULL,
// 	FOREIGN KEY(owner) REFERENCES players(id)
// );
// `;

export const default_boss = (date?: Date) => `
INSERT INTO boss(seed, experience, hp, max_hp, damage, proc, last_reset, name)
VALUES("${ get_alpha_from_seed(123456) }", 6500, 400000, 400000, 150, 15, "${ Date.now() }", "${ get_random_boss_name() }");
`;

const date_str = `FROM_UNIXTIME(${ Math.floor(Date.now() / 1000) })`;
const create_admins = () => `
INSERT INTO players(id, registered)
VALUES (279344233607987210, ${Date.now()});`;

const admin_inventory = `
UPDATE Discomon.inventory
SET credits=100000, dust=100000, chip=100000, token=100000, lootbox=100000, runebox=100000, tag=100000, candy=100000
WHERE owner="279344233607987210" or owner="217934695055228928";
`;

const reboot_string = `
INSERT INTO server_options(reboot, reboot_reason)
VALUES(0, "default");
`;
if (require.main === module) {
    const line_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    line_reader.question(`This will create if not exists all tables in the database, are you sure? [Yes/No]: `, (answer: string) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            const create_table_queries = [
                players,
                discomon,
                items,
                inventory,
                boss,
                seeds,
                eggs,
                patreon,
                battle_stats,
                battle_turns_stats,
                server_options,
                reboot_string,
                quests,
                guilds,
                default_boss()
                // create_admins()
            ];
            withDb(async conn => {
                await conn.beginTransaction();
                // console.log(conn.query);
                // const test2 = await get_user(conn)("279344233607987210");
                // const test = await get_user({
                //     ...conn,
                //     query: query_promisify(conn.query)
                // })("279344233607987210");
                // console.log(test);
                for (let table_query of create_table_queries) {
                    await conn.query(table_query);
                }
                await conn.commit();
                // await conn.beginTransaction();
                // await conn.query(admin_inventory);
                // await conn.commit();
                await conn.end();
            })
              .catch(err => console.log(err))
              .finally(() => process.exit(0));
        }
    });
}

