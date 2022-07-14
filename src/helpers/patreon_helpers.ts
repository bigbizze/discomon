import { PatreonTiers } from "../patreon-dbl-server";
import { TypedIndexer } from "./utility_types";


const get_tier_of = (tierOf: string) => ({
    "none": 0,
    "epic": 1,
    "mythic": 2,
    "legendary": 3
} as TypedIndexer<number>)[tierOf];

export const is_user_high_enough_premium_tier = (user_tier: PatreonTiers, check_against_tier: PatreonTiers): boolean => {
    return get_tier_of(user_tier) >= get_tier_of(check_against_tier);
};

