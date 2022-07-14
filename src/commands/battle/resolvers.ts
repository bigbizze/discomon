import { calculate_level, DiscordNotNull, get_discord_sender, MessageNonNull } from "../../helpers/discomon_helpers";
import { is_null, is_type_one } from "../../helpers/general_helpers";
import { AttackerBattle, AttackerDefenderUser, BossBattle, PlayerBattle } from "./index";
import { first } from "../../helpers/array_helpers";
import send_help_embed from "../../tools/discord/send_help_embed";
import { ResolvedDbFns } from "../../tools/database";
import { clamp } from "../../tools/discomon/image-generator/utils";
import { DbDiscomon } from "../../scaffold/database_types";


////////////////////////////////////////////////////////////


export async function get_battle_player(player_type: "attacker", db_fns: ResolvedDbFns, id: string, display_name: string, db_mon: DbDiscomon): Promise<AttackerBattle>;
export async function get_battle_player(player_type: "defender", db_fns: ResolvedDbFns, id: string, display_name: string, db_mon?: DbDiscomon): Promise<PlayerBattle>;
export async function get_battle_player(player_type: "boss", db_fns: ResolvedDbFns, id?: string): Promise<BossBattle>;

export async function get_battle_player(player_type: "attacker" | "defender" | "boss", db_fns: ResolvedDbFns, id: string = "boss", display_name: string = "boss", db_mon?: DbDiscomon): Promise<AttackerBattle | PlayerBattle | BossBattle> {
    const _db_mon = db_mon ? db_mon : await db_fns.get_active_mon(id);
    const mon = {
        ..._db_mon,
        level: clamp(calculate_level(_db_mon?.experience), 1, player_type === "boss" ? 23 : 18),
        modifiers: []
    };
    const user = await db_fns.get_user(id);
    const nickname = _db_mon?.nickname == null ? "" : _db_mon.nickname;
    if (player_type === "attacker") {
        const inventory = await db_fns.get_inventory(id);
        return { ...user, nickname, display_name, inventory, mon };
    } else if (player_type === "defender") {
        return { ...user, nickname, display_name, mon };
    } else {
        const db_boss = await db_fns.get_boss();
        const boss = {
            ...db_boss,
            level: calculate_level(db_boss.experience),
            display_name: db_boss.name,
            modifiers: []
        };
        return { display_name: db_boss.name, nickname: db_boss.name, id, mon: boss };
    }
}

const resolve_attacker_defender = async (message: MessageNonNull, db_fns: ResolvedDbFns, ...args: string[]): Promise<AttackerDefenderUser | null> => {
    const db_mon = await db_fns.get_active_mon(message.member.id);
    const attacker: AttackerBattle = await get_battle_player("attacker", db_fns, message.member.id, message.member.displayName, db_mon);
    if (first(args) !== 'boss' && first(args) !== 'runeterror') {
        const defender_member = message?.mentions?.members?.first();
        if (defender_member == null || !await db_fns.user_exists(defender_member.id) || !await db_fns.has_mon(defender_member.id)) {
            return null;
        }
        const defender = await get_battle_player("defender", db_fns, defender_member.id, defender_member.displayName);
        return {
            attacker,
            defender,
            is_pve: false
        };
    }
    const defender = await get_battle_player("boss", db_fns);
    return {
        attacker,
        defender,
        is_pve: true
    };
};


export const validate_state_resolve_sides = async (discord: DiscordNotNull, message: MessageNonNull, db_fns: ResolvedDbFns, ...args: string[]): Promise<AttackerDefenderUser | void | "matchmaking"> => {
    const sender = get_discord_sender<string>(message.channel);
    const maybe_avatar_url = discord.user.avatarURL();
    const avatar_url = maybe_avatar_url == null ? "" : maybe_avatar_url;
    if (first(args) === 'help') {
        return send_help_embed(
            message,
            'Type `.battle @user` to battle someone (no more than 3 levels below you).\nType `.battle runeterror` to battle the boss at level 18.',
            'battle',
            avatar_url
        );
    }
    if (!await db_fns.user_exists(message.author.id)) {
        return sender('❌`.hatch first.`');
    }

    if (message.mentions.members.first() === message.member) {
        return;
    }

    if (!await db_fns.has_mon(message.author.id)) {
        return sender('❌`.hatch a Discomon first.`');
    }
    if (!message.mentions.members.first() && args[0] !== 'runeterror' && args[0] !== 'boss') {
        return "matchmaking";
    }
    const resolute = await resolve_attacker_defender(message, db_fns, ...args);
    if (is_null(resolute)) {
        return sender(`**❌ That person has no Discomon.**`);
    }
    if (resolute.attacker.inventory.token <= 0) {
        return sender(`**❌ You have no battle tokens. Type .buy to bring up the shop menu.**`);
    }
    if (is_type_one<BossBattle, PlayerBattle>(resolute.defender, resolute.is_pve)) {
        if (!resolute.defender.mon.alive) {
            return sender(`**The Disco is currently undefended.**`);
        } else if (resolute.attacker.mon.level < 18) {
            return sender(`**❌ Must be level 18 to face the runeterror.**`);
        }
    } else if (await db_fns.has_shield(resolute.defender.id)) {
        return sender(`**❌ That player has an active shield.**`);
    } else if (resolute.attacker.mon.level - resolute.defender.mon.level > 3) {
        return sender(`**❌ You can only attack 3 levels below.**`);
    }
    return resolute;
};
