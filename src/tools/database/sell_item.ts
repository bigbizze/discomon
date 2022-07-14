import get_item from "./get_item";
import increment_inventory from "./increment_inventory";
import { first } from "../../helpers/array_helpers";


import { ConnectPromise } from "../client/get_db_connection";
import { is_null_or_nan } from "../../helpers/general_helpers";

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

export default function (db: ConnectPromise): (item_id: number, owner_id: string) => Promise<number | undefined> {
    return async (item_id: number, owner_id: string): Promise<number | undefined> => {
        if (is_null_or_nan(item_id)) {
            return;
        }
        const item = await get_item(db)(item_id);
        const first_item = first(item);
        if (item.length !== 1 || !first_item) {
            return;
        }
        const price = price_for_sell(first_item.rarity);
        await db.query(`DELETE FROM items WHERE id = ${ item_id }`);
        await increment_inventory(db)(owner_id, 'dust', price);
        return price;
    };
}
