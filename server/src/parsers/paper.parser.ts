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

export const QuestionTypeSchema = z
  .string()
  .transform((val) => {
    // Normalize common AI alias variants to canonical enum values
    const normalized = val.trim();
    const lower = normalized.toLowerCase();

    if (lower.includes("multiple choice") || lower === "mcq") return "Multiple Choice Questions";
    if (lower.includes("short") || lower === "short answer") return "Short Questions";
    if (lower.includes("diagram") || lower.includes("graph")) return "Diagram/Graph-Based Questions";
    if (lower.includes("numerical") || lower.includes("math") || lower.includes("calculation")) return "Numerical Problems";
    if (lower.includes("long") || lower.includes("essay") || lower.includes("descriptive")) return "Long Answer Questions";
    if (lower.includes("true") || lower.includes("false")) return "True/False Questions";
    if (lower.includes("fill") || lower.includes("blank")) return "Fill in the Blanks";

    // If it already matches exactly, pass through
    if ((QUESTION_TYPES as readonly string[]).includes(normalized)) return normalized;

    // Unknown — default to Short Questions as safest fallback
    return "Short Questions";
  })
  .pipe(z.enum(QUESTION_TYPES));

export const QuestionSchema = z.object({
  question: z.string().min(1),

  difficulty: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.enum(["EASY", "MEDIUM", "HARD"])),

  marks: z.number().int().positive(),

  type: QuestionTypeSchema,

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

