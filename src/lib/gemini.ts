import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiResponse } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a German B2 language teacher assistant. Analyze this image of classroom notes.
Determine if it contains vocabulary (word lists, Wortschatz) or grammar content (rules, structures, conjugations).

Return ONLY valid JSON — no markdown, no explanation.

If vocabulary, return:
{
  "type": "vocab",
  "items": [
    { "word_de": "das Wort", "translation_en": "the word", "translation_uk": "слово", "example_de": "Das Wort ist wichtig." }
  ]
}

If grammar, return:
{
  "type": "grammar",
  "title": "Short title of the grammar topic",
  "explanation": "Clear explanation in English of the grammar rule or structure.",
  "structure": "The pattern or formula, e.g. haben/sein + Partizip II"
}

Rules:
- For vocabulary, provide accurate English and Ukrainian translations for every item.
- For grammar, explanation should be in English, clear and concise for B2 level.
- If the image is unclear or unrelated, return { "type": "vocab", "items": [] }.`;

export async function analyzeImage(imageBase64: string, mimeType: string): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    SYSTEM_PROMPT,
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  return JSON.parse(cleaned) as GeminiResponse;
}
