"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe, GlobeLock, Trash2 } from "lucide-react";

interface Props {
  courseId: string;
  status: "draft" | "published";
}

export function CourseActions({ courseId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"publish" | "unpublish" | "delete" | null>(null);

  const patch = async (body: object, action: "publish" | "unpublish") => {
    setLoading(action);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this course and all its content? This cannot be undone.")) return;
    setLoading("delete");
    await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    setLoading(null);
    router.push("/admin/queue");
  };

  return (
    <div className="flex items-center gap-2">
      {status === "draft" ? (
        <Button size="sm" onClick={() => patch({ status: "published" }, "publish")} loading={loading === "publish"}>
          <Globe className="w-3.5 h-3.5" />
          Publish
        </Button>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => patch({ status: "draft" }, "unpublish")} loading={loading === "unpublish"}>
          <GlobeLock className="w-3.5 h-3.5" />
          Unpublish
        </Button>
      )}
      <Button size="sm" variant="danger" onClick={handleDelete} loading={loading === "delete"}>
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </Button>
    </div>
  );
}
