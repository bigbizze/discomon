import { GuildMember, MessageEmbed } from "discord.js";
import { DbEgg } from "../../scaffold/database_types";
import advert from './advert';
import cs from '../discomon/image-generator/color_schemes';
import { logo } from "../../helpers/general_helpers";
import { get_egg_img } from "../discomon/image-generator/get-egg-inventory-image";
import { MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";

export default function send_player_eggs(the_user: GuildMember, eggs: DbEgg[], message: MessageNonNull, max_eggs: number) {
    get_egg_img(eggs).then(img_buffer => {

        const filename = `${ Date.now() }.png`;
        const the_embed = new MessageEmbed()
            .setColor(cs.embed)
            .setTitle(eggs.length + '/' + max_eggs)
            .setAuthor(the_user.displayName + '\'s eggs', logo)
            .setFooter(the_user.displayName + '\n' + advert())
            .attachFiles([ { 'name': filename, 'attachment': img_buffer } ])
            .setImage('attachment://' + filename);
        return send_to_discord(message.channel, { embed: the_embed });
    });

}

