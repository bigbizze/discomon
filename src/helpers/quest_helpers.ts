import cs from "../tools/discomon/image-generator/color_schemes";
import { logo } from "./general_helpers";
import advert from "../tools/discord/advert";
import { MessageEmbed } from "discord.js";
import { DbQuest } from "../scaffold/database_types";
import { Command, CommandsReturn } from "../commands";
import { Quest, UserGateType } from "../tools/quests";
import { first } from "./array_helpers";
import { ResolvedDbFns } from "../tools/database";
import { PatreonTiers } from "../patreon-dbl-server";
import { is_user_high_enough_premium_tier } from "./patreon_helpers";


export function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export const is_every_quest_complete = (user_quests: DbQuest[], props: Quest<CommandsReturn>): boolean => {
    if (user_quests.length === 0) {
        return false;
    }
    const filtered = user_quests.filter(x => x.quest_name === props.name);
    if (filtered.length === 0) {
        return false;
    }
    return filtered.every(x => x.complete === 1);
};

export const is_user_wrong_quest_gate_type = (quest: Quest<CommandsReturn>, user_gate_type: UserGateType): boolean => (
    quest.quest_gate != null && user_gate_type !== quest.quest_gate
);

export const find_matching_quest_or_update = async (
    db_fns: ResolvedDbFns,
    user_id: string,
    command_name: Command,
    user_quests: DbQuest[],
    props: Quest<CommandsReturn>
): Promise<DbQuest> => {
    const matching_challenge = first(user_quests.filter(x => x.command_name === props.command_name && x.quest_name === props.name));
    if (matching_challenge == null) {
        await db_fns.add_or_update_challenge(user_id, props);
        const last_id = await db_fns.last_id();
        return {
            id: last_id,
            owner: user_id,
            quest_name: props.name,
            expires_on: new Date(),
            command_name,
            value: 0,
            complete: 0
        };
    }
    return matching_challenge;
};

export function quest_embed(reward: string, icon: string, amount: number, name: string): MessageEmbed {
    return new MessageEmbed()
        .setColor(cs.embed)
        .setAuthor(`${ name } complete!`, logo)
        .setFooter(advert())
        .addField(`${ icon } **${ capitalize(reward) }**`, `**Amount: **${ amount }`);
}


export function add_challenge<C extends CommandsReturn>(challenge: Quest<C>): Quest<C> {
    return challenge;
}


export const filter_map_relevant_quests = (quests: Quest<CommandsReturn>[], command_name: Command, user_gate_type: UserGateType, premium: PatreonTiers, user_quests: DbQuest[]): Quest<CommandsReturn>[] => {
    const filtered =
        quests.filter(props =>
            (!Array.isArray(props.command_name) ? props.command_name === command_name : props.command_name.includes(command_name))
            && !is_user_wrong_quest_gate_type(props, user_gate_type)
            && is_user_high_enough_premium_tier(premium, props.min_premium_level)
            && !is_every_quest_complete(user_quests.filter(u_q => u_q.quest_name === props.name), props)
        );
    return filtered.map(x => ({
        ...x,
        command_name
    }));
};
