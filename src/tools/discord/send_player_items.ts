import { MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";
import { GuildMember, MessageEmbed } from "discord.js";
import advert from "./advert";
import { db_inventory_image } from "../discomon/item-image-generator";
import { DbItem } from "../../scaffold/database_types";
import cs from '../discomon/image-generator/color_schemes';

export default function send_player_items(
    message: MessageNonNull,
    items: DbItem[],
    user: GuildMember
) {
    db_inventory_image(items).then(img_buffer => {
        const filename = `${ Date.now() }.png`;
        const embed = new MessageEmbed();
        const avatar = message.author.avatarURL();
        if (avatar != null) {
            embed.setAuthor(user.displayName + '\'s runes.\nBe careful when equipping. Runes can\'t be removed.\nEquipping to an occupied slot on your Discomon will overwrite it.', avatar);
        }
        embed.addField('☄️ DUST VALUES [.sell]', '```rare: 5\nepic: 20\nmythic: 100\nlegendary: 200```')
            .setColor(cs.embed)
            .attachFiles([ { 'name': filename, 'attachment': img_buffer } ])
            .setImage('attachment://' + filename)
            .setFooter(`Type .equip help for rune instructions.\n${ advert() }`);
        return send_to_discord(message.channel, { embed });
    });
}
