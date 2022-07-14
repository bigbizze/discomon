require("../../../load-env");

if (process?.env?.BOT_MODE == null) {
    throw new Error("No bot mode!");
} else if (!process.env.hasOwnProperty(process.env.BOT_MODE)) {
    throw new Error("Incorrect bot mode specified!");
}

export const BOT_TOKEN = process.env[process.env.BOT_MODE];
