import { logger } from "../utils/logger";
import { z } from "zod";

export const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "True/False Questions",
  "Fill in the Blanks",
] as const;

export const QuestionSchema = z.object({
  question: z.string().min(1),

  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),

  marks: z.number().int().positive(),

  type: z.enum(QUESTION_TYPES),

  options: z.union([z.array(z.string()), z.null(), z.undefined()]).transform((val) => val ?? []),

  answer: z.string().min(1),
});

export const SectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(QuestionSchema),
});

export const PaperSchema = z.object({
  title: z.string().min(1),
  totalMarks: z.number().int().positive(),
  sections: z.array(SectionSchema),
});

export class PaperParser {
  static parseJSONResponse(rawText: string): any {
    logger.info("Parsing AI text response into structured JSON...");

    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned
          .replace(/^```json/, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();
      }
      const parsed = JSON.parse(cleaned);

      const validated = PaperSchema.safeParse(parsed);

      if (!validated.success) {
        throw new Error(
          validated.error?.message || "Failed to parse AI response",
        );
      }

      return validated.data;
    } catch (error: any) {
      logger.error("Error parsing raw LLM response:", error);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}

