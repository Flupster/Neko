import { load } from "cheerio";
import { logger } from "../log";
import socket from "../socket/client";
const log = logger("scraper/nyaa-list");

const iUnitMap = new Map<string, number>([
  ["b", 1],
  ["K", 1024],
  ["M", 1048576],
  ["G", 1073741824],
  ["T", 1099511627776],
  ["P", 1125899906842624],
]);

const parseIecSize = (size: string) => {
  const regex = /(?<size>\d+\.\d) (?<unit>[BKMGTP])iB/g;
  const match = regex.exec(size);
  if (!match?.groups) return 0;

  const sizef = parseFloat(match.groups.size);
  const unit = iUnitMap.get(match.groups.unit) ?? 0;

  return Math.round(sizef * unit);
};

export const parseReleases = (text: string) => {
  const $ = load(text);

  return $(".torrent-list tbody tr")
    .toArray()
    .map((el) => {
      const tds = $(el).find("td");

      // get id from torrent download url
      const id = parseInt(
        /^\/download\/(?<id>\d+).torrent$/.exec(
          $(tds[2]).find("a").attr("href") ?? ""
        )?.groups?.id ?? "0"
      );

      const magnet = $(tds[2]).find("a:nth-child(2)").attr("href") ?? "";

      // get infoHash from magnet url
      const infoHash =
        /^magnet:.*btih:(?<infohash>\S+)&dn.*$/.exec(magnet)?.groups
          ?.infohash ?? "";

      const release: NekoRelease = {
        id,
        title: $(tds[1]).find("a").last().attr("title") ?? "",
        category: $(tds[0]).find("a").attr("title") ?? "",
        infoHash,
        magnet,
        downloads: parseInt($(tds[7]).text()),
        leechers: parseInt($(tds[6]).text()),
        seeders: parseInt($(tds[5]).text()),
        size: parseIecSize($(tds[3]).text()),
        pubDate: new Date($(tds[4]).text()),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      for (const [key, value] of Object.entries(release)) {
        if (value === "") {
          throw new Error(`Failed to parse row, ${key} is null`);
        }
      }

      return release as NekoRelease;
    });
};

export const fetchList = async (page = 0) => {
  const url = `https://nyaa.si/?p=${page}`;
  const response = await fetch(url);

  if (!response.ok) {
    log.error(
      { status: response.status, url: response.url },
      "Response not OK"
    );
    throw new Error(`GET ${response.status} - ${response.url}`);
  }

  const text = await response.text();
  return parseReleases(text);
};

export const getReleases = async () => {
  log.info("scraping nyaa-list");
  const releases = await fetchList();

  for (const release of releases.reverse()) {
    log.trace({ infoHash: release.infoHash }, "emitting release");
    socket.emit("release", release);
  }

  log.info({ count: releases.length }, "finished processing nyaa-list");
};
