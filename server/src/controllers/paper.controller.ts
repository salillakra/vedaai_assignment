import { Context } from "hono";
import { prisma } from "../config/db";
import { logger } from "../utils/logger";

export class PaperController {
  static async getByAssignment(c: Context) {
    const assignmentId = c.req.param("assignmentId");

    try {
      const paper = await prisma.questionPaper.findUnique({
        where: { assignmentId },
      });

      if (!paper) {
        return c.json({ success: false, error: "Question paper not found for this assignment." }, 404);
      }

      return c.json({ success: true, data: paper });
    } catch (error: any) {
      logger.error(`Error in get paper controller for assignment ${assignmentId}:`, error);
      return c.json({ success: false, error: "Failed to fetch question paper" }, 500);
    }
  }

  static async generateDynamicPDF(c: Context) {
    const assignmentId = c.req.param("assignmentId");
    const name = c.req.query("name") || "";
    const roll = c.req.query("roll") || "";
    const section = c.req.query("section") || "";

    try {
      const paper = await prisma.questionPaper.findUnique({
        where: { assignmentId },
        include: { assignment: true },
      });

      if (!paper) {
        return c.json({ success: false, error: "Question paper not found." }, 404);
      }

      const { PDFService } = await import("../services/pdf.service");
      const pdfBuffer = await PDFService.generatePDF(
        paper.id,
        paper.assignment.title,
        paper.assignment.instructions || "",
        paper.sections,
        paper.assignment.totalMarks
      );

      c.header("Content-Type", "application/pdf");
      c.header("Content-Disposition", `attachment; filename="paper-${assignmentId}.pdf"`);
      return c.body(pdfBuffer as any);
    } catch (error: any) {
      logger.error(`Error generating dynamic PDF:`, error);
      return c.json({ success: false, error: "Failed to generate dynamic PDF" }, 500);
    }
  }
}
