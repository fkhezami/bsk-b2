"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function PublishButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setLoading(true);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" onClick={handlePublish} loading={loading}>
      <Globe className="w-3.5 h-3.5" />
      {loading ? "Publishing..." : "Publish"}
    </Button>
  );
}
