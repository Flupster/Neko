import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from "fastify";
import meili from "../../meili";
import { z } from "zod";

type SearchRequest = FastifyRequest<{
  Querystring: Partial<{
    query: string;
    limit: number;
    offset: number;
    sort: string[];
  }>;
}>;

const SearchPreHandler: preHandlerAsyncHookHandler = async (req, res) => {
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

  if (!parsed) return;

  req.query = {
    query: parsed.query,
    limit: parsed.limit,
    offset: parsed.offset,
    sort: parsed.sort?.split(","),
  };
};

const SeachHandler = async (req: SearchRequest, res: FastifyReply) => {
  const { query, limit, offset, sort } = req.query;
  const search = await meili.search(query, { limit, offset, sort });

  return res.send({ ...search, sort });
};

const plugin: FastifyPluginAsync = async (app) => {
  app.route({
    url: "/",
    method: "GET",
    preHandler: SearchPreHandler,
    handler: SeachHandler,
  });
};

export default plugin;
