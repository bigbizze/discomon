import { GuildMember, MessageEmbed } from "discord.js";
import { DbDiscomon, DbItem } from "../../scaffold/database_types";
import advert from './advert';
import { item_from_db } from "../discomon/item-image-generator";
import { PrngBlockItemActionType } from "../discomon/block_runes";
import { get_party_img } from "../discomon/image-generator/get-party-image";
import cs from '../discomon/image-generator/color_schemes';
import { logo } from "../../helpers/general_helpers";
import { MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";

export default function send_party_profile(the_user: GuildMember, db_party: DbDiscomon[], message: MessageNonNull, items: DbItem[][], max_mon: number, active_slot: number) {
    const party_items = party_db_items_to_items(items);
    const length = db_party.filter(x => x !== null).length;
    get_party_img(db_party, party_items, max_mon, active_slot).then(img_buffer => {

        const filename = `${ Date.now() }.png`;
        const the_embed = new MessageEmbed()
            .setColor(cs.embed)
            .setAuthor(the_user.displayName + '\'s Party:', logo)
            .setTitle(length + '/' + max_mon)
            .setFooter(the_user.displayName + '\n' + advert())
            .attachFiles([ { 'name': filename, 'attachment': img_buffer } ])
            .setImage('attachment://' + filename);
        return send_to_discord(message.channel, { embed: the_embed });
    });
}

function party_db_items_to_items(db_items: DbItem[][]): Array<PrngBlockItemActionType[] | null> {
    return db_items.map(item => item ? item.map(y => item_from_db(y)) : []);
}
