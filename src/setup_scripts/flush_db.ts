import get_db_connection from "../tools/client/get_db_connection";
import { Connection } from "mariadb";
import readline from "readline";

if (require.main === module) {
    const line_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    line_reader.question(`This will delete all data from the database and drop all tables, are you sure? [Yes/No]: `, (answer: string) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            get_db_connection().then(async (conn: Connection) => {
                await conn.beginTransaction();
                const tables = (await conn.query('show tables;')).map((x: any) => x.Tables_in_Discomon) as string[];
                for (let table of tables) {
                    try {
                        console.log(`drop table ${ table }`);
                        await conn.query(`drop table ${ table }`);
                    } catch {
                    }
                }
                await conn.commit();
                await conn.end();
            }).catch(err => console.log(err));
        }
    });
}





