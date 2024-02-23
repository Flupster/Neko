import { Server, Socket } from "socket.io";
import "../mongo";
import { logger } from "../log";
import releaseEvents from "./release";

const log = logger("socket");

export interface ClientEvents {
  release: (release: NekoRelease) => void;
  "release-update": (release: NekoRelease) => void;
}

export interface ServerEvents {
  release: (release: NekoRelease) => void;
}

export type NekoServer = Server<ServerEvents, ClientEvents>;
export type NekoSocket = Socket<ClientEvents, ServerEvents>;

const io: NekoServer = new Server({ path: "/nekosocket/" });

// Log connections
io.on("connection", (socket) => {
  log.info({ id: socket.id }, "new connection");

  socket.onAny((event, ...args) =>
    log.trace({ id: socket.id, args }, `socket event: ${event}`)
  );
});

io.listen(9051);
log.info("server listening on :9051");

// Load plugins

io.use(releaseEvents);

export default io;
