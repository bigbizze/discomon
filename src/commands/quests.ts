import { CommandsReturn, DefaultCommandsReturn } from "./index";
import { MessageEmbed } from "discord.js";
import { ClientOperator } from "../bot-types";
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import { current_quests, Quest } from "../tools/quests";
import icon_manager from "../icon-manager";
import { ResolvedDbFns } from "../tools/database";
import cs from "../tools/discomon/image-generator/color_schemes";
import { logo } from "../helpers/general_helpers";
import { is_every_quest_complete, is_user_wrong_quest_gate_type } from "../helpers/quest_helpers";
import { PatreonTiers } from "../patreon-dbl-server";

const get_challenge_text = async (user_id: string, db_fns: ResolvedDbFns) => {
    const user_challenges = await db_fns.get_user_challenges(user_id);
    const user_gate_type = await db_fns.get_user_gate_type(user_id);
    let completed_challenges: Quest<CommandsReturn>[] = [];
    let available_challenges: Quest<CommandsReturn>[] = [];
    for (let quest of current_quests) {
        if (is_user_wrong_quest_gate_type(quest, user_gate_type)) {
            continue;
        }
        if (is_every_quest_complete(user_challenges, quest)) {
            completed_challenges.push(quest); /** User has completed this quest.*/
        } else {
            available_challenges.push(quest);
        }
    }
    return {
        completed_challenges,
        available_challenges
    };
};

interface QuestText {
    name: string;
    min_tier: PatreonTiers;
    body?: string;
}

const to_text = (quests: Quest<CommandsReturn>[], is_available: boolean): QuestText[] => (
    quests.map(q => ({
        name: `\t${ icon_manager(is_available ? "available_quests" : "completed_quests") } ${ q.name }`,
        min_tier: q.min_premium_level,
        ...is_available ? {
            body: `\t${ q.description?.trim() }`
        } : {}
    }))
);

export default async function ({
                                   discord,
                                   db_fns
                               }: ClientOperator, message: MessageNonNull): Promise<DefaultCommandsReturn> {
    const embed = new MessageEmbed()
        .setColor(cs.embed)
        .setAuthor(`${ icon_manager("quest_title") } Daily Quests ${ icon_manager("quest_title") }`, logo);
    const { available_challenges, completed_challenges } = await get_challenge_text(message.member.id, db_fns);
    const available_challenges_text = to_text(available_challenges, true);
    const completed_challenges_text = to_text(completed_challenges, false);
    if (available_challenges_text.length > 0) {
        embed.addField(`Available Quests`, `\n${ available_challenges_text.map(c => `${ c.name } -- \`${ c.min_tier } and up\`\n${ c.body }`).join("\n\n") }\n`);
    }
    if (completed_challenges_text.length > 0) {
        embed.addField(`Completed Quests`, `\n${ completed_challenges_text.map(c => `${ c.name } -- \`${ c.min_tier } and up\`\n`).join("\n\n") }\n`);
    }
    send_to_discord(message.channel, embed);
}
