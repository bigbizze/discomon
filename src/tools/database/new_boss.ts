import { ConnectPromise } from "../client/get_db_connection";
import { random } from "../../helpers/rng_helpers";
import { get_random_boss_name } from "../../helpers/discomon_helpers";
import { get_alpha_from_seed } from "../discomon/alpha_seed/utils";
import get_players_active_in_timeframe from "./get_players_active_in_timeframe";

export default function (db: ConnectPromise): (time_of_reset: number, is_boss_dead: boolean) => Promise<void> {
    return async (time_of_reset: number, is_boss_dead: boolean): Promise<void> => {
        const seed = get_alpha_from_seed(random(1, 100000));
        const num_active_players = await get_players_active_in_timeframe(db)();
        const hp = num_active_players * 1000;
        const damage = random(50, 200);
        const proc = random(5, 20);
        await db.query(`INSERT INTO boss(seed, experience, name, hp, max_hp, damage, proc, last_reset) VALUES("${ seed }", 6500, "${ await get_random_boss_name() }", ${ hp }, ${ hp }, ${ damage }, ${ proc }, ${ time_of_reset })`);
        if (is_boss_dead) {
            await db.query(`UPDATE inventory SET dust = (dust + round(current_boss_damage/360) + 1) WHERE current_boss_damage > 0`);
            await db.query(`UPDATE inventory SET current_boss_damage = 0`);
        }
    };
}