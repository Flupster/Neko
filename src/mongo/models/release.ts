import { Schema, model } from "mongoose";
import meili from "../../meili";
import { logger } from "../../log";

const log = logger("mongo/release");

export const SORTABLE_FIELDS = [
  "id",
  "category",
  "title",
  "size",
  "pubDate",
  "seeders",
  "leechers",
  "downloads",
] as const;

const releaseSchema = new Schema<NekoRelease>(
  {
    id: { type: Number, unique: true },
    category: { type: String, index: true },
    title: { type: String, index: true, text: true },
    infoHash: { type: String, index: true },
    magnet: String,
    size: { type: Number, index: true },
    pubDate: { type: Date, index: true },
    seeders: { type: Number, index: true },
    leechers: { type: Number, index: true },
    downloads: { type: Number, index: true },
    remake: { type: Boolean, index: true },
    trusted: { type: Boolean, index: true },
    batch: { type: Boolean, index: true },
    createdAt: { type: Date, index: true },
    updatedAt: { type: Date, index: true },
  },
  { versionKey: false, id: false, timestamps: true }
);

releaseSchema.index({ name: 1, type: -1 });

const updateMeili = async (release: NekoRelease, newRelease: boolean) => {
  log.trace({ release: release.id }, "sending to meili");

  try {
    await meili.addDocuments([release]);
    log.trace({ release: release.id }, "sent to meili");
  } catch (ex) {
    log.error({ ex, release: release.id }, "failed to send to meili");
  }
};

releaseSchema.post("save", async (release) => updateMeili(release, true));
releaseSchema.post("updateOne", async (release) => updateMeili(release, false));

const Release = model<NekoRelease>("Release", releaseSchema);

export default Release;
