import { DbDiscomonSubset, MonState } from "../../scaffold/type_scaffolding";
import {
    AttackerDefenderUser,
    Battler,
    BossBattle,
    BossDiscomonBattle,
    PlayerBattle,
    StandardBattler,
    UserDiscomonBattle
} from "./index";
import { MonsterType } from "../../tools/discomon";
import prng_item from "../../tools/discomon/prng-generator/prng-items";
import { DbItem } from "../../scaffold/database_types";
import { ResolvedDbFns } from "../../tools/database";
import { apply_items_to_mon } from "../../helpers/discomon_helpers";
import { BattleMon, BattleUser, BattleUsers } from "../../tools/battles/resolvers";
import get_alphamon from "../../tools/discomon/alpha_seed";

export const map_db_items_to_items = (mon: BattleMon, items: DbItem[]): BattleMon => (
    apply_items_to_mon(
        items.map(item => prng_item(item.id, item.seed, item.rarity, null)),
        mon
    )
);

export const map_boss_to_battle_mon = (battler: BossBattle, mon: MonState): BattleMon => ({
    attributes: mon.attributes,
    experience: mon.experience,
    id: mon.id,
    modifier: [],
    level: mon.level,
    nickname: battler.nickname,
    stats: {
        ...mon.stats,
        hp: battler.mon.max_hp,
        current_hp: battler.mon.hp
    },
    xp_to_next_level: mon.xp_to_next_level
});

export const map_to_battle_mon = (battler: Battler, mon: MonState, items: DbItem[]): BattleMon => (
    map_db_items_to_items({
        attributes: mon.attributes,
        experience: mon.experience,
        id: mon.id,
        modifier: [],
        level: mon.level,
        nickname: battler.nickname,
        stats: mon.stats,
        xp_to_next_level: mon.xp_to_next_level,
        items: items
    }, items)
);

export const map_to_mon_db = (side: Battler): DbDiscomonSubset => ({
    experience: side.mon.experience,
    id: side.mon.id,
    level: side.mon.level,
    seed: side.mon.seed
});

const mon_is_boss_mon = (mon: BossDiscomonBattle | UserDiscomonBattle, mon_type: MonsterType): mon is BossDiscomonBattle => (
    mon_type === "boss"
);

export const map_to_battle_user = async (battler: StandardBattler, mon_type: MonsterType, db_fns: ResolvedDbFns): Promise<BattleUser> => {
    const is_boss = mon_is_boss_mon(battler.mon, mon_type);
    const items = await db_fns.get_mon_active_items(battler.mon.id);
    const mon_state = get_alphamon({
            ...map_to_mon_db(battler),
            ...battler.mon
        },
        mon_type
    );
    return {
        ...battler,
        display_name: battler.display_name,
        mon: !is_boss
            ? map_to_battle_mon(
                battler,
                mon_state,
                items
            )
            : map_boss_to_battle_mon(
                battler,
                mon_state
            ),
        mon_state,
        is_boss
    };
};

const is_not_boss = (defender: Battler): defender is PlayerBattle => (
    "boss_kills" in defender
);

const resolve_defender = (battler: Battler): StandardBattler => {
    return is_not_boss(battler) ? ({
        ...battler,
        mon: {
            name: "",
            attempts: 0,
            damage: 0,
            hp: 0,
            max_hp: 0,
            proc: 0,
            last_reset: Date.now(),
            ...battler.mon
        }
    }) : ({
        active_box: 0,
        active_mon: 0,
        last_battle: 0,
        last_pray: 0,
        premium: 0,
        premium_date: 0,
        registered: 0,
        ...battler,
        mon: {
            boss_damage: 0,
            boss_kills: 0,
            date_hatched: 0,
            item_id: 0,
            losses: 0,
            nickname: battler.nickname,
            owner: "",
            ...battler.mon
        }

    });
};

export const map_to_battle_users = async ({
                                              attacker,
                                              defender,
                                              is_pve
                                          }: AttackerDefenderUser, db_fns: ResolvedDbFns): Promise<BattleUsers> => ({
    attacker: await map_to_battle_user(resolve_defender(attacker), "user", db_fns),
    defender: await map_to_battle_user(resolve_defender(defender), is_pve ? "boss" : "user", db_fns)
});
