"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteGrammarButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this grammar note?")) return;
    setLoading(true);
    await fetch(`/api/admin/grammar/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
