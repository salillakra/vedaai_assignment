import { Context } from "hono";
import { z } from "zod"; 

const createAssignmentSchema = z.object({
  title: z.string({
    error: (issue) =>
      issue.input === undefined
        ? "Title is required"
        : "Title must be a string",
  }).min(1, "Title cannot be empty"),
  
  instructions: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional(),
  tempFilePath: z.string().optional(),
  tempFilename: z.string().optional(),
  
  numberOfQuestions: z.number({
    error: (issue) =>
      issue.input === undefined
        ? "numberOfQuestions is required"
        : "numberOfQuestions must be a number",
  }).positive("numberOfQuestions must be a positive number"),
  
  totalMarks: z.number({
    error: (issue) =>
      issue.input === undefined
        ? "totalMarks is required"
        : "totalMarks must be a number",
  }).positive("totalMarks must be a positive number"),
  
  questionTypes: z.array(z.string()).nonempty("questionTypes must be a non-empty array of strings"),
});

export const validateCreateAssignment = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = createAssignmentSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Validation failed";
      return { isValid: false as const, error: errorMsg };
    }

    return { isValid: true as const, data: result.data };
  } catch {
    return { isValid: false as const, error: "Invalid JSON payload." };
  }
};
