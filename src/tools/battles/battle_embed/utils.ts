import { MessageEmbed } from "discord.js";
import { EditEmbed, PrepareBattleEdits } from "./types";
import cs from '../../discomon/image-generator/color_schemes';
import { Indexer } from "../../../helpers/utility_types";
import { EndStateNeeded } from "./index";

export function named_object_entries(msgs: EndStateNeeded & Indexer): string[] {
    return Object.entries(msgs.state.battle_messages).map(v => v[1].map(y => `${ y }\n`).join(""));
}

export const prepare_battle_args_map_to_edit_embed = (args: PrepareBattleEdits): EditEmbed => ({
    attacker: {
        name: args.props.attacker.display_name,
        health_bar: args.props.state.state_by_side.attacker.health_bar,
        mon_level: args.props.attacker.mon.level
    },
    defender: {
        name: args.props.defender.display_name,
        health_bar: args.props.state.state_by_side.defender.health_bar,
        mon_level: args.props.defender.mon.level
    },
    filename: args.filename,
    buffer: args.img_buffer
});

export function get_edit_embed_fn(args: EditEmbed) {
    return (i: number, sent_text: string) => (
        new MessageEmbed()
            .setColor(cs.embed)
            .setTitle(`${ args.attacker.name } vs ${ args.defender.name }`)
            .addField('Battle Feed:', sent_text)
            .addField(args.attacker.name + '\nLevel: ' + args.attacker.mon_level, args.attacker.health_bar[i] == null ? '▒▒▒▒▒▒▒▒▒▒▒▒▒▒' : args.attacker.health_bar[i], true)
            .addField(args.defender.name + '\nLevel: ' + args.defender.mon_level, args.defender.health_bar[i] == null ? '▒▒▒▒▒▒▒▒▒▒▒▒▒▒' : args.defender.health_bar[i], true)
            .attachFiles([ { name: args.filename, attachment: args.buffer } ])
            .setImage(`attachment://${ args.filename }`)
    );
}


const join_with_backticks = (arr: string[]): string => (
    '```\n' + arr.join("") + '```\n'
);

export const resolve_turn_text = (msgs: string[], i: number): string => {
    return join_with_backticks(
        msgs.filter((x, j) => i < 3 ? j <= i : j > i - 3 && j <= i).map(x => `${ x }\n`)
    );
};
