import { Message, MessageEmbed } from "discord.js";
import { HealthBarMap } from "../resolvers";
import { BattleTrackers } from "../../../bot-types";
import { Indexer } from "../../../helpers/utility_types";
import { EndStateNeeded } from "./index";

type EditEmbedSide = {
    name: string
    health_bar: HealthBarMap
    mon_level: number
};

export interface EditEmbed {
    attacker: EditEmbedSide;
    defender: EditEmbedSide;
    filename: string;
    buffer: Buffer;
}

export interface PrepareBattleEdits {
    props: EndStateNeeded & Indexer;
    img_buffer: Buffer;
    filename: string;
    battles: BattleTrackers;
    message: Message;
    // on_error_or_resolve_fn: (to_send?: string, to_log?: string) => void
}

export interface ContinueBattle {
    battle_messages: string[];
    edit_embed_fn: (i: number, sent_text: string) => MessageEmbed;
    // on_error_or_resolve_fn: (to_send?: string, to_log?: string) => void
    message: Message;
}
