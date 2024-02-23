import Fastify from "fastify";
import routes from "./routes";
import { logger } from "./log";

const api = Fastify({ logger: logger("api"), ignoreTrailingSlash: true });

await api.register(routes, { prefix: "/api" });

export default api;
