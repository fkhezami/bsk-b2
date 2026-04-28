import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 60;

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, date, title, created_at")
    .eq("status", "published")
    .order("date", { ascending: false });

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />

      <div className="max-w-3xl mx-auto px-4 py-12 w-full flex-1">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-950">Course Library</h1>
              <p className="text-brand-400 text-sm">Select a lesson to study</p>
            </div>
          </div>
          <div className="h-1 w-16 rounded-full bg-gold-500 mt-4" />
        </div>

        {!courses || courses.length === 0 ? (
          <div className="text-center py-20 text-brand-300">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No lessons published yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {courses.map((course, i) => (
              <li key={course.id}>
                <Link
                  href={`/courses/${course.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-brand-100 px-5 py-4 hover:shadow-md hover:border-brand-300 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 font-bold text-brand-600 text-sm group-hover:bg-brand-700 group-hover:text-white group-hover:border-brand-700 transition-all">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-950 truncate">
                      {course.title ?? formatDate(course.date)}
                    </p>
                    {course.title && (
                      <p className="text-sm text-brand-400">{formatDate(course.date)}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-300 group-hover:text-brand-600 transition-colors shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Footer />
    </main>
  );
}
