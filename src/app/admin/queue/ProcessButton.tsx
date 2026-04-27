"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ProcessButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    await fetch("/api/admin/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    setLoading(false);
    setDone(true);
    router.refresh();
  };

  if (done) return null;

  return (
    <Button size="sm" onClick={handleProcess} loading={loading}>
      <Sparkles className="w-3.5 h-3.5" />
      {loading ? "Processing..." : "Generate"}
    </Button>
  );
}
