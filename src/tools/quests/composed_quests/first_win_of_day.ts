import { BattleReturn } from "../../../commands/battle";
import { resolve_user_from_battle } from "../utils";
import { add_challenge, quest_embed } from "../../../helpers/quest_helpers";
import icon_manager from "../../../icon-manager";
import { send_to_discord } from "../../../helpers/discomon_helpers";
import { startOfDay } from "date-fns";

export const first_win_of_the_day =
    add_challenge<BattleReturn>({
        name: "First win of the day",
        description: `
    Patrons gain lootboxes for the first time they win a battle today!
    Epic patrons receive 5, Mythic patrons receive 10 & Legendary patrons receive 25`,
        command_name: "battle",
        min_premium_level: "epic",
        expires: {
            // CURRENTLY BROKEN
            num_time_increments: 1,
            time_increment: "day",
            start_time: startOfDay(new Date())
        },
        check_quest_complete: async ({ cmd_return, user_id }) => {
            if (!cmd_return || cmd_return === "never_finished") {
                return {
                    quest_complete: false
                };
            }
            const battle = resolve_user_from_battle(user_id, cmd_return);
            return {
                quest_complete: battle.battle_side.hp > 0
            };
        },
        update_quest: async ({ user_id, quest_complete, client, props, matching_quest }) => {
            if (quest_complete) {
                await client.db_fns.add_or_update_challenge(user_id, props, undefined, matching_quest.id, true);
            }
        },
        on_complete: async ({ props, client, message, user_id, premium }) => {
            const amount = premium === "epic" ? 5 : premium === "mythic" ? 10 : premium === "legendary" ? 25 : 0;
            await client.db_fns.increment_inventory(user_id, "lootbox", amount);
            const embed = quest_embed("lootbox", icon_manager("lootbox"), amount, props.name);
            send_to_discord(message.channel, embed);
        }
    });
