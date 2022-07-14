import { Indexer } from "./utility_types";
import { MessageAttachment, MessageEmbed } from "discord.js";
import { logo } from "./general_helpers";
import advert from "../tools/discord/advert";
import cs from "../tools/discomon/image-generator/color_schemes";

export interface EmbedProps extends Indexer {
    logo?: string;
    title: string;
    fields: EmbedField[];
    footer?: string;
    attachment?: MessageAttachment;
    image?: string;
}

export type EmbedField = {
    title: string
    content: string
};

export function build_embed(props: EmbedProps, ads: boolean): MessageEmbed {
    const embed = new MessageEmbed()
        .setAuthor(props.title, props.logo ? props.logo : logo)
        .setColor(cs.embed)
        .setFooter(`${ ads ? advert() + '\n' : '' }${ props.footer ? props.footer : '' }`);
    for (const field of props.fields) {
        embed.addField(field.title, field.content);
    }
    if (props.attachment) {
        embed.attachFiles([ props.attachment ]);
    }
    if (props.image) {
        embed.setImage(props.image);
    }
    return embed;
}
