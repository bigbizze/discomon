import { Message, MessageEmbed } from "discord.js";
import { MessageNonNull } from "../../../helpers/discomon_helpers";
import {
    get_edit_embed_fn,
    named_object_entries,
    prepare_battle_args_map_to_edit_embed,
    resolve_turn_text
} from "./utils";
import { ContinueBattle, PrepareBattleEdits } from "./types";
import { ClientOperator } from "../../../bot-types";
import { BattleMessageMap, HealthBarMap } from "../resolvers";
import { Indexer } from "../../../helpers/utility_types";
import { sleep } from "../../../helpers/general_helpers";

export type EndStateNeeded = {
    message?: Message
    attacker: {
        mon: {
            level: number
        }
        display_name: string
    }
    defender: {
        mon: {
            level: number
        }
        display_name: string
    }
    state: {
        battle_messages: BattleMessageMap
        state_by_side: {
            attacker: {
                health_bar: HealthBarMap
            }
            defender: {
                health_bar: HealthBarMap
            }
        }
    }
};

export default async function battle_embed(
    { battles }: ClientOperator,
    props: EndStateNeeded & Indexer,
    img_buffer: Buffer,
    message: MessageNonNull
) {
    const filename = `${ Date.now() }.png`;

    const the_embed = new MessageEmbed()
        .setColor('#000000')
        .setTitle(props.attacker.display_name + ' vs ' + props.defender.display_name)
        .addField('Prepare to start.', '...')
        .attachFiles([ { 'name': filename, 'attachment': img_buffer } ])
        .setImage('attachment://' + filename);
    try {
        const battle_msg = await message.channel.send({ embed: the_embed });
        await continue_battle({
            props,
            img_buffer,
            filename,
            battles,
            message: battle_msg
        });
    } catch (err) {
        throw err;
    }
}

async function continue_battle(args: PrepareBattleEdits) {
    const edit_embed_fn_args = prepare_battle_args_map_to_edit_embed(args);
    return await execute_continue_battle({
        message: args.message,
        edit_embed_fn: get_edit_embed_fn(edit_embed_fn_args),
        battle_messages: named_object_entries(args.props)
    }, Object.keys(args.props.state.battle_messages).length);
}

async function execute_continue_battle(args: ContinueBattle, cutoff: number, i: number = 0): Promise<void> {
    const { message, battle_messages, edit_embed_fn } = args;
    await sleep(2000);
    if (i === cutoff) {
        return;
    }
    const turn_text = resolve_turn_text(battle_messages, i);
    const embed = edit_embed_fn(i, turn_text);
    try {
        await message.edit({ embed });
        return await execute_continue_battle(
            args,
            cutoff,
            i + 1
        );
    } catch (e) {
        throw e;
    }
}


