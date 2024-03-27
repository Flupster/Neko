import irc from "matrix-org-irc";
import { logger } from "../log";

const log = logger("irc/irc");

const bot = new irc.Client(process.env.IRC_HOST, process.env.IRC_NICK, {
  password: process.env.IRC_PASSWORD,
  port: parseInt(process.env.IRC_PORT),
  channels: [process.env.IRC_CHANNEL],
  autoConnect: true,
  autoRejoin: true,
  debug: false,
  floodProtection: true,
  floodProtectionDelay: 1000,
});

bot.on("error", (m) => log.error(m, "error"));
bot.on("netError", (e) => log.error(e, "neterror"));
bot.on("sasl_error", (e, a) => log.error({ e, a }, "sasl error"));

bot.on("connect", () => {
  if (!bot.conn) {
    log.warn("connected but connection is null");
  }

  bot.conn?.on("close", () => {
    log.fatal("connection closed");
    process.exit(1);
  });
});

bot.on("raw", (m) => log.trace(m, "raw irc message"));

export default bot;
