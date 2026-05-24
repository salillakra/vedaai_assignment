
import IORedis from 'ioredis';
import { logger } from "../utils/logger";
import { env } from "./env";

const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => logger.info("Redis connected"))

redisConnection.on("error", (err) => logger.error("Redis error", err))

export default redisConnection;
