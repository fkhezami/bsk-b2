"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";

export function ReorganizeButton({ courseId, noteCount }: { courseId: string; noteCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (noteCount < 2) return null;

  async function handle() {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/admin/courses/${courseId}/reorganize`, { method: "POST" });
    const data = await res.json();
    setResult(data.ok ? `Merged → "${data.title}"` : (data.error ?? "Failed"));
    setLoading(false);
    router.refresh();
  }

  if (result) {
    return <span className="text-xs text-indigo-600 font-medium">{result}</span>;
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-indigo-600 border border-brand-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <Layers className="w-3.5 h-3.5" />
      {loading ? "Reorganizing…" : `Merge & sort ${noteCount} notes`}
    </button>
  );
}
