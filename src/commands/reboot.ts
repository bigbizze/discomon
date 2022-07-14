import { DefaultCommandsReturn } from "./index";
import { ClientOperator } from "../bot-types";
import { MessageNonNull, send_to_discord } from "../helpers/discomon_helpers";

export default async function ({ discord, db_fns, commands }: ClientOperator, message: MessageNonNull, ...args: string[]): Promise<DefaultCommandsReturn> {
    if (message.author.id === '217934695055228928' || message.author.id === "279344233607987210") {
        if (args.length === 0) {
            return;
        }
        const server_options = await db_fns.get_server_option("reboot", "reboot_reason");
        const reboot_words = args.join(' ');
        await db_fns.set_server_option(
            { name: "reboot", value: !server_options.reboot },
            { name: "reboot_reason", value: reboot_words ? reboot_words : "" }
        );
        console.log('Reboot sent across shards.');
        send_to_discord(message.channel, `\`Server alive status is ${ (!!server_options.reboot) }\``);
    }
}
