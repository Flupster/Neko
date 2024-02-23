import { logger } from "../log";
import "../mongo";
import Release from "../mongo/models/release";
import socket from "../socket/client";
import { TrackerScrape } from "../utils/tracker";

const log = logger("scraper/tracker");

export const updateTrackerStats = async () => {
  const pubDate = await Release.findOne({}).sort({ id: -1 }).skip(75);
  if (!pubDate) {
    log.error("Failed to get 76th release");
    return;
  }

  log.info({ date: pubDate.pubDate }, "getting release samples to update");

  const releases = await Release.aggregate<NekoRelease>([
    {
      $match: {
        seeders: { $gt: 0 },
        updatedAt: { $lt: pubDate.pubDate },
      },
    },
    { $sample: { size: 20 } },
  ]).exec();

  const hashes = releases.map((r) => r.infoHash.toLowerCase());

  const stats = await TrackerScrape(
    hashes,
    "http://nyaa.tracker.wf:7777/announce"
  );

  for (const [infoHash, data] of Object.entries(stats)) {
    const release = await Release.findOne({ infoHash });
    if (!release) {
      log.warn({ infoHash }, "Could not find release");
      continue;
    }

    release.downloads = data.downloaded;
    release.leechers = data.incomplete;
    release.seeders = data.complete;

    log.trace({ infoHash: release.infoHash }, "emitting release");
    socket.emit("release", release);
  }

  log.info(
    { oldest: releases[releases.length - 1].updatedAt },
    "finished processing tracker stats"
  );
};

export default updateTrackerStats;
