import {
    add_hp_bar,
    add_status,
    decrement_dmg,
    decrement_hp,
    end_turn,
    fill_in_hp_bar_gaps,
    increment_dmg,
    increment_hp,
    remove_status,
    set_dmg,
    update_status
} from "../../src/tools/battles/actions";
import { BattleState } from "../../src/tools/battles/resolvers";
import { get_dummy_battle_state, rand_int, rand_side, rand_status } from "./utils";
import { dummy_users_state } from "../../src/tools/battles/utils";

const dummy_state: BattleState = get_dummy_battle_state();

test(fill_in_hp_bar_gaps.name, () => {
    const side = rand_side();
    const value = rand_int();
    const result = fill_in_hp_bar_gaps()({
        ...dummy_state,
        turn_info: {
            side,
            turn_end: false,
            turn_number: value
        }
    }, side);

    const side2 = rand_side();
    const value2 = rand_int();
    const result2 = fill_in_hp_bar_gaps()({
        ...dummy_state,
        state_by_side: {
            ...dummy_state.state_by_side,
            [side2]: {
                ...dummy_state.state_by_side[side2],
                health_bar: {
                    0: "████████████"
                }
            }
        },
        turn_info: {
            side: side2,
            turn_end: false,
            turn_number: value2
        }
    }, side2);
    console.log({
        name: fill_in_hp_bar_gaps.name,
        tests: [
            { result, value, side },
            { result2, value2, side2 }
        ]
    });
    expect(Object.keys(result.health_bar).length).toBe(value + 1);
    expect(Object.keys(result2.health_bar).length).toBe(value2 + 1);
    expect(Object.values(result.health_bar).filter(x => x !== "▒▒▒▒▒▒▒▒▒▒▒▒").length).toBe(0);
    expect(Object.values(result2.health_bar).filter(x => x !== "████████████").length).toBe(0);
});

test(increment_hp.name, () => {
    const side = rand_side();
    const value = rand_int();
    const result = increment_hp(value)(dummy_state, side);
    console.log({
        name: increment_hp.name,
        result, value, side
    });
    expect(result.hp - dummy_state.state_by_side[side].hp).toBe(value);
});

test(increment_dmg.name, () => {
    const side = rand_side();
    const value = rand_int();
    const result = increment_dmg(value)(dummy_state, side);
    console.log({
        name: increment_dmg.name,
        result, value, side
    });
    expect(result.turn_dmg - dummy_state.state_by_side[side].turn_dmg).toBe(value);
});

test(decrement_hp.name, () => {
    const side = rand_side();
    const value = rand_int();
    const result = decrement_hp(value)(dummy_state, side);
    console.log({
        name: decrement_hp.name,
        result, value, side
    });
    expect(result.hp - dummy_state.state_by_side[side].hp).toBe(value * -1);
});

test(decrement_dmg.name, () => {
    const side = rand_side();
    const value = rand_int();
    const result = decrement_dmg(value)(dummy_state, side);
    console.log({
        name: decrement_dmg.name,
        result, value, side
    });
    expect(result.turn_dmg - dummy_state.state_by_side[side].turn_dmg).toBe(value * -1);
});

test(set_dmg.name, () => {
    const side = rand_side();
    const value = rand_int();
    const result = set_dmg(value, false)(dummy_state, side);
    const side2 = rand_side();
    const value2 = rand_int();
    const result2 = set_dmg(value2, true)(dummy_state, side2);
    console.log({
        name: set_dmg.name,
        tests: [
            { result, value, side },
            { result2, value2, side2 }
        ]
    });
    expect(result.turn_dmg).toBe(value);
    expect(result2.permanent_dmg).toBe(value2);
});

test(add_hp_bar.name, () => {
    const side = rand_side();
    const hp_bar_fn = add_hp_bar(dummy_users_state[side].mon.stats.hp);
    const result = hp_bar_fn(dummy_state, side);
    const side2 = rand_side();
    const result2 = hp_bar_fn({
        ...dummy_state,
        state_by_side: {
            ...dummy_state.state_by_side,
            [side2]: {
                ...dummy_state.state_by_side[side2],
                hp: 0
            }
        }
    }, side2);
    console.log({
        name: add_hp_bar.name,
        test: [
            { side, result },
            { side2, result2 }
        ]
    });
    expect(result.health_bar[dummy_state.turn_info.turn_number]).toBe("████████████");
    expect(result2.health_bar[dummy_state.turn_info.turn_number]).toBe("▒▒▒▒▒▒▒▒▒▒▒▒");
});

test(add_status.name, () => {
    const side = rand_side();
    const value = rand_status();
    const result = add_status(value)(dummy_state, side);
    console.log({
        name: add_status.name,
        result, value, side
    });
    expect(result.status.filter(v => v.status === value).length).toBe(1);
});

test(remove_status.name, () => {
    const side = rand_side();
    const value = rand_status();
    const result = remove_status(value)({
        ...dummy_state,
        state_by_side: {
            ...dummy_state.state_by_side,
            [side]: add_status(value)(dummy_state, side)
        }
    }, side);
    console.log({
        name: remove_status.name,
        result, value, side
    });
    expect(result.status.filter(item => item.status === value).length).toBe(0);
});

test(update_status.name, () => {
    const side = rand_side();
    const status = rand_status();
    const value = rand_int();
    const result = update_status(status, value)({
        ...dummy_state,
        state_by_side: {
            ...dummy_state.state_by_side,
            [side]: add_status(status, value + 1)(dummy_state, side)
        }
    }, side);
    console.log({
        name: update_status.name,
        result, value, side, status
    });
    expect(result.status.includes({ status, value })).toBeFalsy();
});

test(end_turn.name, () => {
    const result = end_turn()(dummy_state.turn_info);
    console.log({
        name: end_turn.name,
        result
    });
    expect(result.turn_end).toBeTruthy();
});

