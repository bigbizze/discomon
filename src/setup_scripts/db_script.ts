const SQLite = require("better-sqlite3");
const sql = new SQLite('./discomon.db');

// sql.prepare(`UPDATE players SET last_mon = 0 WHERE id = '217934695055228928'`).run();
// console.log('done');

// sql.prepare(`CREATE TABLE IF NOT EXISTS boss (id TEXT PRIMARY KEY NOT NULL, seed INTEGER NOT NULL, experience INTEGER NOT NULL, 
// 	wins INTEGER NOT NULL, losses INTEGER NOT NULL, kills INTEGER NOT NULL, hp INTEGER NOT NULL, current_hp INTEGER NOT NULL, damage INTEGER NOT NULL, special INTEGER NOT NULL,
// 	active INTEGER NOT NULL, attempts INTEGER NOT NULL, battling INTEGER NOT NULL)`).run();
// sql.prepare(`ALTER TABLE players ADD COLUMN boss_damage INTEGER NOT NULL DEFAULT 0`).run();
sql.prepare(`ALTER TABLE inventory ADD COLUMN candy INTEGER NOT NULL DEFAULT 0`).run();
// sql.prepare(`INSERT INTO boss(id, seed, experience, wins, losses, kills, hp, current_hp, damage, special,
// 	active, attempts, battling) 
// 		VALUES(1, 1024, 6500, 0, 0, 0, 800000, 800000, 110, 35, 1, 0, 0)`).run();
// sql.prepare(`UPDATE boss SET seed = 1024, experience = 6500, wins = 0, losses = 0, kills = 0, current_hp = 800000, hp = 800000,
// 	damage = 110, special = 35, active = 1, attempts = 0, battling = 0 WHERE id = 1`).run();
// sql.prepare(`DELETE FROM players WHERE id = 612622697045950474`).run();
// console.log('Hep DELETED.');	

