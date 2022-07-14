import { MessageNonNull } from "../../helpers/discomon_helpers";
import { AttackerDefenderUser } from "./index";
import { BattleTrackers } from "../../bot-types";

export const on_battle_error = (error: any, message: MessageNonNull, {
    servers,
    channels,
    players
}: BattleTrackers, resolved_values: AttackerDefenderUser) => {
    const guild_id = message.guild.id.toString();
    const channel_id = message.channel.id.toString();
    servers[guild_id] = servers[guild_id] - 1;
    channels[channel_id] = channels[channel_id] - 1;
    players[resolved_values.attacker.id] = players[resolved_values.attacker.id] - 1;
    if (!resolved_values.is_pve) {
        players[resolved_values.defender.id] = players[resolved_values.defender.id] - 1;
    }
    console.log(error);
    console.log({ channels, players, servers });
};

