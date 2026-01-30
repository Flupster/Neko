import { logger } from "../log";
import bot from "./irc";

const log = logger("recover");
log.info("init");

const UsernameFixLoop = async () => {
  if (bot.nick === process.env.IRC_NICK) return;

  log.warn(
    {
      current: bot.nick,
      expected: process.env.IRC_NICK,
    },
    "nickname mismatch, recovering",
  );

  bot.say(
    "NICKSERV",
    `RECOVER ${process.env.IRC_NICK} ${process.env.IRC_NICKSERV_PASSWORD}`,
  );
  await new Promise((r) => setTimeout(r, 1000));
  bot.send("NICK", process.env.IRC_NICK);
  bot.say(
    "NICKSERV",
    `RELEASE ${process.env.IRC_NICK} ${process.env.IRC_NICKSERV_PASSWORD}`,
  );
};

setInterval(UsernameFixLoop, 10000);
