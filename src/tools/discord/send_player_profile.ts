import { GuildMember, MessageEmbed } from "discord.js";
import { CombinedStats } from "../database/get_profile_stats";
import advert from "./advert";
import cs from "../discomon/image-generator/color_schemes";
import { key_value_image } from "../discomon/image-generator/embed_images";
import { MessageNonNull, send_to_discord } from "../../helpers/discomon_helpers";

export default async function send_player_profile(message: MessageNonNull, stats: CombinedStats, player: GuildMember | null | undefined, avatar: string | null | undefined, profile_type: string) {
    if (!player) {
        return console.log('No player for profile..');
    }
    const header = profile_type === "stats" ? "Stats" : "Balances";
    const values = profile_type === "stats" ? stats.player : stats.bal;
    const filename = `${ Date.now() }.png`;
    const image = await key_value_image(values, player?.displayName);
    const embed = new MessageEmbed()
        .setColor(cs.embed);
    if (avatar != null) {
        embed.setAuthor(`Discomon Player ${ header }`, avatar);
    }
    embed.attachFiles([ { 'name': filename, 'attachment': image } ])
        .setImage(`attachment://${ filename }`)
        .setFooter(player?.displayName + '\n' + advert());
    return send_to_discord(message.channel, { embed });
}

