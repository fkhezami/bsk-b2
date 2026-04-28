import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REORGANIZE_PROMPT = (notes: string) =>
  `You are a German B2 language expert. The following grammar notes were extracted from multiple whiteboard photos of the same lesson. They may contain numbered sections marked with circled numbers (① ② ③ ④ ⑤) or related content that belongs together.

TASK:
1. Merge ALL notes into ONE single coherent grammar note.
2. Sort content by section number (① before ② before ③ etc.) where present.
3. CRITICAL: Keep EVERY line. Only remove a line if it is CHARACTER-FOR-CHARACTER identical to another line — never remove lines that are merely similar in meaning.
4. Preserve all [type|color] line tags exactly as they appear.
5. Use [title|black] for main headings and section titles.

OUTPUT FORMAT — return ONLY this JSON, nothing else:
{
  "title": "short title summarising the topic (in German)",
  "explanation": "[title|black] Section heading\\n[bullet|black] bullet point\\n...",
  "structure": null
}

explanation must be a single string with \\n between lines. Never return an array.
All content must be in German.
Include ALL lines from ALL input notes — do not omit anything.

INPUT NOTES:
${notes}`;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  const supabase = createAdminClient();

  const { data: notes } = await supabase
    .from("grammar_notes")
    .select("*")
    .eq("course_id", courseId)
    .order("display_order");

  if (!notes || notes.length === 0) {
    return NextResponse.json({ error: "No grammar notes found" }, { status: 404 });
  }

  if (notes.length === 1) {
    return NextResponse.json({ message: "Only one note — nothing to reorganize" });
  }

  const input = notes.map((n) => ({
    title: n.title,
    explanation: n.explanation,
    structure: n.structure,
  }));

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      messages: [{ role: "user", content: REORGANIZE_PROMPT(JSON.stringify(input, null, 2)) }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Groq error ${res.status}` }, { status: 500 });
  }

  const data = await res.json();
  const raw: string = data.choices[0].message.content.trim();

  // Extract JSON from response
  const start = raw.search(/\{/);
  if (start === -1) {
    return NextResponse.json({ error: "No JSON in response" }, { status: 500 });
  }

  let merged: { title: string; explanation: string; structure: string | null };
  try {
    merged = JSON.parse(raw.slice(start));
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  // Delete all existing grammar notes for this course
  await supabase.from("grammar_notes").delete().eq("course_id", courseId);

  // Insert the single merged note
  await supabase.from("grammar_notes").insert({
    course_id: courseId,
    image_id: null,
    title: merged.title,
    explanation: merged.explanation,
    structure: merged.structure ?? null,
    display_order: 0,
  });

  return NextResponse.json({ ok: true, title: merged.title });
}
