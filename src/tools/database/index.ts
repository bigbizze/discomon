// // sick functions n shit;
import battle_on_cooldown from "./battle_on_cooldown";
import increment_player from "./increment_player";
import increment_mon from "./increment_mon";
import get_user from "./get_user";
import is_alive from "./is_alive";
import set_battle_cooldown from "./set_battle_cooldown";
import get_item from "./get_item";
import create_item from "./create_item";
import next_pray from "./next_pray";
import equip_item from "./equip_item";
import open_lootbox from "./open_lootbox";
import sell_item from "./sell_item";
import set_inventory_value from "./set_inventory_value";
import release from "./release";
import { set_active_mon } from "./set_active_mon";
import pray_cooldown from "./pray_cooldown";
import get_all_mon from "./get_all_mon";
import sell_all_rarity from "./sell_all_rarity";
import set_player_value from "./set_player_value";
import { get_active_mon } from "./get_active_mon";
import has_shield from "./has_shield";
import create_user from "./create_user";
import increment_inventory from "./increment_inventory";
import has_mon from "./has_mon";
import { get_inventory } from "./get_inventory";
import set_mon_value from "./set_mon_value";
import get_mon from "./get_mon";
import new_mon from "./new_mon";
import set_battle_results from "./set_battle_results";
import get_profile_stats from "./get_profile_stats";
import user_exists from "./user_exists";
import get_boss from "./get_boss";
import increment_boss from "./increment_boss";
import get_leaders from "./get_leaders";
import new_boss from "./new_boss";
import new_dex from "./new_dex";
import get_all_items from "./get_all_items";
import get_mon_active_items from "./get_mon_active_items";
import get_all_alive_mon from "./get_all_alive_mon";
import open_many_lootboxes from "./open_many_lootbox";
import mon_in_dex from "./mon_in_dex";
import get_dex_entries from "./get_dex_entries";
import is_boss_alive from "./is_boss_alive";
import set_boss_battle_results from "./set_boss_battle_results";
import get_eggs from "./get_eggs";
import new_egg from "./new_egg";
import get_premium from "./get_premium";
import create_battle_turn_stats from "./create_battle_turn_stats";
import create_battle_stats from "./create_battle_stats";
import get_players_active_in_timeframe from "./get_players_active_in_timeframe";
import get_server_option from "./get_server_option";
import set_server_option from "./set_server_option";
import has_battled_in_last_day from "./has_battled_in_last_day";
import get_user_challenges from "./get_user_quests";
import add_or_update_challenge from "./add_or_update_challenge";
import get_box_active from "./get_box_active";
import set_active_box from "./set_active_box";
import { get_mons } from "./get_mons";
import { get_mon_at_slot } from "./get_mon_at_slot";
import get_user_gate_type from "./get_user_gate_type";
import last_id from "./last_id";
import get_mon_level from "./get_active_mon_level";
import get_mon_by_seed from "./get_mon_by_seed";

