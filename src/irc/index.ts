import log from "../log";
import socket from "../socket/client";
import { bytesToHumanReadable } from "../utils";
import bot from "./irc";
import "./subsplease";

socket.on("release", (release) => {
  log.info({ release: release.id }, "got release");

  const { category, title, id } = release;
  const size = bytesToHumanReadable(release.size);
  const url = `https://nyaa.si/view/${id}/torrent`;
  const tags = [
    release.trusted ? "trusted" : "",
    release.remake ? "remake" : "",
    release.batch ? "batch" : "",
  ].join(" ");

  const message = `[${category}] - ${title} - (${size}) - ${url} ${tags}`;

  bot.say(process.env.IRC_CHANNEL, message.trim());
});
