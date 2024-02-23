import mongoose from "mongoose";
import { logger } from "../log";

const log = logger("mongo");

mongoose.connection.on("error", (ex) => log.error(ex, "error"));
mongoose.connection.on("connected", () => log.info("connected"));
mongoose.connection.on("disconnected", () => log.warn("disconnected"));
mongoose.connection.on("reconnected", () => log.warn("reconnected"));
mongoose.connection.on("disconnecting", () => log.warn("disconnecting"));
mongoose.connection.on("close", () => log.warn("close"));

mongoose.set("debug", (name, method, query, doc) => {
  log.trace({ name, method, query, doc });
});

const mongo = await mongoose.connect(process.env.MONGO_CONNECT);

export default mongo;
