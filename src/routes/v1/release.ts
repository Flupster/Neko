import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from "fastify";
import Release from "../../mongo/models/release";
import { z } from "zod";

const ReleasesPreHandler: preHandlerAsyncHookHandler = async (req, res) => {
  const sortRegex = /([\S]+:(?:asc|desc))(?:,|$)/;
  const schema = z.object({
    query: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(50).optional(),
    offset: z.coerce.number().min(0).default(0).optional(),
    sort: z.string().regex(sortRegex).optional(),
  });

  const parsed = await schema.parseAsync(req.query).catch((err) => {
    res.status(400).send({ errors: err.issues });
  });

  if (!parsed) {
    console.log("not parsed");
    return;
  }

  req.query = {
    query: parsed.query ? { $text: { $search: parsed.query } } : {},
    limit: parsed.limit ?? 50,
    offset: parsed.offset ?? 0,
    sort: parsed.sort?.split(",").map((s) => s.split(":")) ?? {
      pubDate: "desc",
    },
  };
};

type ReleasesRequest = FastifyRequest<{
  Querystring: {
    query: { $text: { $search: string } } | {};
    limit: number;
    offset: number;
    sort: [string, "asc" | "desc"][];
  };
}>;

const ReleasesHandler = async (req: ReleasesRequest, res: FastifyReply) => {
  const { query, limit, offset, sort } = req.query;
  const releases = await Release.find(query, { _id: 0 })
    .limit(limit)
    .skip(offset)
    .sort(sort)
    .exec();

  return res.send({ hits: releases, ...req.query });
};

type TReleaseHandler = (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => void;

const ReleaseHandler: TReleaseHandler = async (req, res) => {
  const release = await Release.findOne({ id: req.params.id });

  if (release) res.send(release);
  else res.status(404).send({ errors: ["release not found"] });
};

const plugin: FastifyPluginAsync = async (app) => {
  app.route({
    url: "/release/:id(^\\d+)",
    method: "GET",
    handler: ReleaseHandler,
  });

  app.route({
    url: "/release/",
    method: "GET",
    preHandler: ReleasesPreHandler,
    handler: ReleasesHandler,
  });
};

export default plugin;
