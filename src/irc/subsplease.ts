import socket from "../socket/client";
import { bytesToHumanReadable } from "../utils";
import bot from "./irc";

socket.on("release", (release) => {
  if (!release.title.includes("[SubsPlease]")) return;

  const size = bytesToHumanReadable(release.size).replace("i", "");
  const message = `[Release] ${release.title} (${size}) - https://nyaa.si/view/${release.id} - https://nyaa.si/view/${release.id}/torrent`;
  bot.say("#subsplease", message);
});
