import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, ChevronRight, GraduationCap, Layers } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 60;

function parseDateParts(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return {
    day:   d.toLocaleDateString("en-GB", { weekday: "short" }),
    num:   d.getDate(),
    month: d.toLocaleDateString("en-GB", { month: "short" }),
    full:  d.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  };
}

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, date, title")
    .eq("status", "published")
    .order("date", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  const [{ data: grammarNotes }, { data: flashcards }] = await Promise.all(
    courseIds.length
      ? [
          supabase
            .from("grammar_notes")
            .select("course_id, title, structure")
            .in("course_id", courseIds)
            .order("display_order", { ascending: true }),
          supabase
            .from("flashcards")
            .select("course_id")
            .in("course_id", courseIds),
        ]
      : [{ data: [] }, { data: [] }]
  );

  const grammarByCourse: Record<string, { title: string; structure: string | null }[]> = {};
  for (const note of grammarNotes ?? []) {
    if (!grammarByCourse[note.course_id]) grammarByCourse[note.course_id] = [];
    grammarByCourse[note.course_id].push({ title: note.title, structure: note.structure });
  }

  const vocabCountByCourse: Record<string, number> = {};
  for (const fc of flashcards ?? []) {
    vocabCountByCourse[fc.course_id] = (vocabCountByCourse[fc.course_id] ?? 0) + 1;
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />

      <div className="max-w-3xl mx-auto px-4 py-12 w-full flex-1">

        {/* Page header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-brand-950">Course Library</h1>
            </div>
            <div className="h-1 w-12 rounded-full bg-gold-500 mt-3 ml-12" />
          </div>
          {courses && courses.length > 0 && (
            <p className="text-xs text-brand-400 pb-1">{courses.length} sessions</p>
          )}
        </div>

        {!courses || courses.length === 0 ? (
          <div className="text-center py-20 text-brand-300">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No lessons published yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => {
              const topics = grammarByCourse[course.id] ?? [];
              const vocabCount = vocabCountByCourse[course.id] ?? 0;
              const date = parseDateParts(course.date);

              return (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex gap-3 sm:gap-4 group"
                  >
                    {/* Date badge */}
                    <div className="flex flex-col items-center justify-start shrink-0 w-12 pt-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 leading-none">{date.day}</span>
                      <span className="text-2xl font-black text-brand-700 leading-tight group-hover:text-brand-900 transition-colors">{date.num}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 leading-none">{date.month}</span>
                    </div>

                    {/* Card */}
                    <div className="relative flex-1 min-w-0 bg-white rounded-2xl border border-brand-100 group-hover:border-brand-300 group-hover:shadow-md transition-all overflow-hidden">

                      <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4 text-brand-200 group-hover:text-brand-500 transition-colors" />

                      {/* Header */}
                      {course.title && (
                        <div className="px-4 pt-3 pb-2 pr-10">
                          <p className="font-semibold text-brand-950 leading-snug">{course.title}</p>
                        </div>
                      )}

                      {(topics.length > 0 || vocabCount > 0) && (
                        <div className={`px-4 pb-3 space-y-2.5 ${course.title ? "border-t border-brand-50 pt-2.5" : "pt-3"}`}>

                          {/* Grammar chips */}
                          {topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {topics.map((t) => (
                                <div
                                  key={t.title}
                                  className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1"
                                >
                                  <p className="text-xs font-semibold text-indigo-800 leading-tight">{t.title}</p>
                                  {t.structure && (
                                    <p className="text-[10px] font-mono text-indigo-400 mt-0.5 leading-tight">{t.structure}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Vocab count */}
                          {vocabCount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-brand-400">
                              <BookOpen className="w-3 h-3" />
                              {vocabCount} vocabulary word{vocabCount !== 1 ? "s" : ""}
                              {topics.length > 0 && (
                                <>
                                  <span className="mx-1 text-brand-200">·</span>
                                  <Layers className="w-3 h-3" />
                                  {topics.length} grammar topic{topics.length !== 1 ? "s" : ""}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Footer />
    </main>
  );
}
