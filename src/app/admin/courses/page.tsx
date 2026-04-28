import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LayoutGrid, BookOpen, Layers } from "lucide-react";
import { DeleteCourseButton } from "./DeleteCourseButton";

export const revalidate = 0;

export default async function AdminCoursesPage() {
  const supabase = createAdminClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, date, title, status, created_at")
    .order("date", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  const [{ data: flashcardCounts }, { data: grammarCounts }] = await Promise.all([
    courseIds.length
      ? supabase.from("flashcards").select("course_id").in("course_id", courseIds)
      : { data: [] },
    courseIds.length
      ? supabase.from("grammar_notes").select("course_id").in("course_id", courseIds)
      : { data: [] },
  ]);

  const vocabMap: Record<string, number> = {};
  const grammarMap: Record<string, number> = {};
  for (const r of flashcardCounts ?? []) vocabMap[r.course_id] = (vocabMap[r.course_id] ?? 0) + 1;
  for (const r of grammarCounts ?? []) grammarMap[r.course_id] = (grammarMap[r.course_id] ?? 0) + 1;

  return (
    <div className="p-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950">All Courses</h1>
          <p className="text-brand-400 text-sm">Review and manage every lecture</p>
        </div>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-20 text-brand-300">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No courses yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const vocab = vocabMap[course.id] ?? 0;
            const grammar = grammarMap[course.id] ?? 0;
            return (
              <div key={course.id} className="flex items-center gap-2 bg-white rounded-xl border border-brand-100 hover:border-brand-300 hover:shadow-sm transition-all group">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-brand-950 truncate">
                        {course.title ?? formatDate(course.date)}
                      </p>
                      <Badge variant={course.status === "published" ? "published" : "draft"}>
                        {course.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-brand-400">
                      {course.title && (
                        <span>{formatDate(course.date)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-400" />
                        {vocab} word{vocab !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-red-400" />
                        {grammar} grammar note{grammar !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="pr-3">
                  <DeleteCourseButton courseId={course.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
