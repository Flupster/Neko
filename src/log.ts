import pino from "pino";

const log = pino({level: "debug"});
export const logger = (name?: string) => pino({ name });

export default log;
