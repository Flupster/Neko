import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from "fastify";
import { z } from "zod";
import { TrackerScrape } from "../../utils/tracker";
import Release from "../../mongo/models/release";
import api from "../../api";
import socket from "../../socket/client";

const StatsPreHandler: preHandlerAsyncHookHandler = async (req, res) => {
  const schema = z.object({ infoHashes: z.string().max(820) });

  const parsed = await schema.parseAsync(req.query).catch((err) => {
    res.status(400).send({ errors: err.issues });
  });

  if (!parsed) return;

  const infoHashes = parsed.infoHashes.split(",");
  req.query = { infoHashes: infoHashes };
};

type StatsRequest = FastifyRequest<{
  Querystring: { infoHashes: string[] };
}>;

const StatsHandler = async (req: StatsRequest, res: FastifyReply) => {
  const stats = await TrackerScrape(req.query.infoHashes);
  res.send(stats);

  for (const [infoHash, data] of Object.entries(stats)) {
    const release = await Release.findOne({ infoHash });
    if (!release) {
      api.log.warn({ infoHash }, "Could not find release");
      continue;
    }

    release.downloads = data.downloaded;
    release.leechers = data.incomplete;
    release.seeders = data.complete;

    api.log.trace({ infoHash: release.infoHash }, "emitting release");
    socket.emit("release", release);
  }
};

const plugin: FastifyPluginAsync = async (app) => {
  app.route({
    url: "/tracker/stats",
    method: "GET",
    handler: StatsHandler,
    preHandler: StatsPreHandler,
  });
};

export default plugin;
