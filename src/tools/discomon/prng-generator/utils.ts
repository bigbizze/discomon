import { ActionState } from "./action_handlers";

export const is_state_action_state = <T, TV>(s: ActionState<T, TV> | StateTypeOf<T, TV>): s is ActionState<T, TV> => "initial_seed" in s && "created_on" in s;

export type StateTypeOf<T, TV> = ActionState<T, TV>["state"];

export const map_action_state = <T, TV>(s: ActionState<T, TV> | StateTypeOf<T, TV>): StateTypeOf<T, TV> => {
    if (is_state_action_state(s)) {
        return s.state;
    } else {
        return s;
    }
};
