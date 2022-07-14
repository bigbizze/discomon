import { CommandsReturn } from "../../../commands";
import { add_challenge, quest_embed } from "../../../helpers/quest_helpers";
import icon_manager from "../../../icon-manager";
import { send_to_discord } from "../../../helpers/discomon_helpers";
import { Quest } from "../index";
import { startOfDay } from "date-fns";


export const three_hatch_three_sacrifice: Quest<CommandsReturn> =
    add_challenge<CommandsReturn>({
        name: "Hatch 3 & Sacrifice 3",
        description: `
    Everyone gets 3 runeboxes when they hatch 3 & sacrifice 3 discomon today`,
        command_name: [
            "hatch",
            "sacrifice"
        ],
        min_premium_level: "none",
        expires: {
            // Not working currently
            num_time_increments: 1,
            time_increment: "day",
            start_time: startOfDay(new Date())
        },
        check_quest_complete: async ({ matching_quest }) => {
            const new_value = matching_quest.value + 1;
            return {
                quest_complete: new_value >= 3,
                new_value
            };
        },
        update_quest: async ({ matching_quest, client, user_id, props, new_value, quest_complete }) => {
            await client.db_fns.add_or_update_challenge(user_id, props, new_value, matching_quest.id);
            if (quest_complete) {
                await client.db_fns.add_or_update_challenge(user_id, props, undefined, matching_quest.id, true);
            }
        },
        on_complete: async ({ props, client, message, user_id }) => {
            await client.db_fns.increment_inventory(user_id, "runebox", 3);
            const embed = quest_embed("runebox", icon_manager("runebox"), 3, props.name);
            send_to_discord(message.channel, embed);
        }
    });


