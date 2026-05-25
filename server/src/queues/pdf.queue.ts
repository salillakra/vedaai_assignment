import { Queue } from "bullmq";
import { logger } from "../utils/logger";
import redisConnection from "../config/redis";

export const pdfQueue = new Queue("pdf-generation", {
  connection: redisConnection,
});

pdfQueue.on("error", (error) => logger.error("Error in pdf queue", error));

export default pdfQueue;
