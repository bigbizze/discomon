import { ClientOperator } from "../../bot-types";
import { MessageNonNull } from "../../helpers/discomon_helpers";
import { Command, CommandsReturn } from "../../commands";
import {
    filter_map_relevant_quests,
    find_matching_quest_or_update,
    is_every_quest_complete
} from "../../helpers/quest_helpers";
import { DbQuest } from "../../scaffold/database_types";
import { three_hatch_three_sacrifice } from "./composed_quests/three_hatch_three_sacrifice";
import { first_win_of_the_day } from "./composed_quests/first_win_of_day";
import { begin_your_journey } from "./composed_quests/begin_your_journey";
import { praying_zealotry } from "./composed_quests/praying_zealot";
import { credit_thief } from "./composed_quests/credit_thief";
import { PatreonTiers } from "../../patreon-dbl-server";

/** module & interface for creating and enabling daily quests which users can complete for rewards */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type DailyChallengeExpires = {
    num_time_increments: number
    time_increment: TimeIncrement
    start_time?: Date
};

export type UserGateType = "beginner" | "advanced";
export type DailyChallengeProps = {
    name: string
    command_name: Command | Command[]
    description?: string
    min_premium_level: PatreonTiers
    quest_gate?: UserGateType
    expires: DailyChallengeExpires
};

export type TimeIncrement = "minute" | "hour" | "day";

export interface DailyChallengeArgumentsUnResolved<C> {
    matching_quest: DbQuest;
    props: DailyChallengeProps;
    user_id: string;
    client: ClientOperator;
    message: MessageNonNull;
    cmd_return: C;
    premium: PatreonTiers;
}

export interface DailyChallengeArgumentsResolved<C> {
    quest_complete: boolean;
    new_value?: number;
    matching_quest: DbQuest;
    props: DailyChallengeProps;
    user_id: string;
    client: ClientOperator;
    message: MessageNonNull;
    cmd_return: C;
    premium: PatreonTiers;
}

export interface Quest<C> extends DailyChallengeProps {
    check_quest_complete: (a: DailyChallengeArgumentsUnResolved<C>) => Promise<{ quest_complete: boolean, new_value?: number }>;
    update_quest: (a: DailyChallengeArgumentsResolved<C>) => Promise<void>;
    on_complete: (a: DailyChallengeArgumentsResolved<C>) => Promise<void>;
}

/** This array holds the currently active quests
 */
export const current_quests: Quest<CommandsReturn>[] = [
    begin_your_journey,
    praying_zealotry,
    credit_thief,
    first_win_of_the_day,
    three_hatch_three_sacrifice
];

export default async function (
    command_name: Command,
    client: ClientOperator,
    message: MessageNonNull,
    cmd_return: CommandsReturn
) {
    if (!cmd_return) {
        return;
    }
    const user_id = message.member.id;
    const premium = await client.db_fns.get_premium(user_id);
    const user_quests = await client.db_fns.get_user_challenges(user_id);
    const user_gate_type = await client.db_fns.get_user_gate_type(user_id);
    const relevant_quests = filter_map_relevant_quests(current_quests, command_name, user_gate_type, premium, user_quests);
    for (let props of relevant_quests) {
        const matching_quest = await find_matching_quest_or_update(client.db_fns, user_id, command_name, user_quests, props);
        const cb_unresolved_args = { matching_quest, props, premium, user_id, client, cmd_return, message };
        const quest_complete_results = await props.check_quest_complete(cb_unresolved_args);
        const cb_resolved_args = {
            ...cb_unresolved_args,
            ...quest_complete_results
        };
        await props.update_quest(cb_resolved_args);
        if (quest_complete_results.quest_complete && is_every_quest_complete(await client.db_fns.get_user_challenges(user_id), props)) {
            await props.on_complete(cb_resolved_args);
        }
    }
}









