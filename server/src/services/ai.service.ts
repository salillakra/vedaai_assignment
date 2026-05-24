import { logger } from "../utils/logger";
import { env } from "../config/env";
import { ai, geminiConfig, geminiModels } from "../config/gemini";

export class AIService {
  static async generateQuestions(
    promptText: string,
    fileData?: any,
  ): Promise<any> {
    logger.info("Calling AI service to generate questions...");

    if (!env.GEMINI_API_KEY) {
      logger.warn("GEMINI_API_KEY is not Gdefined");
      return new Error("Gemini API not found !");
    }

    try {
      const contents: any[] = [];
      if (fileData) {
        contents.push(fileData);
      }
      contents.push(promptText);

      const response = await ai.models.generateContent({
        model: geminiModels.gemini_3_1_flash_lite,
        contents,
        config: geminiConfig,
      });

      if (!response.text) {
        throw new Error("Empty response from AI model");
      }

      return response.text;
    } catch (error) {
      logger.error("Error generating questions with AI:", error);
      throw new Error("AI generation failed.");
    }
  }
}
