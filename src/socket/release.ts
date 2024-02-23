import io, { type NekoSocket } from ".";
import { logger } from "../log";
import Release from "../mongo/models/release";

const log = logger("socket/release");

export default (sock: NekoSocket, next: Function) => {
  // On release received from a NekoSocket
  sock.on("release", async (release) => {
    const exists = await Release.findOne({ id: release.id });

    // check is release exists, if it does update it
    if (exists) {
      log.trace({ id: release.id }, "updating release");
      await exists.updateOne(release);
      io.emit("release-update", release);
      return;
    }

    // otherwise this is a new release, save it
    log.info({ id: release.id }, "saving release");
    await new Release(release).save();

    // emit new release
    log.info({ id: sock.id, release: release.id }, "emitting release");
    io.emit("release", release);
  });

  next();
};
