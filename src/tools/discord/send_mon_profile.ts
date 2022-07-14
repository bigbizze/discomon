import { GuildMember, Message, MessageEmbed } from "discord.js";
import get_formatted_hsl, { send_to_discord } from "../../helpers/discomon_helpers";
import advert from "./advert";
import { DbDiscomon, DbItem } from "../../scaffold/database_types";
import { get_mon_profile_img } from "../discomon/image-generator/get_mon_profile_image";
import { logo } from "../../helpers/general_helpers";
import get_alphamon from "../discomon/alpha_seed";
import { split_seed_and_version } from "../discomon/alpha_seed/utils";

export default function send_mon_profile(db_mon: DbDiscomon, user: GuildMember, items: DbItem[], message: Message) {
    const mon = get_alphamon(db_mon, "user");
    const filename = `${ Date.now() }.png`;
    get_mon_profile_img(mon, items).then(image_buffer => {
        const embed = new MessageEmbed()
            .attachFiles([ { 'name': filename, 'attachment': image_buffer } ])
            .setColor(get_formatted_hsl(mon.colours.body_colour_one))
            .setAuthor(`${ user.displayName }\'s\nDiscomon:`, logo)
            .setFooter(`Age: ${ Math.floor(((Date.now() - mon.date_hatched) / 3600000)) } hours. | #${ mon.id }\n${ advert() }${ split_seed_and_version(db_mon.seed)[0] }`)
            .setImage(`attachment://${ filename }`);
        send_to_discord(message.channel, { embed });
    }).catch(err => console.log(err));
}
