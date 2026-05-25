import { Worker } from "bullmq";
import { logger } from "../utils/logger";
import { AIService } from "../services/ai.service";
import { prisma } from "../config/db";
import { pdfQueue } from "../queues/pdf.queue";
import { PaperParser } from "../parsers/paper.parser";
import { SocketManager } from "../socket/socket";
import redisConnection from "../config/redis";
import * as fs from "fs/promises";
import * as path from "path";

export class QuestionWorker {
  static async processJob(job: { id: string; data: { assignmentId: string; prompt: string; filePath?: string | null } }) {
    const { assignmentId, prompt, filePath } = job.data;
    logger.info(`[QuestionWorker] Processing job for assignment: ${assignmentId}`);

    try {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: "PROCESSING" },
      });
      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "AI Engine is cooking your paper 😵‍💫...",
      });

      let fileData: any = null;
      let targetPath = filePath;

      if (!targetPath) {
        const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
        });
        if (assignment?.fileUrl) {
          if (assignment.fileUrl.startsWith("/")) {
            targetPath = path.join(process.cwd(), "public", assignment.fileUrl);
          } else if (assignment.fileUrl.startsWith("http")) {
            try {
              const res = await fetch(assignment.fileUrl);
              if (res.ok) {
                const buffer = Buffer.from(await res.arrayBuffer());
                const ext = path.extname(assignment.fileUrl.split("?")[0]).toLowerCase();
                let mimeType = "application/pdf";
                if (ext === ".png") mimeType = "image/png";
                else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
                else if (ext === ".txt") mimeType = "text/plain";

                fileData = {
                  inlineData: {
                    data: buffer.toString("base64"),
                    mimeType,
                  },
                };
                logger.info(`[QuestionWorker] Downloaded and attached remote file for Gemini context: ${assignment.fileUrl} (${mimeType})`);
              }
            } catch (dlErr) {
              logger.error("[QuestionWorker] Failed to download remote reference file:", dlErr);
            }
          }
        }
      }

      if (targetPath && !fileData) {
        try {
          const fileBuffer = await fs.readFile(targetPath);
          const ext = path.extname(targetPath).toLowerCase();
          let mimeType = "application/pdf";
          if (ext === ".png") mimeType = "image/png";
          else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
          else if (ext === ".txt") mimeType = "text/plain";

          fileData = {
            inlineData: {
              data: fileBuffer.toString("base64"),
              mimeType,
            },
          };
          logger.info(`[QuestionWorker] Attaching reference document to Gemini context: ${targetPath} (${mimeType})`);
        } catch (fileErr) {
          logger.error(`[QuestionWorker] Failed to read reference file for Gemini context:`, fileErr);
        }
      }

      const aiResultRaw = await AIService.generateQuestions(prompt, fileData);

      if (filePath) {
        await fs.unlink(filePath).catch((err) => {
          logger.warn(`[QuestionWorker] Failed to delete reference file:`, err);
        });
      }

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "Validating question paper structure...",
      });
      const parsedPaper = PaperParser.parseJSONResponse(aiResultRaw);

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "Saving generated question paper to database...",
      });

      // delete old paper if exists to avoid duplication
      await prisma.questionPaper.deleteMany({
        where: { assignmentId },
      });

      const paper = await prisma.questionPaper.create({
        data: {
          assignmentId,
          sections: parsedPaper.sections,
        },
      });

      logger.info(`[QuestionWorker] Question paper saved successfully: ${paper.id}`);

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "PROCESSING",
        message: "Queuing PDF generation task...",
      });

      await pdfQueue.add("generate-pdf", {
        paperId: paper.id,
        assignmentId,
        sections: parsedPaper.sections,
      });

    } catch (error: any) {
      logger.error(`[QuestionWorker] Error processing assignment ${assignmentId}:`, error);

      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: "FAILED" },
      });

      SocketManager.emitToAssignment(assignmentId, "assignment:status", {
        assignmentId,
        status: "FAILED",
        error: error.message || "Failed to generate question paper.",
      });
    }
  }
}

export const startQuestionWorker = () => {
  const worker = new Worker(
    "question-generation",
    async (job) => {
      await QuestionWorker.processJob(job as any);
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job) => {
    logger.info(`[QuestionWorker] Job ${job.id} completed successfully.`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[QuestionWorker] Job ${job?.id} failed with error:`, err);
  });

  return worker;
};
