import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Extracts a YYYY-MM-DD date from a filename, falling back to lastModified.
 *
 * Handles:
 *  - WhatsApp:      IMG-20260427-WA0001.jpg
 *  - Android cam:   IMG_20260427_143022.jpg  /  20260427_143022.jpg
 *  - Screenshots:   Screenshot_20260427-143022.jpg
 *  - ISO in name:   2026-04-27_notes.jpg  /  2026.04.27.jpg
 *  - Any 8-digit run that parses as a valid YYYYMMDD date
 */
export function extractDateFromFile(filename: string, lastModified: number): string {
  const name = filename.replace(/\.[^.]+$/, ""); // strip extension

  // ISO-style: 2026-04-27 or 2026.04.27
  const isoMatch = name.match(/(\d{4})[-.](\d{2})[-.](\d{2})/);
  if (isoMatch) {
    const candidate = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    if (isValidDate(candidate)) return candidate;
  }

  // Compact 8-digit: 20260427 (found anywhere in the name)
  const compact = name.match(/(\d{8})/g) ?? [];
  for (const chunk of compact) {
    const candidate = `${chunk.slice(0, 4)}-${chunk.slice(4, 6)}-${chunk.slice(6, 8)}`;
    if (isValidDate(candidate)) return candidate;
  }

  // Fall back to file.lastModified
  return new Date(lastModified || Date.now()).toISOString().slice(0, 10);
}

function isValidDate(iso: string): boolean {
  const d = new Date(iso);
  return !isNaN(d.getTime()) && d.getFullYear() >= 2000 && d.getFullYear() <= 2100;
}

export type Gender = "m" | "f" | "n";

export interface ArticleInfo {
  definite: string;   // der / die / das
  indefinite: string; // ein / eine / ein
  gender: Gender;
  label: string;      // maskulin / feminin / neutral
  bare: string;       // word without the article
}

/** Parse definite article and gender from a German word like "das Wort" or "die Freiheit". */
export function parseArticle(wordDe: string): ArticleInfo | null {
  const m = wordDe.trim().match(/^(der|die|das)\s+(.+)$/i);
  if (!m) return null;
  const def = m[1].toLowerCase() as "der" | "die" | "das";
  const bare = m[2];
  if (def === "der") return { definite: "der", indefinite: "ein",  gender: "m", label: "maskulin", bare };
  if (def === "die") return { definite: "die", indefinite: "eine", gender: "f", label: "feminin",  bare };
  return           { definite: "das", indefinite: "ein",  gender: "n", label: "neutral",  bare };
}
