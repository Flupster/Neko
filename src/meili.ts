import { MeiliSearch } from "meilisearch";

export const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_TOKEN,
});

const meili = meiliClient.index<NekoRelease>("neko-releases");

export default meili;