export interface UnresolvedDbFns {
    add_or_update_challenge: typeof add_or_update_challenge
    battle_on_cooldown: typeof battle_on_cooldown
    create_battle_turn_stats: typeof create_battle_turn_stats
    create_battle_stats: typeof create_battle_stats
    create_item: typeof create_item
    create_user: typeof create_user
    equip_item: typeof equip_item
    get_active_mon: typeof get_active_mon
    get_all_alive_mon: typeof get_all_alive_mon
    get_dex_entries: typeof get_dex_entries
    get_all_items: typeof get_all_items
    get_all_mon: typeof get_all_mon
    get_boss: typeof get_boss
    get_box_active: typeof get_box_active
    get_eggs: typeof get_eggs
    get_inventory: typeof get_inventory
    get_item: typeof get_item
    get_leaders: typeof get_leaders
    get_mon: typeof get_mon
    get_mon_at_slot: typeof get_mon_at_slot
    get_mon_by_seed: typeof get_mon_by_seed
    get_mons: typeof get_mons
    get_mon_active_items: typeof get_mon_active_items
    get_mon_level: typeof get_mon_level,
    get_players_active_in_timeframe: typeof get_players_active_in_timeframe
    get_premium: typeof get_premium
    get_profile_stats: typeof get_profile_stats
    get_server_option: typeof get_server_option
    get_user: typeof get_user
    get_user_challenges: typeof get_user_challenges
    get_user_gate_type: typeof get_user_gate_type
    has_mon: typeof has_mon
    has_shield: typeof has_shield
    has_battled_in_last_day: typeof has_battled_in_last_day
    increment_boss: typeof increment_boss
    increment_inventory: typeof increment_inventory
    increment_mon: typeof increment_mon
    increment_player: typeof increment_player
    is_alive: typeof is_alive
    is_boss_alive: typeof is_boss_alive
    last_id: typeof last_id
    mon_in_dex: typeof mon_in_dex
    new_boss: typeof new_boss
    new_dex: typeof new_dex
    new_egg: typeof new_egg
    new_mon: typeof new_mon
    next_pray: typeof next_pray
    open_lootbox: typeof open_lootbox
    open_many_lootboxes: typeof open_many_lootboxes
    pray_cooldown: typeof pray_cooldown
    release: typeof release
    sell_all_rarity: typeof sell_all_rarity
    sell_item: typeof sell_item
    set_active_box: typeof set_active_box
    set_active_mon: typeof set_active_mon
    set_battle_cooldown: typeof set_battle_cooldown
    set_battle_results: typeof set_battle_results
    set_boss_battle_results: typeof set_boss_battle_results
    set_inventory_value: typeof set_inventory_value
    set_mon_value: typeof set_mon_value
    set_player_value: typeof set_player_value
    set_server_option: typeof set_server_option
    user_exists: typeof user_exists
}

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
export type DbReturnTypes =
    UnPromisify<ReturnType<ReturnType<typeof add_or_update_challenge>>>
    | UnPromisify<ReturnType<ReturnType<typeof battle_on_cooldown>>>
    | UnPromisify<ReturnType<ReturnType<typeof create_battle_stats>>>
    | UnPromisify<ReturnType<ReturnType<typeof create_battle_turn_stats>>>
    | UnPromisify<ReturnType<ReturnType<typeof create_item>>>
    | UnPromisify<ReturnType<ReturnType<typeof create_user>>>
    | UnPromisify<ReturnType<ReturnType<typeof equip_item>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_active_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_all_alive_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_dex_entries>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_all_items>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_all_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_boss>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_box_active>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_eggs>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_inventory>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_item>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_leaders>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_mon_by_seed>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_mon_at_slot>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_mons>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_mon_active_items>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_mon_level>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_players_active_in_timeframe>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_premium>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_profile_stats>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_server_option>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_user>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_user_challenges>>>
    | UnPromisify<ReturnType<ReturnType<typeof get_user_gate_type>>>
    | UnPromisify<ReturnType<ReturnType<typeof has_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof has_shield>>>
    | UnPromisify<ReturnType<ReturnType<typeof has_battled_in_last_day>>>
    | UnPromisify<ReturnType<ReturnType<typeof increment_boss>>>
    | UnPromisify<ReturnType<ReturnType<typeof increment_inventory>>>
    | UnPromisify<ReturnType<ReturnType<typeof increment_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof increment_player>>>
    | UnPromisify<ReturnType<ReturnType<typeof is_alive>>>
    | UnPromisify<ReturnType<ReturnType<typeof is_boss_alive>>>
    | UnPromisify<ReturnType<ReturnType<typeof last_id>>>
    | UnPromisify<ReturnType<ReturnType<typeof mon_in_dex>>>
    | UnPromisify<ReturnType<ReturnType<typeof new_boss>>>
    | UnPromisify<ReturnType<ReturnType<typeof new_dex>>>
    | UnPromisify<ReturnType<ReturnType<typeof new_egg>>>
    | UnPromisify<ReturnType<ReturnType<typeof new_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof next_pray>>>
    | UnPromisify<ReturnType<ReturnType<typeof open_lootbox>>>
    | UnPromisify<ReturnType<ReturnType<typeof open_many_lootboxes>>>
    | UnPromisify<ReturnType<ReturnType<typeof pray_cooldown>>>
    | UnPromisify<ReturnType<ReturnType<typeof release>>>
    | UnPromisify<ReturnType<ReturnType<typeof sell_all_rarity>>>
    | UnPromisify<ReturnType<ReturnType<typeof sell_item>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_active_box>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_active_mon>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_battle_cooldown>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_battle_results>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_boss_battle_results>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_inventory_value>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_mon_value>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_player_value>>>
    | UnPromisify<ReturnType<ReturnType<typeof set_server_option>>>
    | UnPromisify<ReturnType<ReturnType<typeof user_exists>>>;


