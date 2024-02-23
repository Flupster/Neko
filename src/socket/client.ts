import { Socket, io } from "socket.io-client";
import { logger } from "../log";
import type { ClientEvents, ServerEvents } from ".";

const log = logger("socket/client");

const socket: Socket<ClientEvents, ServerEvents> = io(
  "http://127.0.0.1:9051/",
  { path: "/nekosocket/" }
);

socket.on("connect", () => log.info("connected"));
socket.on("connect_error", (err) =>
  log.error(err, "failed to connect to socket")
);

export default socket;
