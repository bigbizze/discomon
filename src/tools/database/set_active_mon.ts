import { first } from "../../helpers/array_helpers";

import { ConnectPromise } from "../client/get_db_connection";
import { DbDiscomon } from "../../scaffold/database_types";
import set_player_value from "./set_player_value";
import { is_null_or_nan } from "../../helpers/general_helpers";
import { get_mons } from "./get_mons";

const get_index = (all_mon: DbDiscomon[], id: number) => {
    const at_idx = all_mon[id - 1];
    if (!at_idx) {
        // if (!all_mon[at_idx]) { // TODO: This might be wrong .. ?
        return 0;
    }
    return id - 1;
};

const get_mon_id = (all_mon: DbDiscomon[], id: number): number => {
    const index = get_index(all_mon, id);
    if (!first(all_mon)) {
        return 0;
    } else if (all_mon[index].id !== 0) {
        return index + 1;
    } else {
        return all_mon[index].id;
    }
};

export function set_active_mon(db: ConnectPromise): (user_id: string, slot: number) => Promise<number>;
export function set_active_mon(db: ConnectPromise): (user_id: string, slot: number) => Promise<number | undefined> {
    return async (user_id?: string, slot = 1): Promise<number | undefined> => {
        if (user_id == null || is_null_or_nan(slot)) {
            return;
        }
        const all_mon = await get_mons(db)(user_id, "party");
        if (!all_mon) {
            throw new Error("No mon in party?");
        }
        const mon = all_mon.filter(x => x.slot === slot).pop();
        const mon_id = mon ? mon.id : all_mon[0].id;
        await set_player_value(db)(user_id, 'active_mon', mon_id);
        return mon?.slot ? mon.slot : 1;
    };
}
