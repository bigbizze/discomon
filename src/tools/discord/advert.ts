import { chance, random } from "../../helpers/rng_helpers";

const ads = [
    'Support discomon\'s development at patreon.com/discomon',
    'Get more boxes at patreon.com/discomon',
    'Get more from praying at patreon.com/discomon',
    'Get more from quests at patreon.com/discomon',
    'Support discomon\'s development at patreon.com/discomon',
    'Get more boxes at patreon.com/discomon',
    'Get more from praying at patreon.com/discomon',
    'Get more from quests at patreon.com/discomon',
    "You can now change your Discomon prefix with .discomon-prefix <new prefix>",
    'Discomon needs community managers for discord / reddit.',
    'Remember to .vote every 12 hours for credits.',
    'Remember to .vote every 12 hours for credits.',
    'Remember to .vote every 12 hours for credits.',
    'Remember to .vote every 12 hours for credits.',
    'Remember to .vote every 12 hours for credits.',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Major economy changes, type .news',
    'Type help after a command for instructions (eg .equip help).',
    'Type .battle runeterror to fight the boss at level 18.',
    'If the runeterror is defeated, rewards are dropped to players who damaged it\nwhen the next one spawns.'
];

export default function advert() {
    return chance(50) ? `${ ads[random(0, ads.length - 1)] }\n` : "";
}
