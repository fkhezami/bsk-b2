import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { FlashcardDeck } from "@/components/flashcard/FlashcardDeck";
import { GrammarLines } from "@/components/grammar/GrammarLines";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

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
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />

      <div className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All lessons
        </Link>

        <h1 className="text-2xl font-bold text-brand-950 mb-1">
          {course.title ?? formatDate(course.date)}
        </h1>
        {course.title && (
          <p className="text-brand-400 text-sm mb-2">{formatDate(course.date)}</p>
        )}
        <div className="h-1 w-12 rounded-full bg-gold-500 mb-10" />

        {/* Vocabulary */}
        {flashcards.length > 0 && (
          <section className="mb-12">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-700 mb-6">
              <Layers className="w-5 h-5 text-blue-400" />
              Vocabulary
              <span className="ml-1 text-sm font-normal text-blue-400">({flashcards.length} words)</span>
            </h2>
            <FlashcardDeck flashcards={flashcards} />
          </section>
        )}

        {/* Grammar */}
        {grammarNotes.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600 mb-6">
              <BookOpen className="w-5 h-5 text-red-400" />
              Grammar
            </h2>
            <div className="space-y-4">
              {grammarNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl border border-red-100 p-5 shadow-sm">
                  <h3 className="font-bold text-red-700 text-base mb-3">{note.title}</h3>
                  <GrammarLines explanation={note.explanation} />
                  {note.structure && (
                    <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
                      <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">Structure</p>
                      <p className="font-mono text-sm text-blue-800">{note.structure}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {flashcards.length === 0 && grammarNotes.length === 0 && (
          <p className="text-brand-300 text-sm text-center py-12">This lesson has no content yet.</p>
        )}
      </div>

      <Footer />
    </main>
  );
}
