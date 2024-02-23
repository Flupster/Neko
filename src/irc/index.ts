import log from "../log";
import socket from "../socket/client";
import { bytesToHumanReadable } from "../utils";
import bot from "./irc";



socket.on("release", (release) => {
  log.info({ release: release.id }, "got release");

  const { category, title, id } = release;
  const size = bytesToHumanReadable(release.size);
  const message = `[${category}] - ${title} - (${size}) - https://nyaa.si/view/${id}/torrent`;
  bot.say(process.env.IRC_CHANNEL, message);
});