"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/courses/${courseId}/delete`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.preventDefault()}>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-brand-400 hover:text-brand-700 px-2 py-1 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Confirm"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true); }}
      className="p-1.5 rounded-lg text-brand-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
      title="Delete course"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
