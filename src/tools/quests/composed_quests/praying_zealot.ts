import { CommandsReturn } from "../../../commands";
import { add_challenge, quest_embed } from "../../../helpers/quest_helpers";
import icon_manager from "../../../icon-manager";
import { send_to_discord } from "../../../helpers/discomon_helpers";

export const praying_zealotry =
    add_challenge<CommandsReturn>({
        name: "Zealotry",
        description: `
    Legendary patrons have been accused of blasphemy, prove them wrong with your incredible propensity for the gods by praying 6 times today.
    You will receive 250 dust for showing your faith!`,
        command_name: "pray",
        min_premium_level: "legendary",
        expires: {
            num_time_increments: 1,
            time_increment: "day"
        },
        check_quest_complete: async ({ matching_quest }) => {
            const new_value = (matching_quest.value !== 0 ? matching_quest.value : 1) + 1;
            return {
                quest_complete: new_value >= 6,
                new_value
            };
        },
        update_quest: async ({ matching_quest, quest_complete, new_value, client, user_id, props }) => {
            await client.db_fns.add_or_update_challenge(user_id, props, new_value, matching_quest.id);
            if (quest_complete) {
                await client.db_fns.add_or_update_challenge(user_id, props, undefined, matching_quest.id, true);
            }
        },
        on_complete: async ({ props, client, message, user_id }) => {
            await client.db_fns.increment_inventory(user_id, "dust", 250);
            const embed = quest_embed("dust", icon_manager("dust"), 250, props.name);
            send_to_discord(message.channel, embed);
        }
    });
