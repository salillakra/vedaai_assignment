import { Queue } from "bullmq";
import { logger } from "../utils/logger";
import redisConnection from "../config/redis";

export const questionQueue = new Queue("question-generation", {
  connection: redisConnection,
});

questionQueue.on("error", (error) =>
  logger.error("Error in question queue", error),
);

export default questionQueue;
