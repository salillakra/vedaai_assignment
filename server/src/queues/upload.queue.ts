import { Queue } from "bullmq";
import redisConnection from "../config/redis";

export const uploadQueue = new Queue("file-upload", {
  connection: redisConnection,
});
