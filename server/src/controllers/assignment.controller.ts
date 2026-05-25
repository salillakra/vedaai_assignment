import { Context } from "hono";
import { AssignmentService } from "../services/assignment.service";
import { validateCreateAssignment } from "../validators/assignment.validator";
import { questionQueue } from "../queues/question.queue";
import { uploadQueue } from "../queues/upload.queue";
import { generateAssignmentPrompt } from "../prompts/generatePrompt";
import { logger } from "../utils/logger";
import { SocketManager } from "../socket/socket";
import * as fs from "fs/promises";
import * as path from "path";

export class AssignmentController {
  static async uploadFile(c: Context) {
    try {
      const body = await c.req.parseBody();
      const file = body.file;

      if (!file || !(file instanceof File)) {
        return c.json({ success: false, error: "No file uploaded or invalid file format" }, 400);
      }

      const fileId = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9);
      const ext = path.extname(file.name) || ".pdf";
      const filename = `temp-${fileId}${ext}`;

      const tempDir = path.join(process.cwd(), "public", "temp");
      await fs.mkdir(tempDir, { recursive: true });

      const filePath = path.join(tempDir, filename);
      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));

      const localUrl = `/temp/${filename}`;
      return c.json({
        success: true,
        fileId: fileId,
        url: localUrl,
        filePath: filePath,
        filename: filename,
      });
    } catch (error: any) {
      logger.error("Error in upload file controller:", error);
      return c.json({ success: false, error: "Failed to upload file" }, 500);
    }
  }

  static async create(c: Context) {
    const validation = await validateCreateAssignment(c);

    if (!validation.isValid) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    try {
      const assignment = await AssignmentService.createAssignment(
        validation.data,
      );

      const rawBody = await c.req.json().catch(() => ({}));
      if (rawBody.tempFilePath && rawBody.tempFilename) {
        await uploadQueue.add("upload-to-s3", {
          assignmentId: assignment.id,
          filePath: rawBody.tempFilePath,
          filename: rawBody.tempFilename,
        });
      }

      const prompt = generateAssignmentPrompt(validation.data);
      const genQuestionJob = await questionQueue.add("generate-questions", {
        assignmentId: assignment.id,
        prompt,
        filePath: rawBody.tempFilePath || null,
        attempts: 3,
      });

      return c.json(
        {
          JobId: genQuestionJob.id,
          success: true,
          message:
            "Assignment creation initiated. AI is generating paper sections.",
          data: assignment,
        },
        202,
      );
    } catch (error: any) {
      logger.error("Error in create assignment controller:", error);
      return c.json(
        { success: false, error: "Failed to create assignment" },
        500,
      );
    }
  }

  static async list(c: Context) {
    try {
      const assignments = await AssignmentService.listAssignments();
      return c.json({ success: true, data: assignments });
    } catch (error: any) {
      logger.error("Error in list assignments controller:", error);
      return c.json(
        { success: false, error: "Failed to list assignments" },
        500,
      );
    }
  }

  static async get(c: Context) {
    const id = c.req.param("id");
    if (!id) {
      return c.json(
        { success: false, error: "Assignment ID is required" },
        400,
      );
    }
    try {
      const assignment = await AssignmentService.getAssignmentById(id);
      if (!assignment) {
        return c.json({ success: false, error: "Assignment not found" }, 404);
      }
      return c.json({ success: true, data: assignment });
    } catch (error: any) {
      logger.error(`Error in get assignment controller for id ${id}:`, error);
      return c.json({ success: false, error: "Failed to get assignment" }, 500);
    }
  }

  static async delete(c: Context) {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, error: "Assignment ID is required" }, 400);
    }
    try {
      await AssignmentService.deleteAssignment(id);
      return c.json({ success: true, message: "Assignment deleted successfully" });
    } catch (error: any) {
      logger.error(`Error in delete assignment controller for id ${id}:`, error);
      return c.json({ success: false, error: "Failed to delete assignment" }, 500);
    }
  }

  static async retry(c: Context) {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, error: "Assignment ID is required" }, 400);
    }
    try {
      const assignment = await AssignmentService.getAssignmentById(id);
      if (!assignment) {
        return c.json({ success: false, error: "Assignment not found" }, 404);
      }

      await AssignmentService.updateAssignmentStatus(id, "PENDING");

      SocketManager.emitToAssignment(id, "assignment:status", {
        assignmentId: id,
        status: "PENDING",
        message: "Retrying generation...",
      });

      const prompt = generateAssignmentPrompt({
        title: assignment.title,
        instructions: assignment.instructions || undefined,
        questionTypes: assignment.questionTypes,
        numberOfQuestions: assignment.numberOfQuestions,
        totalMarks: assignment.totalMarks,
      });

      const genQuestionJob = await questionQueue.add("generate-questions", {
        assignmentId: id,
        prompt,
        filePath: null,
      });

      return c.json({
        success: true,
        message: "Retry initiated.",
        jobId: genQuestionJob.id,
      });
    } catch (error: any) {
      logger.error(`Error in retry assignment controller for id ${id}:`, error);
      return c.json({ success: false, error: "Failed to retry assignment" }, 500);
    }
  }
}
