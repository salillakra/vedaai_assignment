import { prisma } from "../config/db";
import { logger } from "../utils/logger";

export class AssignmentService {
  static async createAssignment(data: {
    title: string;
    instructions?: string;
    dueDate?: string;
    fileUrl?: string;
    questionTypes: string[];
    numberOfQuestions: number;
    totalMarks: number;
  }) {
    logger.info(`Creating assignment: ${data.title}`);
    
    return prisma.assignment.create({
      data: {
        title: data.title,
        instructions: data.instructions,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        fileUrl: data.fileUrl,
        questionTypes: data.questionTypes,
        numberOfQuestions: data.numberOfQuestions,
        totalMarks: data.totalMarks,
        status: "PENDING",
      },
    });
  }

  static async getAssignmentById(id: string) {
    return prisma.assignment.findUnique({
      where: { id },
      include: { paper: true },
    });
  }

  static async updateAssignmentStatus(id: string, status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED") {
    logger.info(`Updating assignment ${id} status to ${status}`);
    return prisma.assignment.update({
      where: { id },
      data: { status },
    });
  }

  static async listAssignments() {
    return prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
      include: { paper: true },
    });
  }

  static async deleteAssignment(id: string) {
    logger.info(`Deleting assignment ${id}`);
    
    // delete related paper first if it exists
    await prisma.questionPaper.deleteMany({
      where: { assignmentId: id },
    });

    return prisma.assignment.delete({
      where: { id },
    });
  }
}
