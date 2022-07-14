import { GuildMember, MessageEmbed } from "discord.js";
import { DbDiscomon, DbItem } from "../../scaffold/database_types";
import advert from './advert';
import { item_from_db } from "../discomon/item-image-generator";
import { PrngBlockItemActionType } from "../discomon/block_runes";
import { get_party_img } from "../discomon/image-generator/get-party-image";
import cs from '../discomon/image-generator/color_schemes';
import { logo } from "../../helpers/general_helpers";
import { MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";

export default function send_player_boxes(
    the_user: GuildMember,
    box_party: DbDiscomon[],
    message: MessageNonNull,
    items: DbItem[][],
    max_mon: number,
    boxes_allowed: number,
    box_number: number
) {
    const party_items = party_db_items_to_items(items);
    const length = box_party.filter(x => x !== null).length;
    get_party_img(box_party, party_items, max_mon).then(img_buffer => {

        const filename = `${ Date.now() }.png`;
        const the_embed = new MessageEmbed()
            .setColor(cs.embed)
            .setAuthor(`${ the_user.displayName }\'s Box ${ box_number }:`, logo)
            .setTitle(`${ length }/${ max_mon }`)
            .setFooter(`Active Box: ${ box_number }  |  Total Boxes: ${ boxes_allowed }\n\n${ advert() }`)
            .attachFiles([ { 'name': filename, 'attachment': img_buffer } ])
            .setImage('attachment://' + filename);
        return send_to_discord(message.channel, { embed: the_embed });
    });
}

function party_db_items_to_items(db_items: DbItem[][]): Array<PrngBlockItemActionType[] | null> {
    return db_items.map(item => item ? item.map(y => item_from_db(y)) : []);
}
