import { Worker } from "bullmq";
import { logger } from "../utils/logger";
import { PDFService } from "../services/pdf.service";
import { S3Service } from "../services/s3.service";
import { prisma } from "../config/db";
import { SocketManager } from "../socket/socket";
import redisConnection from "../config/redis";

export class PDFWorker {
  static async processJob(job: {
    id: string;
    data: { paperId: string; assignmentId: string; sections: any };
  }) {
    const { paperId, assignmentId, sections } = job.data;
    logger.info(`[PDFWorker] Processing job for paper ID: ${paperId}`);

    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new Error(
          `Assignment with ID ${assignmentId} not found in database.`,
        );
      }

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "Generating markdown representation of the paper...",
      });

      logger.debug(`Generated Markdown layout for paper....`);

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "Rendering Your PDF document...",
      });

      const pdfBuffer = await PDFService.generatePDF(
        paperId,
        assignment.title,
        assignment.instructions || "Answer all questions honestly.",
        sections,
        assignment.totalMarks,
      );

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "Uploading PDF to cloud storage...",
      });

      const pdfUrl = await S3Service.uploadPDF(paperId, pdfBuffer);

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "Updating document records in database...",
      });

      await prisma.questionPaper.update({
        where: { id: paperId },
        data: { pdfUrl },
      });

      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: "COMPLETED" },
      });

      logger.info(
        `[PDFWorker] PDF successfully generated and saved for assignment: ${assignmentId}`,
      );

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "COMPLETED",
        pdfUrl,
        message:
          "Question paper successfully generated and ready for download!",
      });
    } catch (error: any) {
      logger.error(
        `[PDFWorker] Error generating PDF for paper ${paperId}:`,
        error,
      );

      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: "FAILED" },
      });

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "FAILED",
        error: error.message || "Failed to generate question paper PDF.",
      });
    }
  }
}

export const startPDFWorker = () => {
  const worker = new Worker(
    "pdf-generation",
    async (job) => {
      await PDFWorker.processJob(job as any);
    },
    { connection: redisConnection },
  );

  worker.on("completed", (job) => {
    logger.info(`[PDFWorker] Job ${job.id} completed successfully.`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[PDFWorker] Job ${job?.id} failed with error:`, err);
  });

  return worker;
};
