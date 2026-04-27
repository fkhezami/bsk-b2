import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { FlashcardDeck } from "@/components/flashcard/FlashcardDeck";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [courseRes, flashcardsRes, grammarRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).eq("status", "published").single(),
    supabase.from("flashcards").select("*").eq("course_id", id).order("display_order"),
    supabase.from("grammar_notes").select("*").eq("course_id", id).order("display_order"),
  ]);

  if (courseRes.error || !courseRes.data) notFound();

  const course = courseRes.data;
  const flashcards = flashcardsRes.data ?? [];
  const grammarNotes = grammarRes.data ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All lessons
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {course.title ?? formatDate(course.date)}
        </h1>
        {course.title && (
          <p className="text-slate-500 text-sm mb-8">{formatDate(course.date)}</p>
        )}

        {/* Vocabulary section */}
        {flashcards.length > 0 && (
          <section className="mb-12">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-6">
              <Layers className="w-5 h-5 text-slate-500" />
              Vocabulary ({flashcards.length} words)
            </h2>
            <FlashcardDeck flashcards={flashcards} />
          </section>
        )}

        {/* Grammar section */}
        {grammarNotes.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-6">
              <BookOpen className="w-5 h-5 text-slate-500" />
              Grammar
            </h2>
            <div className="space-y-4">
              {grammarNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-xl border border-slate-200 p-6"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">{note.title}</h3>
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
          <p className="text-slate-400 text-sm text-center py-12">This lesson has no content yet.</p>
        )}
      </div>
    </main>
  );
}
