import { message } from "./message";
import { ready } from "./ready";
import { UnresolvedClientOperator } from "../bot-types";


export default async function register_events(client: UnresolvedClientOperator) {
    try {
        return [ message, ready ].forEach(fn => client.discord.on(fn.name as any, fn(client)));
    } catch (err) {
        throw err;
    }
}
