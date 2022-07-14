import { GuildMember, Message, MessageEmbed } from "discord.js";
import { logo } from "../../helpers/general_helpers";
import get_formatted_hsl, { send_to_discord } from "../../helpers/discomon_helpers";
import { alpha_mon_state, prng_alphamon, split_seed_and_version } from "../discomon/alpha_seed/utils";
import { DbDiscomon } from "../../scaffold/database_types";
import { breed_image } from "../discomon/image-generator/embed_images";

export default function send_breed(the_user: GuildMember, seed: string, p1: DbDiscomon, p2: DbDiscomon, message: Message) {
    breed_image(p1, p2, seed).then(img_buffer => {
        const prng_state = alpha_mon_state(seed);
        const mon = prng_alphamon(prng_state, 1);
        const filename = `${ Date.now() }.png`;
        const the_embed = new MessageEmbed()
            .setColor(get_formatted_hsl(mon.colours.body_colour_one))
            .setAuthor(`${ message.member?.displayName } bred a new egg!`, logo)
            .setFooter(`${ split_seed_and_version(p1.seed)[0] }\n+\n${ split_seed_and_version(p2.seed)[0] }\n=\n${ split_seed_and_version(seed)[0] }`)
            .attachFiles([ { 'name': filename, 'attachment': img_buffer } ])
            .setImage('attachment://' + filename);
        return send_to_discord(message.channel, { embed: the_embed });
    });

}
