import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProcessButton } from "./ProcessButton";
import Link from "next/link";
import { ChevronRight, ImageIcon, UploadCloud } from "lucide-react";

export const revalidate = 0;

export default async function QueuePage() {
  const supabase = createAdminClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, date, title, status, created_at")
    .order("date", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  const { data: imageCounts } = courseIds.length
    ? await supabase.from("images").select("course_id, processed, type").in("course_id", courseIds)
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

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-brand-950">Upload Queue</h1>
          </div>
          <p className="text-brand-400 text-sm ml-12">
            Process images with AI, then review and publish courses.
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-xl px-4 py-2 hover:bg-brand-100 transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          New upload
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-20 text-brand-300">
          <UploadCloud className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No uploads yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const counts = countMap[course.id] ?? { total: 0, unprocessed: 0, failed: 0 };
            const allDone = counts.unprocessed === 0 && counts.failed === 0;
            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-brand-100 p-5 flex items-center gap-4 hover:border-brand-200 transition-colors"
              >
                {/* Status stripe */}
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{
                    background: counts.failed > 0 ? "#ef4444"
                      : counts.unprocessed > 0 ? "#f59e0b"
                      : course.status === "published" ? "#10b981"
                      : "#c7d2fe",
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-brand-950 truncate">
                      {course.title ?? formatDate(course.date)}
                    </p>
                    <Badge variant={course.status === "published" ? "published" : "draft"}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-brand-400">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {counts.total} image{counts.total !== 1 ? "s" : ""}
                    </span>
                    {counts.unprocessed > 0 && (
                      <span className="text-gold-600 font-medium">
                        {counts.unprocessed} pending
                      </span>
                    )}
                    {counts.failed > 0 && (
                      <span className="text-red-500 font-medium">
                        {counts.failed} failed
                      </span>
                    )}
                    {allDone && counts.total > 0 && (
                      <span className="text-emerald-600 font-medium">All processed</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {counts.unprocessed > 0 && <ProcessButton courseId={course.id} />}
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-800 border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-50 transition-colors"
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
