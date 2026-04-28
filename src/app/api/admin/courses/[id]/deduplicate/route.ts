import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function normalise(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  const supabase = createAdminClient();

  const [{ data: cards }, { data: notes }] = await Promise.all([
    supabase.from("flashcards").select("*").eq("course_id", courseId).order("display_order"),
    supabase.from("grammar_notes").select("*").eq("course_id", courseId).order("display_order"),
  ]);

  let removedCards = 0;
  let removedNotes = 0;
  let mergedNotes = 0;

  // ── Flashcard deduplication ──────────────────────────────────────────────────
  if (cards && cards.length > 0) {
    const groups = new Map<string, typeof cards>();
    for (const card of cards) {
      const key = normalise(card.word_de);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(card);
    }

    for (const group of groups.values()) {
      if (group.length < 2) continue;

      // Score each entry: +2 if has example_de, +1 per char in translations
      const scored = group.map((c) => ({
        card: c,
        score:
          (c.example_de ? 2 : 0) +
          (c.translation_en?.length ?? 0) +
          (c.translation_uk?.length ?? 0),
      }));
      scored.sort((a, b) => b.score - a.score);

      const [best, ...rest] = scored;

      // If best lacks example_de but another has one, copy it over
      const withExample = scored.find((s) => s.card.example_de && s.card.id !== best.card.id);
      if (!best.card.example_de && withExample) {
        await supabase
          .from("flashcards")
          .update({ example_de: withExample.card.example_de })
          .eq("id", best.card.id);
      }

      const idsToDelete = rest.map((s) => s.card.id);
      await supabase.from("flashcards").delete().in("id", idsToDelete);
      removedCards += idsToDelete.length;
    }
  }

  // ── Grammar deduplication ────────────────────────────────────────────────────
  if (notes && notes.length > 0) {
    const groups = new Map<string, typeof notes>();
    for (const note of notes) {
      const key = normalise(note.title);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(note);
    }

    for (const group of groups.values()) {
      if (group.length < 2) continue;

      // Merge unique explanation lines across all duplicates
      const allLines = group.flatMap((n) =>
        (n.explanation ?? "").split("\n").map((l: string) => l.trim()).filter(Boolean)
      );
      const seen = new Set<string>();
      const mergedLines: string[] = [];
      for (const line of allLines) {
        const key = normalise(line);
        if (!seen.has(key)) {
          seen.add(key);
          mergedLines.push(line);
        }
      }
      const mergedExplanation = mergedLines.join("\n");

      // Keep the entry with the longest explanation as the base
      const best = group.reduce((a, b) =>
        (a.explanation?.length ?? 0) >= (b.explanation?.length ?? 0) ? a : b
      );

      // Pick best structure (prefer non-null, longest)
      const bestStructure =
        group
          .map((n) => n.structure)
          .filter(Boolean)
          .sort((a, b) => (b?.length ?? 0) - (a?.length ?? 0))[0] ?? null;

      await supabase
        .from("grammar_notes")
        .update({ explanation: mergedExplanation, structure: bestStructure })
        .eq("id", best.id);

      const idsToDelete = group.filter((n) => n.id !== best.id).map((n) => n.id);
      await supabase.from("grammar_notes").delete().in("id", idsToDelete);
      removedNotes += idsToDelete.length;
      mergedNotes++;
    }
  }

  return NextResponse.json({ removedCards, removedNotes, mergedNotes });
}
