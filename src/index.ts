import "./mongo";
import api from "./api";

api.listen({ port: 9050 }, (e) => {
  if (!e) return;
  api.log.error(e);
  process.exit(1);
});
