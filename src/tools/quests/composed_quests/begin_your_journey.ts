import { add_challenge } from "../../../helpers/quest_helpers";
import { CommandsReturn } from "../../../commands";
import { is_type_one, logo } from "../../../helpers/general_helpers";
import { BattleReturn } from "../../../commands/battle";
import { BattleEndState } from "../../battles";
import { send_to_discord } from "../../../helpers/discomon_helpers";
import cs from "../../discomon/image-generator/color_schemes";
import advert from "../../discord/advert";
import icon_manager from "../../../icon-manager";
import { MessageEmbed } from "discord.js";

export const begin_your_journey =
    add_challenge<CommandsReturn>({
        name: "Begin Your Journey",
        description: `
     Welcome to Discomon. Begin your journey by dealing 2000 damage
     in battle with a Discomon using \`.battle\`, & pray twice with \`.pray\`.
     You will receive a special gift from the gods.`,
        command_name: [
            "pray",
            "battle"
        ],
        min_premium_level: "none",
        expires: {
            num_time_increments: 1,
            time_increment: "day"
        },
        quest_gate: "beginner",
        check_quest_complete: async ({ matching_quest, props, user_id, cmd_return }) => {
            if (!cmd_return) {
                return {
                    quest_complete: false
                };
            }
            if (is_type_one<CommandsReturn, BattleReturn>(cmd_return, props.command_name === "pray")) {
                const num_prays = matching_quest.value + 1;
                return {
                    quest_complete: num_prays >= 2,
                    new_value: num_prays
                };
            } else {
                const cmd_return_battle = cmd_return as BattleEndState;
                const is_attacker = cmd_return_battle.attacker.id === user_id;
                const start_hp = cmd_return_battle[is_attacker ? "defender" : "attacker"].mon.stats.hp;
                const end_hp = cmd_return_battle.state.state_by_side[is_attacker ? "defender" : "attacker"].hp;
                const dmg_dealt = start_hp - (end_hp > 0 ? end_hp : 0);
                const new_dmg_dealt = matching_quest.value + dmg_dealt;
                return {
                    quest_complete: new_dmg_dealt >= 2000,
                    new_value: new_dmg_dealt
                };
            }
        },
        update_quest: async ({ new_value, quest_complete, client, user_id, props, matching_quest }) => {
            if (!new_value) {
                return;
            }
            await client.db_fns.add_or_update_challenge(user_id, props, new_value, matching_quest.id);
            if (quest_complete) {
                await client.db_fns.add_or_update_challenge(user_id, props, undefined, matching_quest.id, true);
            }
        },
        on_complete: async ({ props, client, message, user_id }) => {
            await client.db_fns.increment_inventory(user_id, "runebox", 3);
            await client.db_fns.increment_inventory(user_id, "lootbox", 5);
            await client.db_fns.increment_inventory(user_id, "dust", 7);
            send_to_discord(
                message.channel,
                new MessageEmbed()
                    .setColor(cs.embed)
                    .setAuthor(`${ props.name } complete!`, logo)
                    .setFooter(advert())
                    .addField(`${ icon_manager("lootbox") } **Runeboxes**`, `**Amount:** 2\n`)
                    .addField(`${ icon_manager("lootbox") } **Lootboxes**`, `**Amount:** 5\n`)
                    .addField(`${ icon_manager("dust") } **Dust**`, `**Amount:** 7\n`)
                    .setFooter(`(Hint: Try using \`.buy\` to see what you might be able to buy for 7 dust!`)
            );
        }
    });
