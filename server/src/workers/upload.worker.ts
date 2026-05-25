import { Worker } from "bullmq";
import { logger } from "../utils/logger";
import { S3Service } from "../services/s3.service";
import { prisma } from "../config/db";
import { SocketManager } from "../socket/socket";
import redisConnection from "../config/redis";
import * as fs from "fs/promises";

export class UploadWorker {
  static async processJob(job: {
    id: string;
    data: { assignmentId: string; filePath: string; filename: string };
  }) {
    const { assignmentId, filePath, filename } = job.data;
    logger.info(`[UploadWorker] Uploading file to S3 for assignment: ${assignmentId}`);

    try {
      const fileBuffer = await fs.readFile(filePath);

      const s3Url = await S3Service.uploadPDF(assignmentId, fileBuffer);

      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { fileUrl: s3Url },
      });

      logger.info(`[UploadWorker] File uploaded successfully: ${s3Url}`);

      SocketManager.emitToAssignment(assignmentId, "assignment:file-uploaded", {
        assignmentId,
        fileUrl: s3Url,
      });
    } catch (error: any) {
      logger.error(`[UploadWorker] Background S3 upload failed:`, error);
    }
  }
}

export const startUploadWorker = () => {
  const worker = new Worker(
    "file-upload",
    async (job) => {
      await UploadWorker.processJob(job as any);
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job) => {
    logger.info(`[UploadWorker] Job ${job.id} completed successfully.`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[UploadWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
};
