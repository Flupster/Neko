declare module "bun" {
  interface Env {
    MEILI_HOST: string;
    MEILI_TOKEN: string;
    MONGO_CONNECT: string;
    IRC_HOST: string;
    IRC_NICK: string;
    IRC_PASSWORD: string;
    IRC_PORT: string;
    IRC_CHANNEL: string;
  }
}

type NekoRelease = {
  id: number;
  title: string;
  category: string;
  infoHash: string;
  magnet: string;
  downloads: number;
  leechers: number;
  seeders: number;
  size: number;
  pubDate: Date;
  updatedAt: Date;
  createdAt: Date;
};
