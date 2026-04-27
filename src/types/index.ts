export type CourseStatus = "draft" | "published";
export type ContentType = "vocab" | "grammar" | "unknown";

export interface Course {
  id: string;
  date: string;
  title: string | null;
  status: CourseStatus;
  created_at: string;
}

export interface CourseImage {
  id: string;
  course_id: string;
  storage_path: string;
  captured_at: string;
  processed: boolean;
  type: ContentType;
}

export interface Flashcard {
  id: string;
  course_id: string;
  image_id: string | null;
  word_de: string;
  translation_en: string;
  translation_uk: string;
  example_de: string | null;
  display_order: number;
}

export interface GrammarNote {
  id: string;
  course_id: string;
  image_id: string | null;
  title: string;
  explanation: string;
  structure: string | null;
  display_order: number;
}

export interface GeminiVocabItem {
  word_de: string;
  translation_en: string;
  translation_uk: string;
  example_de?: string;
}

export interface GeminiVocabResponse {
  type: "vocab";
  items: GeminiVocabItem[];
}

export interface GeminiGrammarResponse {
  type: "grammar";
  title: string;
  explanation: string;
  structure?: string;
}

export type GeminiResponse = GeminiVocabResponse | GeminiGrammarResponse;
