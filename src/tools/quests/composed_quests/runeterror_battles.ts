import { CommandsReturn } from "../../../commands";
import { add_challenge, quest_embed } from "../../../helpers/quest_helpers";
import icon_manager from "../../../icon-manager";
import { send_to_discord } from "../../../helpers/discomon_helpers";
import { Quest } from "../index";
import { startOfDay } from "date-fns";
import { BattleReturn } from "../../../commands/battle";


export const runeterror_battles: Quest<CommandsReturn> =
    add_challenge<BattleReturn>({
        name: "Runeterror Battles",
        description: `
    Battle the Runeterror 15 times to earn 50/100/150/200 dust today depending on your Patreon tier.`,
        command_name: [
            "battle"
        ],
        min_premium_level: "none",
        expires: {
            // Not working currently
            num_time_increments: 1,
            time_increment: "day",
            start_time: startOfDay(new Date())
        },
        check_quest_complete: async ({ cmd_return, user_id, matching_quest }) => {
            if (!cmd_return || cmd_return === "never_finished") {
                return {
                    quest_complete: false
                };
            }
            const increment = cmd_return.state.is_boss_battle ? 1 : 0;
            const new_value = matching_quest.value + increment;
            return {
                quest_complete: new_value >= 15,
                new_value
            };
        },
        update_quest: async ({ matching_quest, client, user_id, props, new_value, quest_complete }) => {
            await client.db_fns.add_or_update_challenge(user_id, props, new_value, matching_quest.id);
            if (quest_complete) {
                await client.db_fns.add_or_update_challenge(user_id, props, undefined, matching_quest.id, true);
            }
        },
        on_complete: async ({ props, client, message, user_id, premium }) => {
            const amount = premium === "epic" ? 100 : premium === "mythic" ? 150 : premium === "legendary" ? 200 : 50;
            await client.db_fns.increment_inventory(user_id, "dust", amount);
            const embed = quest_embed("dust", icon_manager("dust"), amount, props.name);
            send_to_discord(message.channel, embed);
        }
    });


