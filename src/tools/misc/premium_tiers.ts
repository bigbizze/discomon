import { Indexer } from "../../helpers/utility_types";
import { PatreonTiers } from "../../patreon-dbl-server";

type TierLimit = {
    egg_slots: number
    party_slots: number
    vote_credit_multiplier: number
    lootbox_from_praying_multiplier: number
    egg_from_praying_multiplier: number
    candies_from_pray: number
    boxes_allowed: number
};

interface PremiumObj extends Indexer {
    none: TierLimit;
    epic: TierLimit;
    mythic: TierLimit;
    legendary: TierLimit;
}

const premium: PremiumObj = {
    none: {
        egg_slots: 3,
        party_slots: 3,
        vote_credit_multiplier: 1,
        lootbox_from_praying_multiplier: 1,
        egg_from_praying_multiplier: 1,
        candies_from_pray: 0,
        boxes_allowed: 1
    },
    epic: {
        egg_slots: 4,
        party_slots: 3,
        vote_credit_multiplier: 1.3,
        lootbox_from_praying_multiplier: 1.3,
        egg_from_praying_multiplier: 1.1,
        candies_from_pray: 1,
        boxes_allowed: 2
    },
    mythic: {
        egg_slots: 5,
        party_slots: 3,
        vote_credit_multiplier: 1.6,
        lootbox_from_praying_multiplier: 1.6,
        egg_from_praying_multiplier: 1.2,
        candies_from_pray: 2,
        boxes_allowed: 4
    },
    legendary: {
        egg_slots: 6,
        party_slots: 3,
        vote_credit_multiplier: 2,
        lootbox_from_praying_multiplier: 2,
        egg_from_praying_multiplier: 1.3,
        candies_from_pray: 4,
        boxes_allowed: 12
    }
};

export const get_premium_tier = (tier: PatreonTiers): TierLimit => {
    return premium[tier];
};
