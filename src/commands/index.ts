import announce from "./announce";
import bal from "./bal";
import battle, { BattleReturn } from "./battle";
import runeterror from "./runeterror";
import buy from "./buy";
import candy from "./candy";
import chip from "./chip";
import commands from "./commands";
import equip from "./equip";
import dex from "./dex";
import hatch from "./hatch";
import help from "./help";
import leaderboard from "./leaderboard";
import _open from "./open";
import mon from "./mon";
import news from "./news";
import party from "./party";
import pray from "./pray";
import profile from "./profile";
import reboot from "./reboot";
import runes from "./runes";
import sacrifice from "./sacrifice";
import sell from "./sell";
import switch_ from "./switch";
import tag from "./tag";
import tutorial from "./tutorial";
import vote from "./vote";
import xp from "./xp";
import eggs from "./eggs";
import breed from "./breed";
import { Message } from "discord.js";
import { ClientOperator } from "../bot-types";
import { deprecate_command_notice, MessageNonNull } from "../helpers/discomon_helpers";
import patron from "./patron";
import quests from "./quests";
import box from "./box";
import withdraw from "./withdraw";
import deposit from "./deposit";

export type DefaultCommandsReturn = BattleReturn | true | Message | number;
export type CommandsReturn = BattleReturn & DefaultCommandsReturn;
export type CommandType = (client: ClientOperator, message: MessageNonNull, ...args: string[]) => Promise<CommandsReturn>;
export type CommandTypeTyped<C extends CommandsReturn> = (client: ClientOperator, message: MessageNonNull, ...args: string[]) => Promise<C>;
export type CommandsMap = { [key: string]: CommandType };
export type Command =
    "announce" |
    "bal" |
    "battle" |
    "box" |
    "breed" |
    "buy" |
    "candy" |
    "chip" |
    "commands" |
    "deposit" |
    "dex" |
    "eggs" |
    "equip" |
    "hatch" |
    "help" |
    "leaderboard" |
    "match" |
    "mon" |
    "news" |
    "open" |
    "party" |
    "patron" |
    "pray" |
    "profile" |
    "quests" |
    "reboot" |
    "release" |
    "runes" |
    "runeterror" |
    "sacrifice" |
    "sell" |
    "switch" |
    "tag" |
    "tutorial" |
    "vote" |
    "withdraw" |
    "xp";

export default ({
    announce,
    bal,
    battle,
    box,
    breed,
    buy,
    candy,
    chip,
    commands,
    deposit,
    dex,
    eggs,
    equip,
    hatch,
    help,
    leaderboard,
    mon,
    news,
    open: _open,
    party,
    patreon: patron,
    patron,
    pray,
    profile,
    quests,
    reboot,
    release: deprecate_command_notice(
        sacrifice,
        ".release -> .sacrifice",
        "\`.release\` has been changed to \`.sacrifice\` and will be removed in the near future & will not work for daily challenges."
    ),
    runes,
    runeterror,
    sacrifice,
    sell,
    switch: switch_,
    tag,
    tutorial,
    vote,
    withdraw,
    xp
}) as CommandsMap;
