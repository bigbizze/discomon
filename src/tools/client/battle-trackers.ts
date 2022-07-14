import { MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";
import fetch from 'node-fetch';
import { TypedIndexer } from "../../helpers/utility_types";
import { sleep } from "../../helpers/general_helpers";

/** Tracking number of battles a given user at once is in for limiting purposes */

////////////////////////////////////////////////////////////

interface IncrementTrackerResponse {
    error?: string;
    is_error: boolean;
}

function add_query_params_to_url(params: { [key: string]: string }, url: string) {
    return url + "?" + Object.entries(params).map(function (x) {
        return (x[0] + "=" + encodeURIComponent(x[1]));
    }).join("&");
}

const get_tracker_req = async <T>(id_obj: TypedIndexer<string>, route: "increment" | "decrement" | "check", is_json: boolean, attempts = 0): Promise<T | null | number> => {
    if (attempts === 5) {
        return null;
    }
    const url = `http://0.0.0.0:5001/${ route }`;
    try {
        const res = await fetch(add_query_params_to_url(id_obj, url), {
            method: "GET"
        });
        if (res.status === 200) {
            if (is_json) {
                return await res.json() as T;
            }
            return res.status;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
    await sleep(250 * (attempts + 1));
    return await get_tracker_req(id_obj, route, is_json, attempts + 1);
};

export type DecrementFn = () => Promise<boolean>;

export async function increment_battle_trackers(message: MessageNonNull, opponent_id?: string): Promise<void | DecrementFn> {
    const id_obj: TypedIndexer<string> = {
        guild_id: message.guild.id,
        channel_id: message.channel.id,
        user_id: message.member.id
    };
    if (opponent_id) {
        id_obj["opponent_id"] = opponent_id;
    }
    const increment_result = await get_tracker_req<IncrementTrackerResponse>(id_obj, "increment", true);
    if (increment_result == null || typeof increment_result === "number") {
        return console.log("Got no response from tracking service trying to increment!");
    }
    if (increment_result.is_error) {
        return send_to_discord(message.channel, increment_result.error ? increment_result.error : "You cannot do this yet!");
    }
    return async () => {
        const decrement_result = await get_tracker_req(id_obj, "decrement", false);
        if (decrement_result == null) {
            console.log("Got no response from tracking service trying to increment!");
            return false;
        }
        return true;
    };
}

export async function check_battle_trackers(message: MessageNonNull): Promise<void | true> {
    const id_obj: TypedIndexer<string> = {
        user_id: message.member.id
    };
    const checker_result = await get_tracker_req<IncrementTrackerResponse>(id_obj, "check", true);
    if (checker_result == null || typeof checker_result === "number") {
        return console.log("Got no response from tracking service trying to increment!");
    }
    if (checker_result.is_error) {
        return send_to_discord(message.channel, checker_result.error);
    }
    return true;
}





