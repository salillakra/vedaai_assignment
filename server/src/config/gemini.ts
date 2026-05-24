import { GoogleGenAI, Type, type GenerateContentConfig } from "@google/genai";
import { env } from "./env";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

// https://ai.google.dev/gemini-api/docs/models
const geminiModels = {
  gemini_3_1_pro_preview: "gemini-3.1-pro-preview",
  gemini_3_5_flash: "gemini-3.5-flash",
  gemini_3_flash_preview: "gemini-3-flash-preview",
  gemini_3_1_flash_lite: "gemini-3.1-flash-lite",
  gemini_3_1_flash_lite_preview: "gemini-3.1-flash-lite-preview",
  gemini_3_1_flash_image_preview: "gemini-3.1-flash-image-preview",
  gemini_3_pro_image_preview: "gemini-3-pro-image-preview",
  gemini_3_1_flash_live_preview: "gemini-3.1-flash-live-preview",
  gemini_3_1_flash_tts_preview: "gemini-3.1-flash-tts-preview",
  gemini_2_5_flash: "gemini-2.5-flash",
  gemini_2_5_flash_image: "gemini-2.5-flash-image",
  gemini_2_5_flash_native_audio_preview:
    "gemini-2.5-flash-native-audio-preview-12-2025",
  gemini_2_5_flash_tts_preview: "gemini-2.5-flash-preview-tts",
  gemini_2_5_flash_lite: "gemini-2.5-flash-lite",
  gemini_2_5_pro: "gemini-2.5-pro",
  gemini_2_5_pro_tts_preview: "gemini-2.5-pro-preview-tts",
  veo_3_1_generate_preview: "veo-3.1-generate-preview",
  veo_3_1_lite_generate_preview: "veo-3.1-lite-generate-preview",
  imagen_4: "imagen",
  lyria_3_pro_preview: "lyria-3-pro-preview",
  lyria_3_clip_preview: "lyria-3-clip-preview",
  lyria_realtime_exp: "lyria-realtime-exp",
  gemini_2_5_computer_use_preview: "gemini-2.5-computer-use-preview-10-2025",
  gemini_deep_research_preview: "deep-research-preview-04-2026",
  gemini_deep_research_max_preview: "deep-research-max-preview-04-2026",
  antigravity_agent_preview: "antigravity-preview-05-2026",
  gemini_embedding_2: "gemini-embedding-2",
  gemini_embedding: "gemini-embedding-001",
  gemini_robotics_er_1_6_preview: "gemini-robotics-er-1.6-preview",
} as const;

export const SYSTEM_INSTRUCTION = `
You are a professional academic assessment generator.

Your responsibility is to generate:
- high-quality exam papers
- assignments
- assessments
- quizzes

You must produce:
- academically correct questions
- realistic difficulty progression
- clear instructions
- properly distributed marks
- concise and accurate answers

QUESTION QUALITY RULES:

- Questions must be educational and realistic
- Avoid vague or ambiguous wording
- Questions should test understanding, reasoning, and practical knowledge
- Ensure questions match the requested difficulty level
- Avoid duplicate questions
- Avoid repetitive phrasing

DIFFICULTY GUIDELINES:

- EASY:
  Basic recall and foundational understanding

- MEDIUM:
  Conceptual understanding and application

- HARD:
  Analytical, problem-solving, and advanced reasoning

MARKDOWN RULES:

Markdown formatting is allowed ONLY inside:
- question
- answer
- instruction

Allowed markdown:
- bold
- italic
- bullet lists
- numbered lists
- inline code
- fenced code blocks
- tables
- blockquotes
- LaTeX equations

For coding questions:
- use properly formatted fenced code blocks
- specify language whenever possible

ANSWER RULES:

- Every question must contain an answer
- Answers must be concise and accurate
- MCQ answers must match one of the provided options
- Subjective answers should be educational but brief


OUTPUT RULES:

- Output must strictly follow the provided JSON schema
- Do not add extra fields
- Do not omit required fields
- Do not return explanations
- Do not wrap responses in markdown code fences
- Do not include conversational text

Always prioritize:
- correctness
- consistency
- readability
- structured output quality
`;

const geminiConfig: GenerateContentConfig = {
  temperature: 0.4,
  responseMimeType: "application/json",
  responseJsonSchema: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
      },
      totalMarks: {
        type: Type.INTEGER,
      },
      sections: {
        type: Type.ARRAY,

        items: {
          type: Type.OBJECT,

          properties: {
            title: {
              type: Type.STRING,
            },

            instruction: {
              type: Type.STRING,
            },

            questions: {
              type: Type.ARRAY,

              items: {
                type: Type.OBJECT,

                properties: {
                  question: {
                    type: Type.STRING,
                  },

                  difficulty: {
                    type: Type.STRING,
                  },

                  marks: {
                    type: Type.INTEGER,
                  },

                  type: {
                    type: Type.STRING,
                  },

                  options: {
                    anyOf: [
                      {
                        type: Type.NULL,
                      },

                      {
                        type: Type.ARRAY,

                        items: {
                          type: Type.STRING,
                        },
                      },
                    ],
                  },

                  answer: {
                    type: Type.STRING,
                  },
                },

                required: [
                  "question",
                  "difficulty",
                  "marks",
                  "type",
                  "options",
                  "answer",
                ],
              },
            },
          },

          required: ["title", "instruction", "questions"],
        },
      },
    },

    required: ["title", "totalMarks", "sections"],
  },
  systemInstruction: SYSTEM_INSTRUCTION,
};

export { ai, geminiModels, geminiConfig };
