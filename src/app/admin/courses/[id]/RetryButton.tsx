"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  courseId: string;
  failedCount: number;
}

export function RetryButton({ courseId, failedCount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleRetry = async () => {
    setLoading(true);
    setLastError(null);
    await fetch(`/api/admin/courses/${courseId}/retry`, { method: "POST" });
    const res = await fetch("/api/admin/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    const errors = (data.results ?? []).filter((r: { type: string; error?: string }) => r.type === "error");
    if (errors.length > 0) {
      setLastError(errors.map((e: { error?: string }) => e.error).join(" | "));
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" variant="secondary" onClick={handleRetry} loading={loading}>
        <RefreshCw className="w-3.5 h-3.5" />
        {loading ? "Retrying..." : `Retry ${failedCount} failed image${failedCount !== 1 ? "s" : ""}`}
      </Button>
      {lastError && (
        <p className="text-xs text-red-600 max-w-xs">{lastError}</p>
      )}
    </div>
  );
}
