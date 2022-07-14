import { DefaultCommandsReturn } from "../commands";
import { UnresolvedClientOperator } from "../bot-types";

export function ready({ discord }: UnresolvedClientOperator) {
    return async (): Promise<DefaultCommandsReturn> => {
        if (discord?.user == null) {
            throw new Error("received ready event but user doesn't exist!");
        }
        await Promise.all([
            discord.user.setActivity("check .news / .help", { type: 'STREAMING' }),
            discord.user.setUsername('Discord Monsters')
        ]);
    };
}
