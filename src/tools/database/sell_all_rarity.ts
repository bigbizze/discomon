import get_all_items from "./get_all_items";
import increment_inventory from "./increment_inventory";

import { ConnectPromise } from "../client/get_db_connection";

export default function (db: ConnectPromise): (owner_id: string, rarity: number) => Promise<number> {
    return async (owner_id: string, rarity: number): Promise<number> => {
        const items = await get_all_items(db)(owner_id); // TODO: Type here is probably wrong!
        const { total, to_del } = await items.reduce(async (obj, item) => (
            item.rarity === rarity ? {
                total: (await obj).total + price_for_sell(item.rarity),
                to_del: [ ...(await obj).to_del, item.id ]
            } : obj
        ), Promise.resolve({
            total: 0,
            to_del: [] as number[]
        }));
        const delete_str = to_del.toString();
        await db.query(`UPDATE items SET destroyed = 1 WHERE id in (${ delete_str })`);
        await increment_inventory(db)(owner_id, 'dust', total);
        return total;
    };
}

const price_for_sell = (item_rarity: number) => {
    switch (item_rarity) {
        case 4:
            return 200;
        case 3:
            return 100;
        case 2:
            return 20;
        case 1:
            return 5;
        case 0:
            return 10;
        default:
            return 0;
    }
};
