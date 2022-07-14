import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";
import { build_embed, EmbedProps } from "../helpers/embed_helpers";

export default async function ({ discord }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {

    const commands_props: EmbedProps = {
        title: `Discomon Commands`,
        fields: [
            {
                title: "**Info**",
                content: "`<optional argument>`\n`[required argument]`\n" +
                    "You can call help on any command for usage instuctions (`.hatch help`).\n" +
                    "**Consumables:**\n▫`credits` Used to purchase basic items, obtained by praying, voting, quests and battling.\n" +
                    "▫️`dust` Used to purchase premium items, obtained by praying, from lootboxes and by battling the Runeterror.\n" +
                    "▫️`candy` Feed to your Discomon with `.candy <amount or all>` to give it 10xp per candy.\n" +
                    "▫️`tokens` Battling consumes one token.\n" +
                    "▫️`lootbox` Get dust/candy/tokens/credits and a rare chance for a rune.\n" +
                    "▫️`runebox` Guaranteed rune with better quality odds than a lootbox.\n" +
                    "▫️`tag` Nickname your Discomon.\n" +
                    "▫️`chip` Add your Discomon to the dex at level 18 (and allows you to use it for breeding).\n" +
                    "▫️`dna` Consumed when you breed two level 18 Discomon.\n\n" +
                    "**Active Discomon:**\nYour active Discomon is the one that most commands work with and the one that will be battled by other players. You can change your active Discomon with the `.switch` command (see below).\n" +
                    "**Please see below for commands**"
            },
            {
                title: "**Getting Started**",
                content: "▫️️`.hatch` This will hatch your first Discomon and is the starting point for the game. Your Discomon gains experience (and will evolve 17 times) by battling and from candies.\n" +
                    "▫️️`.pray` Get rewards from the gods every 30 minutes.\n" +
                    "▫️️`.vote` Vote on topgg for 200 credits every 12 hours.\n" +
                    "▫️️`.battle` Enter matchmaking.\n" +
                    "▫️️`.quests` View your active daily quests."
            },
            {
                title: "**Inventories**",
                content: "▫️️`.bal` View your consumable and currency balances.\n" +
                    "▫️️`.eggs` View your egg inventory and slot numbers.\n" +
                    "▫️️`.runes` View your rune inventory and slot numbers. Runes are found in lootboxes and can be equipped on Discomon or sold for dust."
            },
            {
                title: "**Discomon**",
                content: "▫️️`.mon <@user> <slot number>`\nView your Discomon's profile / view someone elses profile. If no slot number is provided the active Discomon will be displayed.\n" +
                    "**DNA:** `E409ED-E409EC-E409EB-E409EA-3C455F-E409E8-E409E7-E409E6-E409E5-E409E4`\nThe string at the bottom of the embed is the Discomon's DNA (see breeding below).\n" +
                    "▫️️`.party` View your party and slot numbers.\n" +
                    "▫️️`.box <number>` View your currently active storage box. Provide a number to switch to a different box (If you have more than one).\n" +
                    "▫️️`.deposit [party slot]` Deposit a mon from your party to your active storage box.\n" +
                    "▫️️`.withdraw [box slot]` Withdraw a Discomon from your active box to your party.\n" +
                    "▫️️`.hatch <egg slot>` Hatch an egg - if no number is provided your egg in slot 1 will be hatched.\n" +
                    "▫️️`.switch [party slot]` Switch your active Discomon to another Discomon in your party.\n" +
                    "▫️️`.sacrifice [party slot]` Release a Discomon in your party and receive dust based on its level."
            },
            {
                title: "**Battling**",
                content: "▫️️`.battle` Enter the matchmaking pool. If no match +- 1 level can be found in 20 seconds a Discomon from the dex will be generated for you.\n" +
                    "▫️️`.battle @user` Battle someone in your server.\n" +
                    "▫️️`.battle runeterror`\nBattle the runeterror if your active Discomon is level 18. The Runeterror spawns every 3 hours, when the Runeterror spawns, dust is provided to everyone who damaged the previous one (if it was killed) based on how much damage they dealt.\n" +
                    "**XP and credits are earned from battling based on whether you won or lost and the level differential between you and your opponent.**"
            },
            {
                title: "**Runes, loot and shopping**",
                content: "▫️️`.equip [rune slot] [Discomon slot (1,2 or 3)]`\nEquip a rune from your `.runes` inventory to one of your active Discomon's 3 slots (`.equip 3 2`).\nDiscomon have 3 rune slots each and any runes already in the slot you choose will be overwritten. Runes cannot be removed.\n" +
                    "▫️️`.sell [rune slot]` Sell a rune from your `.runes`.\n" +
                    "▫️️`.open [amount | all] [lootbox | runebox]` Open lootboxes or runeboxes (`.open 5 lootbox`).\n" +
                    "▫️️`.buy` View the shop menu, react to change pages.\n" +
                    "▫️️`.buy <amount> <item>` Buys items from the shop. If no amount is provided then one will be purchased."
            },
            {
                title: "**Lategame**",
                content: "▫️️`.chip [official name]` Add your level 18 active Discomon to the dex.\n" +
                    "▫️️`.breed [party slot] [party slot]`\nBreed two of your Discomon and receive an egg. Both parents must be level 18 and chipped. DNA affecting stats and colors is derived randomly from each parent each time you breed them.\n" +
                    "▫️️`.runeterror` Check Runeterror status."
            },
            {
                title: "**Misc**",
                content: "▫️️`.tag [nickname]` Nickname your active Discomon (requires tags).\n" +
                    "▫️️`.xp` Quickly view your Discomon's progress to its next evolution.\n" +
                    "▫️️`.profile <@user>` See your carrer stats or someone else's.\n" +
                    "▫️️`.dex <page number>` View the dex.\n" +
                    "▫️️`.leaderboard <all|runeterror>` View the leaderboard for the last 3 days, for all time, or for Runeterror damage."
            }
        ]
    };

    const embed = build_embed(commands_props, true);
    return send_to_discord(message.channel, { embed });
}

