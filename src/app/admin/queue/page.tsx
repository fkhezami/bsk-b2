import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProcessButton } from "./ProcessButton";
import Link from "next/link";
import { ChevronRight, ImageIcon } from "lucide-react";

export const revalidate = 0;

export default async function QueuePage() {
  const supabase = createAdminClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, date, title, status, created_at")
    .order("date", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  // Count images per course
  const { data: imageCounts } = courseIds.length
    ? await supabase
        .from("images")
        .select("course_id, processed, type")
        .in("course_id", courseIds)
    : { data: [] };

  const countMap: Record<string, { total: number; unprocessed: number; failed: number }> = {};
  for (const row of imageCounts ?? []) {
    if (!countMap[row.course_id]) countMap[row.course_id] = { total: 0, unprocessed: 0, failed: 0 };
    countMap[row.course_id].total += 1;
    if (!row.processed) countMap[row.course_id].unprocessed += 1;
    if (row.processed && row.type === "unknown") countMap[row.course_id].failed += 1;
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Upload Queue</h1>
      <p className="text-slate-500 text-sm mb-8">
        Process images with Gemini, then review and publish courses.
      </p>

      {!courses || courses.length === 0 ? (
        <p className="text-slate-400 text-sm">No uploads yet.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const counts = countMap[course.id] ?? { total: 0, unprocessed: 0, failed: 0 };
            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900">
                      {course.title ?? formatDate(course.date)}
                    </p>
                    <Badge variant={course.status === "published" ? "published" : "draft"}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {counts.total} image{counts.total !== 1 ? "s" : ""}
                    </span>
                    {counts.unprocessed > 0 && (
                      <span className="text-amber-600 font-medium">
                        {counts.unprocessed} unprocessed
                      </span>
                    )}
                    {counts.failed > 0 && (
                      <span className="text-red-500 font-medium">
                        {counts.failed} failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {counts.unprocessed > 0 && (
                    <ProcessButton courseId={course.id} />
                  )}
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
                  >
                    Review
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
