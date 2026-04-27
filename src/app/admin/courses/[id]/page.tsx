import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FlashcardDeck } from "@/components/flashcard/FlashcardDeck";
import { PublishButton } from "./PublishButton";
import { DeleteFlashcardButton } from "./DeleteFlashcardButton";
import { DeleteGrammarButton } from "./DeleteGrammarButton";
import { ArrowLeft, BookOpen, Layers, Trash2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [courseRes, flashcardsRes, grammarRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).single(),
    supabase.from("flashcards").select("*").eq("course_id", id).order("display_order"),
    supabase.from("grammar_notes").select("*").eq("course_id", id).order("display_order"),
  ]);

  if (courseRes.error || !courseRes.data) notFound();

  const course = courseRes.data;
  const flashcards = flashcardsRes.data ?? [];
  const grammarNotes = grammarRes.data ?? [];

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/admin/queue"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to queue
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {course.title ?? formatDate(course.date)}
            </h1>
            <Badge variant={course.status === "published" ? "published" : "draft"}>
              {course.status}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm">
            {flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""} &middot; {grammarNotes.length} grammar note{grammarNotes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {course.status === "draft" && (
          <PublishButton courseId={course.id} />
        )}
      </div>

      {/* Vocabulary preview */}
      {flashcards.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
            <Layers className="w-5 h-5 text-slate-500" />
            Vocabulary
          </h2>
          <FlashcardDeck flashcards={flashcards} />

          <div className="mt-6 space-y-2">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">All cards</p>
            {flashcards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 bg-white rounded-lg border border-slate-100 px-4 py-2.5 text-sm">
                <span className="font-medium text-slate-800 w-36 shrink-0 truncate">{card.word_de}</span>
                <span className="text-slate-500 flex-1 truncate">{card.translation_en} / {card.translation_uk}</span>
                <DeleteFlashcardButton id={card.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grammar preview */}
      {grammarNotes.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
            <BookOpen className="w-5 h-5 text-slate-500" />
            Grammar
          </h2>
          <div className="space-y-4">
            {grammarNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">{note.title}</h3>
                  <DeleteGrammarButton id={note.id} />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{note.explanation}</p>
                {note.structure && (
                  <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Structure</p>
                    <p className="font-mono text-sm text-slate-800">{note.structure}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {flashcards.length === 0 && grammarNotes.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p>No content yet. Go back and click &quot;Generate&quot; to process the uploaded images.</p>
        </div>
      )}
    </div>
  );
}
