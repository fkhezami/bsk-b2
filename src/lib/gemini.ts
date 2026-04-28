import type { GeminiResponse } from "@/types";

// ── Prompts ──────────────────────────────────────────────────────────────────

const EXTRACT_PROMPT = `You are a German B2 classroom assistant. Transcribe this whiteboard or notebook photo.

OUTPUT RULE — CRITICAL: your entire response must be a single valid JSON object. No prose, no markdown, no steps, no explanation — JSON only. Anything outside the JSON object will break the parser.

---

━━ STEP 1: READ THE IMAGE ━━
Before writing anything, observe:
• Which text colors are used? (red, blue, green, orange, purple, teal, black…)
• Are there headings, numbered lists, bullet lists, underlined terms?
• What is vocabulary (a word + its translation) vs grammar (a rule, structure, formula, conjugation)?

VOCABULARY = a single German word or short phrase (≤5 words) paired with a translation. Each item is independent.
GRAMMAR = rules, explanations, conjugation tables, formulas, structured examples — anything that explains HOW the language works.
NEVER put a rule, formula, or example sentence into a vocabulary item.

━━ STEP 2: OUTPUT JSON ━━
Return ONLY valid JSON — no markdown, no explanation.

Grammar explanation lines MUST use this format:
  [type|color] text copied exactly from the image

  type values:
    title    → section heading or topic (colored/underlined text in image)
    bullet   → regular bullet point
    numbered → item from a numbered list
    example  → a full example sentence
    special  → exception, warning, or edge case

  color values (pick the ONE closest to the text color in the image):
    red · blue · green · orange · purple · teal · pink · black

  If no specific color is visible: [bullet] text  (omit the color)

━━ JSON SCHEMAS ━━

Vocabulary only:
{
  "type": "vocab",
  "items": [{ "word_de": "das Wort", "translation_en": "the word", "translation_uk": "слово", "example_de": "Das Wort ist wichtig." }]
}

Grammar only:
{
  "type": "grammar",
  "title": "Colored/underlined heading from image",
  "explanation": "[title|red] Konjunktiv II\n[bullet|blue] Wird für irreale Bedingungen verwendet\n[numbered|black] ich würde gehen\n[example|green] Ich würde gehen, wenn ich Zeit hätte.\n[special|orange] Ausnahme: haben → hätte",
  "structure": "Formula from image, e.g. würde + Infinitiv — or null"
}

Both:
{
  "type": "mixed",
  "items": [...],
  "grammar": { "title": "...", "explanation": "...", "structure": "..." }
}

Additional rules:
- Transcribe ONLY what is visible. Do not add or infer anything.
- VOCABULARY word_de: for nouns ALWAYS prefix with the definite article (der/die/das), e.g. "das Wort", "die Freiheit", "der Mann". For verbs write the infinitive. For other words write as-is.
- VOCABULARY: provide accurate translation_en (English) and translation_uk (Ukrainian).
- All grammar text must be in German.
- Choose "mixed" if the image has both types.
- If unclear or unrelated: { "type": "vocab", "items": [] }`;

