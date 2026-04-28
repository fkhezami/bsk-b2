"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function DeduplicateButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ removedCards: number; removedNotes: number; mergedNotes: number } | null>(null);

  async function handleDeduplicate() {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/admin/courses/${courseId}/deduplicate`, { method: "POST" });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    router.refresh();
  }

  if (result) {
    const total = result.removedCards + result.removedNotes;
    return (
      <span className="text-xs text-green-600 font-medium">
        {total === 0
          ? "Already clean"
          : `Removed ${result.removedCards} duplicate word${result.removedCards !== 1 ? "s" : ""}, merged ${result.mergedNotes} grammar note${result.mergedNotes !== 1 ? "s" : ""}`}
      </span>
    );
  }

  return (
    <button
      onClick={handleDeduplicate}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <Sparkles className="w-3.5 h-3.5" />
      {loading ? "Cleaning…" : "Deduplicate"}
    </button>
  );
}
