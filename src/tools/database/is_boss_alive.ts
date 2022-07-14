import { ConnectPromise } from "../client/get_db_connection";
import get_boss from "./get_boss";

export default function (db: ConnectPromise) {
    return async (): Promise<boolean> => {
        const boss = await get_boss(db)();
        return boss.alive;
    };
}
