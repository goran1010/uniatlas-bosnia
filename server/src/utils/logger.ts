import pino from "pino";

const logger = pino({
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export { logger };
