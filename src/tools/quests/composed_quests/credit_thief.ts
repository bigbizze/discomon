import { CommandsReturn } from "../../../commands";
import { add_challenge, quest_embed } from "../../../helpers/quest_helpers";
import icon_manager from "../../../icon-manager";
import { send_to_discord } from "../../../helpers/discomon_helpers";

export const credit_thief =
    add_challenge<CommandsReturn>({
        name: "Credit Thief",
        description: `
    Legendary patrons get the chance to show off their ability to steal from the gods.
    Acquire 1000 credits from praying in one day and get rewarded with 10 runeboxes`,
        command_name: "pray",
        min_premium_level: "legendary",
        expires: {
            num_time_increments: 1,
            time_increment: "day"
        },
        check_quest_complete: async ({ cmd_return, matching_quest }) => {
            if (!cmd_return || typeof cmd_return !== "number") {
                return {
                    quest_complete: false
                };
            }
            const new_value = matching_quest.value + cmd_return;
            return {
                quest_complete: new_value >= 1000,
                new_value
            };
        },
        update_quest: async ({ matching_quest, quest_complete, new_value, client, user_id, props }) => {
            if (!new_value) {
                return;
            }
            await client.db_fns.add_or_update_challenge(user_id, props, new_value, matching_quest.id);
            if (quest_complete) {
                await client.db_fns.add_or_update_challenge(user_id, props, undefined, matching_quest.id, true);
            }
        },
        on_complete: async ({ props, client, message, user_id }) => {
            await client.db_fns.increment_inventory(user_id, "runebox", 10);
            const embed = quest_embed("runebox", icon_manager("runebox"), 10, props.name);
            send_to_discord(message.channel, embed);
        }
    });