const ENRICH_PROMPT = (raw: string) =>
  `You are a German B2 language expert and fact-checker.

The following JSON was extracted from a classroom photo.

━━ TASK 1 — Fix OCR errors only ━━
- Correct garbled or truncated German words, rules, and example sentences.
- Do NOT rephrase or change meaning.
- Fix vocabulary translations (translation_en, translation_uk) if wrong.
- For vocabulary nouns: if word_de is missing the definite article, add it (der/die/das). E.g. "Wort" → "das Wort".

━━ TASK 2 — Add supplementary details in German ━━
- After the existing lines, append additional grammar rules, exceptions, or examples important for B2.
- Every added line MUST use [extra|indigo] prefix.
- All [extra] content must be in German. Never write English in grammar fields.
- Do not add [extra] lines to vocabulary items.

━━ FORMAT RULES ━━
- explanation is a newline-separated string. Each line: [type|color] text
- Preserve all existing [type|color] tags exactly — do NOT change them.
- Never convert explanation to a JSON array.
- All grammar fields (title, explanation, structure) must be in German.
- Keep the same top-level JSON structure.

Return ONLY the corrected JSON — no markdown, no extra text.

INPUT:
${raw}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function groqText(model: string, prompt: string) {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
}

/** Strip markdown fences and extract the first complete {...} or [...] block. */
function cleanJSON(raw: string): string {
  // Strip markdown code fences anywhere in the string
  let s = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Find the first { or [
  const start = s.search(/[{[]/);
  if (start === -1) return s;
  s = s.slice(start);

  // Walk to find the matching closing bracket, ignoring chars inside strings.
  // This cuts off any prose the model appended after the JSON.
  s = extractOutermostBlock(s);

  // Fix: explanation array whose elements start with [tag] prefixes (not valid JSON).
  // e.g.  "explanation": [ [bullet] "text", [example] "text2" ]
  // →     "explanation": "[bullet] text\n[example] text2"
  s = repairTaggedArray(s);

  // Fix fields where the AI returned an unquoted string starting with [type|color].
  s = quoteUnquotedStringFields(s);

  // Replace unescaped control characters inside JSON string values.
  s = sanitiseControlChars(s);

  // If it looks truncated, attempt to close open brackets
  const opens  = (s.match(/[{[]/g) ?? []).length;
  const closes = (s.match(/[}\]]/g) ?? []).length;
  if (opens > closes) {
    s = s.replace(/,\s*$/, "");
    for (let i = 0; i < opens - closes; i++) s += "}";
  }

  return s;
}

/**
 * Fix explanation arrays where each element has an unquoted [tag] prefix:
 *   "explanation": [ [bullet] "text", [example] "text2" ]
 * →  "explanation": "[bullet] text\n[example] text2"
 */
function repairTaggedArray(s: string): string {
  return s.replace(
    /"explanation"\s*:\s*\[\s*([\s\S]*?)\s*\](?=\s*[,}])/g,
    (fullMatch, arrayContent) => {
      // Only repair if the array content contains [tag]-style elements
      if (!/\[\s*\w/.test(arrayContent)) return fullMatch;

      const lines: string[] = [];
      // Match patterns like: [tag|color] "text" or [tag] "text" or just "text"
      const itemRe = /(?:\[\s*([^\]]+)\]\s*)?"((?:[^"\\]|\\.)*)"/g;
      let m: RegExpExecArray | null;
      while ((m = itemRe.exec(arrayContent)) !== null) {
        const tag  = m[1] ? `[${m[1].trim()}] ` : "";
        const text = m[2].replace(/\\n/g, "\n");
        lines.push(tag + text);
      }

      if (lines.length === 0) return fullMatch;
      const joined = lines.join("\\n").replace(/"/g, '\\"');
      return `"explanation": "${joined}"`;
    }
  );
}

/**
 * Given a string that starts with { or [, walk char-by-char tracking depth
 * and return only the outermost balanced block, discarding anything after it.
 */
function extractOutermostBlock(s: string): string {
  const open  = s[0];
  const close = open === "{" ? "}" : "]";
  let depth    = 0;
  let inString = false;
  let escaped  = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escaped)  { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString)  continue;
    if (ch === open)  depth++;
    if (ch === close) { depth--; if (depth === 0) return s.slice(0, i + 1); }
  }
  return s; // not fully closed — return as-is for the truncation repair below
}

/**
 * Detect string fields whose value the AI left unquoted, starting with `[`.
 * e.g.  "explanation": [bullet|blue] text\n[rule|red] more
 * becomes  "explanation": "[bullet|blue] text\n[rule|red] more"
 */
function quoteUnquotedStringFields(s: string): string {
  // Match: "key": [<letter or |> — meaning the value starts with [ but is NOT a proper JSON array
  // (a proper JSON array would have [ followed by " { [ or whitespace+"])
  return s.replace(
    /("(?:explanation|title|structure)"\s*:\s*)(\[(?!["\s]*[\[{"]))/gi,
    (_, prefix) => {
      // Find where this value ends: at the next unquoted , followed by a key, or a closing }
      const afterPrefix = s.indexOf(prefix) + prefix.length;
      let depth = 0;
      let i = afterPrefix;
      let valueEnd = s.length;

      while (i < s.length) {
        const ch = s[i];
        if (ch === "{" || ch === "[") depth++;
        else if (ch === "}" || ch === "]") {
          if (depth === 0) { valueEnd = i; break; }
          depth--;
        } else if (ch === "," && depth === 0) {
          valueEnd = i;
          break;
        }
        i++;
      }

      const raw = s.slice(afterPrefix, valueEnd).trim();
      const escaped = raw
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, "\\n");
      return `${prefix}"${escaped}"`;
    }
  );
}

/**
 * Walk through a JSON-like string and replace raw control characters
 * (newline, carriage return, tab, and other ASCII < 0x20) that appear
 * inside string literals with their proper JSON escape sequences.
 */
function sanitiseControlChars(s: string): string {
  let inString = false;
  let escaped  = false;
  let out      = "";

  for (let i = 0; i < s.length; i++) {
    const ch   = s[i];
    const code = ch.charCodeAt(0);

    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      out += ch;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }

    if (inString && code < 0x20) {
      // Replace raw control chars with JSON escape sequences
      if (ch === "\n")      out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else out += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }

    out += ch;
  }

  return out;
}

/** If the explanation field ended up as a JSON array, flatten it to a string. */
function normaliseExplanation(obj: Record<string, unknown>): void {
  const fix = (explanation: unknown): string => {
    if (typeof explanation === "string") return explanation;
    if (Array.isArray(explanation)) return explanation.join("\n");
    return String(explanation ?? "");
  };

  if (obj.explanation !== undefined) obj.explanation = fix(obj.explanation);
  if (obj.grammar && typeof obj.grammar === "object") {
    const g = obj.grammar as Record<string, unknown>;
    if (g.explanation !== undefined) g.explanation = fix(g.explanation);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function analyzeImage(imageBase64: string, mimeType: string): Promise<GeminiResponse> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACT_PROMPT },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw: string = data.choices[0].message.content.trim();
  console.log("[groq] raw:", raw);

  const cleaned = cleanJSON(raw);
  console.log("[groq] cleaned:", cleaned);

  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  normaliseExplanation(parsed);
  return parsed as unknown as GeminiResponse;
}

/**
 * Second-pass: send the extracted JSON to a text model for fact-checking,
 * truncation repair, and enrichment. Falls back to the original on any error.
 */
export async function enrichContent(result: GeminiResponse): Promise<GeminiResponse> {
  // Skip enrichment for empty vocab responses
  if (result.type === "vocab" && result.items.length === 0) return result;

  try {
    const input = JSON.stringify(result, null, 2);
    const res = await groqText("llama-3.3-70b-versatile", ENRICH_PROMPT(input));

    if (!res.ok) {
      console.warn("[enrich] Groq error", res.status, "— using original");
      return result;
    }

    const data = await res.json();
    const raw: string = data.choices[0].message.content.trim();
    console.log("[enrich] raw:", raw);

    const cleaned = cleanJSON(raw);
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    normaliseExplanation(parsed);

    // Sanity-check: enriched result must have the same type
    if ((parsed as unknown as GeminiResponse).type !== result.type) {
      console.warn("[enrich] type mismatch — using original");
      return result;
    }

    console.log("[enrich] enrichment applied");
    return parsed as unknown as GeminiResponse;
  } catch (err) {
    console.error("[enrich] failed, using original:", err);
    return result;
  }
}
