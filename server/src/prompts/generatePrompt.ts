export interface PromptOptions {
  title: string;
  instructions?: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
}

export const generateAssignmentPrompt = (options: PromptOptions) => {
  return `
Generate an extremely high-quality and academically rigorous assessment based on the requirements below.

CRITICAL FORMATTING & PRESENTATION RULES:
1. Markdown is highly encouraged. You MUST use rich markdown formatting inside the 'question', 'answer', and 'instruction' fields:
   - For all mathematical, scientific, engineering, physics, or quantitative concepts, ALWAYS use standard LaTeX equations (e.g. $E = mc^2$ or $$R = \\frac{\\rho L}{A}$$) to render equations professionally.
   - For key academic terms or phrases, use **bold** or *italics*.
   - Use bullet points, inline code blocks, tables, or blockquotes where appropriate to organize information clearly.
2. For coding or programming topics, you MUST write clean code snippets wrapped in fenced markdown code blocks with the correct language syntax (e.g., \`\`\`python ... \`\`\`).

DIAGRAM/GRAPH-BASED QUESTIONS RULES:
- EVERY "Diagram/Graph-Based Questions" question MUST include a valid, fully formed, and complex Mermaid.js diagram wrapped in a fenced code block with the 'mermaid' language (e.g., \`\`\`mermaid ... \`\`\`) inside the 'question' field.
- MERMAID SYNTAX SAFETY RULES:
  1. ALWAYS wrap node labels in double quotes if they contain any spaces, numbers, parentheses, or special characters (like Ω, μ, +, -, =).
     CORRECT: A["Source (10V)"] --> B["Resistor (2Ω)"]
     INCORRECT: A[Source (10V)] --> B[Resistor (2Ω)] (This causes parser crash!)
  2. Do NOT use nested brackets or parentheses inside labels.
  3. Ensure all arrows and connection lines are standard. Use "-->" or "---", never custom or invalid symbols.
  4. Use standard left-to-right (graph LR) or top-to-bottom (graph TD) layouts.
- Example of a valid, correct circuit diagram:
  \`\`\`mermaid
  graph LR
      A["10V DC Source"] --> B["R1: 2Ω"]
      B --> C["R2: 3Ω"]
      C --> A
  \`\`\`
- Do NOT use plain text character descriptions (like [10V] --- [R1]) or empty placeholders for diagram-based questions. Only render valid fenced code block diagrams.

Title:
${options.title}

Instructions:
${options.instructions || "Answer all questions honestly."}

Question Types Requested:
${options.questionTypes.join(", ")}

Number of Questions:
${options.numberOfQuestions}

Total Marks:
${options.totalMarks}

Question Type Specifications:
- Multiple Choice Questions:
  Must contain exactly 4 options in the 'options' array.
- True/False Questions:
  The 'options' array must be exactly: ["True", "False"].
- Fill in the Blanks:
  The question text must contain a clear blank line "_____" to represent the missing word.
- Numerical Problems:
  Must present a mathematical/quantitative problem using LaTeX equations for any formulas, and provide step-by-step math in the answer field.
- Short Questions & Long Answer Questions:
  Provide clear academic prompts and detailed subjective answers.

Allowed Question Types:
- Multiple Choice Questions
- Short Questions
- Diagram/Graph-Based Questions
- Numerical Problems
- Long Answer Questions
- True/False Questions
- Fill in the Blanks

STRICT JSON OUTPUT FORMAT:
You MUST respond with ONLY valid JSON (no markdown fences, no explanation text) matching this exact schema:

{
  "title": "string",
  "totalMarks": number,
  "sections": [
    {
      "title": "string",
      "instruction": "string",
      "questions": [
        {
          "question": "string (markdown allowed)",
          "difficulty": "EASY" | "MEDIUM" | "HARD",
          "marks": number,
          "type": "<MUST be one of the exact strings below>",
          "options": ["string"] | [],
          "answer": "string (markdown allowed)"
        }
      ]
    }
  ]
}

The "type" field MUST be EXACTLY one of these strings (copy-paste exactly, no variations):
"Multiple Choice Questions"
"Short Questions"
"Diagram/Graph-Based Questions"
"Numerical Problems"
"Long Answer Questions"
"True/False Questions"
"Fill in the Blanks"
`;
};