export interface ResolvedDbFns {
    add_or_update_challenge: ReturnType<typeof add_or_update_challenge>;
    battle_on_cooldown: ReturnType<typeof battle_on_cooldown>;
    create_battle_stats: ReturnType<typeof create_battle_stats>;
    create_battle_turn_stats: ReturnType<typeof create_battle_turn_stats>;
    create_item: ReturnType<typeof create_item>;
    create_user: ReturnType<typeof create_user>;
    equip_item: ReturnType<typeof equip_item>;
    get_active_mon: ReturnType<typeof get_active_mon>;
    get_all_alive_mon: ReturnType<typeof get_all_alive_mon>;
    get_dex_entries: ReturnType<typeof get_dex_entries>;
    get_all_items: ReturnType<typeof get_all_items>;
    get_all_mon: ReturnType<typeof get_all_mon>;
    get_boss: ReturnType<typeof get_boss>;
    get_box_active: ReturnType<typeof get_box_active>;
    get_eggs: ReturnType<typeof get_eggs>;
    get_inventory: ReturnType<typeof get_inventory>;
    get_item: ReturnType<typeof get_item>;
    get_leaders: ReturnType<typeof get_leaders>;
    get_mon_by_seed: ReturnType<typeof get_mon_by_seed>;
    get_mons: ReturnType<typeof get_mons>;
    get_mon: ReturnType<typeof get_mon>;
    get_mon_at_slot: ReturnType<typeof get_mon_at_slot>;
    get_mon_active_items: ReturnType<typeof get_mon_active_items>;
    get_mon_level: ReturnType<typeof get_mon_level>;
    get_players_active_in_timeframe: ReturnType<typeof get_players_active_in_timeframe>;
    get_premium: ReturnType<typeof get_premium>;
    get_profile_stats: ReturnType<typeof get_profile_stats>;
    get_server_option: ReturnType<typeof get_server_option>;
    get_user: ReturnType<typeof get_user>;
    get_user_challenges: ReturnType<typeof get_user_challenges>;
    get_user_gate_type: ReturnType<typeof get_user_gate_type>;
    has_mon: ReturnType<typeof has_mon>;
    has_shield: ReturnType<typeof has_shield>;
    has_battled_in_last_day: ReturnType<typeof has_shield>;
    increment_boss: ReturnType<typeof increment_boss>;
    increment_inventory: ReturnType<typeof increment_inventory>;
    increment_mon: ReturnType<typeof increment_mon>;
    increment_player: ReturnType<typeof increment_player>;
    is_alive: ReturnType<typeof is_alive>;
    is_boss_alive: ReturnType<typeof is_boss_alive>;
    last_id: ReturnType<typeof last_id>;
    mon_in_dex: ReturnType<typeof mon_in_dex>;
    new_boss: ReturnType<typeof new_boss>;
    new_dex: ReturnType<typeof new_dex>;
    new_egg: ReturnType<typeof new_egg>;
    new_mon: ReturnType<typeof new_mon>;
    next_pray: ReturnType<typeof next_pray>;
    open_lootbox: ReturnType<typeof open_lootbox>;
    open_many_lootboxes: ReturnType<typeof open_many_lootboxes>;
    pray_cooldown: ReturnType<typeof pray_cooldown>;
    release: ReturnType<typeof release>;
    sell_all_rarity: ReturnType<typeof sell_all_rarity>;
    sell_item: ReturnType<typeof sell_item>;
    set_active_box: ReturnType<typeof set_active_box>;
    set_active_mon: ReturnType<typeof set_active_mon>;
    set_battle_cooldown: ReturnType<typeof set_battle_cooldown>;
    set_battle_results: ReturnType<typeof set_battle_results>;
    set_boss_battle_results: ReturnType<typeof set_boss_battle_results>;
    set_inventory_value: ReturnType<typeof set_inventory_value>;
    set_mon_value: ReturnType<typeof set_mon_value>;
    set_player_value: ReturnType<typeof set_player_value>;
    set_server_option: ReturnType<typeof set_server_option>;
    user_exists: ReturnType<typeof user_exists>;
}

export default ({
    add_or_update_challenge,
    battle_on_cooldown,
    create_battle_stats,
    create_battle_turn_stats,
    create_item,
    create_user,
    equip_item,
    get_active_mon,
    get_all_alive_mon,
    get_dex_entries,
    get_all_items,
    get_all_mon,
    get_boss,
    get_box_active,
    get_eggs,
    get_inventory,
    get_item,
    get_leaders,
    get_mon,
    get_mon_at_slot,
    get_mon_by_seed,
    get_mons,
    get_mon_active_items,
    get_mon_level,
    get_players_active_in_timeframe,
    get_premium,
    get_profile_stats,
    get_server_option,
    get_user,
    get_user_challenges,
    get_user_gate_type,
    has_mon,
    has_shield,
    has_battled_in_last_day,
    increment_boss,
    increment_inventory,
    increment_mon,
    increment_player,
    is_alive,
    is_boss_alive,
    last_id,
    mon_in_dex,
    new_boss,
    new_dex,
    new_egg,
    new_mon,
    next_pray,
    open_lootbox,
    open_many_lootboxes,
    pray_cooldown,
    release,
    set_active_mon,
    set_active_box,
    sell_all_rarity,
    sell_item,
    set_battle_cooldown,
    set_battle_results,
    set_boss_battle_results,
    set_inventory_value,
    set_mon_value,
    set_player_value,
    set_server_option,
    user_exists
} as UnresolvedDbFns);
