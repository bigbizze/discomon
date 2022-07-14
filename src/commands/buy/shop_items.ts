import { ShopItem } from "../../scaffold/type_scaffolding";
import { MessageEmbed, MessageReaction, User } from "discord.js";
import { get_purchase_img } from "../../tools/discomon/image-generator/embed_images";
import cs from '../../tools/discomon/image-generator/color_schemes';
import advert from "../../tools/discord/advert";
import { MessageNonNull } from "../../helpers/discomon_helpers";

export interface ItemAmountResolved {
    item: string;
    amount: number;
}

export const items: ShopItem[] = [
    {
        name: 'Token',
        currency: 'credits',
        cost: 7,
        description: 'for battling',
        feature: 'token',
        keywords: [ 'token', 'tokens', 'battle token', 'battle tokens' ],
        purchase: 'type \'.battle help\' for instructions.',
        amount: 0
    },
    {
        name: 'Lootbox',
        currency: 'credits',
        cost: 30,
        description: 'RNG loot',
        feature: 'lootbox',
        keywords: [ 'lootbox', 'lootboxes' ],
        purchase: 'type \'.open help\' for instructions.',
        amount: 0
    },
    {
        name: 'Shield',
        currency: 'credits',
        cost: 200,
        description: 'No battles or prayers for 12 hrs',
        feature: 'shield',
        keywords: [ 'shield', 'sheild' ],
        purchase: 'Shield lasts 12 hours.',
        purchase2: '.battle and .pray will break shield.',
        amount: 0
    },
    {
        name: 'Tag',
        currency: 'credits',
        cost: 10,
        description: 'nickname active discomon',
        feature: 'tag',
        keywords: [ 'tag', 'tags' ],
        purchase: 'type \'.tag help\' for instructions.',
        amount: 0
    },
    {
        name: 'Chip',
        currency: 'credits',
        cost: 300,
        description: 'create global dex entry',
        feature: 'chip',
        keywords: [ 'chip', 'chips' ],
        purchase: 'type \'.chip help\' for instructions.',
        amount: 0
    },
    {
        name: 'Egg',
        currency: 'dust',
        cost: 7,
        description: 'standard egg',
        feature: 'egg',
        keywords: [ 'egg', 'eggs' ],
        purchase: 'type \'.eggs\' to see your eggs.',
        amount: 0
    },
    {
        name: 'DNA',
        currency: 'dust',
        cost: 15,
        description: 'for breeding',
        feature: 'dna',
        keywords: [ 'dna' ],
        purchase: 'type \'.dna help\' for instructions.',
        amount: 0
    },
    {
        name: 'Runebox',
        currency: 'dust',
        cost: 15,
        description: 'rng rune',
        feature: 'runebox',
        keywords: [ 'runebox', 'rune box', 'runeboxes', 'rune boxes' ],
        purchase: 'type \'.open help\' for instructions.',
        amount: 0
    }
];

export function shop_embed(images: { credits_img: Buffer, dust_img: Buffer }, avatar: string | null, message: MessageNonNull, page: number = 0) {
    const filename = `${ Date.now() }.png`;
    const _page = page;
    const embed = new MessageEmbed()
        .setFooter(`React on the arrow to see more. Type '.buy help' for instructions.`)
        .setColor(cs.embed);
    _page === 0
        ? embed.attachFiles([ { 'name': filename, 'attachment': images.credits_img } ])
        : embed.attachFiles([ { 'name': filename, 'attachment': images.dust_img } ]);
    embed.setImage('attachment://' + filename);
    if (avatar) {
        embed.setAuthor(`${ message?.member?.displayName }'s Shop`, avatar);
    }
    message.channel.send({ embed }).then(sentMessage => {
        _page === 0
            ? sentMessage.react('➡️')
            : sentMessage.react('⬅️');
        const filter = (reaction: MessageReaction, user: User) => {
            return (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && user.id === message?.member?.id;
        };
        const collector = sentMessage.createReactionCollector(filter, { time: 150000 });

        collector.on('collect', (reaction) => {
            if (page === 0 && reaction.emoji.name === '➡️') {
                sentMessage.delete();
                return shop_embed(images, avatar, message, 1);
            }
            if (page === 1 && reaction.emoji.name === '⬅️') {
                sentMessage.delete();
                return shop_embed(images, avatar, message, 0);
            }
        });
    }).catch(err => console.log(err));
}

export async function purchase_embed(shopping: ShopItem, message: MessageNonNull, avatar: string | null): Promise<MessageEmbed> {
    const image = await get_purchase_img(shopping);
    const filename = `${ Date.now() }.png`;
    const embed = new MessageEmbed()
        .setFooter(advert())
        .setColor(cs.embed)
        .attachFiles([ { 'name': filename, 'attachment': image } ])
        .setImage('attachment://' + filename);
    if (avatar) {
        embed.setAuthor(`${ message?.member?.displayName } - purchase.`, avatar);
    }
    return embed;
}
