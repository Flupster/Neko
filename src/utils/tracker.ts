import querystring from "querystring";
import bencode from "bencode";

interface ScrapeResponseData {
  /** Torrent InfoHash */
  [key: string]: {
    /** Seeders */
    complete: number;
    /** Leechers */
    incomplete: number;
    /** Completed Downloads */
    downloaded: number;
  };
}

type ScrapeResponse = Promise<ScrapeResponseData>;

const alphabet = "0123456789abcdef";
const encodeLookup: string[] = [];
const decodeLookup: number[] = [];

for (let i = 0; i < 256; i++) {
  encodeLookup[i] = alphabet[(i >> 4) & 0xf] + alphabet[i & 0xf];
  if (i < 16) {
    if (i < 10) {
      decodeLookup[0x30 + i] = i;
    } else {
      decodeLookup[0x61 - 10 + i] = i;
    }
  }
}

const hex2arr = (str: string) => {
  const sizeof = str.length >> 1;
  const length = sizeof << 1;
  const array = new Uint8Array(sizeof);
  let n = 0;
  let i = 0;
  while (i < length) {
    array[n++] =
      (decodeLookup[str.charCodeAt(i++)] << 4) |
      decodeLookup[str.charCodeAt(i++)];
  }
  return array;
};

const MAX_ARGUMENTS_LENGTH = 0x10000;
const hex2bin = (hex: string) => {
  const points = hex2arr(hex);
  if (points.length <= MAX_ARGUMENTS_LENGTH)
    return String.fromCharCode(...points);

  let res = "";
  let i = 0;
  while (i < points.length) {
    res += String.fromCharCode(
      ...points.subarray(i, (i += MAX_ARGUMENTS_LENGTH))
    );
  }
  return res;
};

/**
 * Returns the statistics from a trackers announce server
 *
 * @param magnets - Array of Magnet URI's
 * @param tracker - The tracker URI to request statistics from
 * @returns the tracker statistics
 */
export const TrackerScrape = async (
  hashes: string[],
  tracker = "http://nyaa.tracker.wf:7777/announce"
): ScrapeResponse => {
  if (!hashes.length) return {};

  const params = { info_hash: hashes.map((t) => hex2bin(t)) };

  const url = new URL(tracker.replace("announce", "scrape"));
  url.search = querystring
    .stringify(params, undefined, undefined, { encodeURIComponent: escape })
    .replace(
      /[@*/+]/g,
      (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    );

  const res = await fetch(url);
  const buff = Buffer.from(await res.arrayBuffer());
  return bencode.decode(buff).files;
};
