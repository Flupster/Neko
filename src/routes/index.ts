import type { FastifyPluginAsync } from "fastify";
import releasev1 from "./v1/release";
import trackerv1 from "./v1/tracker";
import search from "./search";

const plugin: FastifyPluginAsync = async (app) => {
  await app.register(search, { prefix: "/search" });
  await app.register(releasev1, { prefix: "/v1" });
  await app.register(trackerv1, { prefix: "/v1" });
};

export default plugin;
