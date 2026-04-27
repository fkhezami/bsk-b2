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

  const handleRetry = async () => {
    setLoading(true);
    // Reset failed images to unprocessed
    await fetch(`/api/admin/courses/${courseId}/retry`, { method: "POST" });
    // Then trigger processing again
    await fetch("/api/admin/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" variant="secondary" onClick={handleRetry} loading={loading}>
      <RefreshCw className="w-3.5 h-3.5" />
      {loading ? "Retrying..." : `Retry ${failedCount} failed image${failedCount !== 1 ? "s" : ""}`}
    </Button>
  );
}
