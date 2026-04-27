"use client";

import { useState, useCallback } from "react";
import { Upload, CheckCircle, XCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, todayISO } from "@/lib/utils";

interface UploadResult {
  name: string;
  status: "success" | "error";
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [done, setDone] = useState(false);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const images = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name + f.lastModified));
      return [...prev, ...images.filter((f) => !names.has(f.name + f.lastModified))];
    });
  }, []);

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("date", todayISO());

    // Sort by lastModified before uploading so the server preserves order
    const sorted = [...files].sort((a, b) => a.lastModified - b.lastModified);
    for (const file of sorted) {
      formData.append("files", file);
      formData.append(
        `captured_at_${file.name}`,
        new Date(file.lastModified).toISOString()
      );
    }

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    const uploaded: string[] = data.uploaded ?? [];
    const failed: string[] = data.failed ?? [];

    setResults([
      ...uploaded.map((name: string) => ({ name, status: "success" as const })),
      ...failed.map((name: string) => ({ name, status: "error" as const })),
    ]);

    setUploading(false);
    setDone(true);
  };

  if (done) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Upload complete</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your images have been submitted. The teacher will review and publish the lesson.
          </p>
          <ul className="text-left space-y-2 mb-6">
            {results.map((r) => (
              <li key={r.name} className="flex items-center gap-2 text-sm">
                {r.status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span className="truncate text-slate-700">{r.name}</span>
              </li>
            ))}
          </ul>
          <Button onClick={() => { setFiles([]); setResults([]); setDone(false); }} variant="secondary">
            Upload more
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Upload class notes</h1>
        <p className="text-slate-500 text-sm mb-6">
          Select or drag your photos of today&apos;s notes. Images will be sorted by their timestamp automatically.
        </p>

        {/* Drop zone */}
        <label
          htmlFor="file-input"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors",
            dragging ? "border-slate-600 bg-slate-50" : "border-slate-300 hover:border-slate-400"
          )}
        >
          <Upload className="w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-600 font-medium">Drop images here or click to select</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG, HEIC, WebP</p>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>

        {/* File list */}
        {files.length > 0 && (
          <ul className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1">
            {files
              .slice()
              .sort((a, b) => a.lastModified - b.lastModified)
              .map((file, idx) => (
                <li key={file.name + file.lastModified} className="flex items-center gap-3 text-sm">
                  <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="flex-1 truncate text-slate-700">{file.name}</span>
                  <span className="text-slate-400 text-xs shrink-0">
                    {new Date(file.lastModified).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </li>
              ))}
          </ul>
        )}

        <Button
          className="w-full mt-6"
          size="lg"
          onClick={handleUpload}
          disabled={files.length === 0}
          loading={uploading}
        >
          {uploading ? "Uploading..." : `Upload ${files.length || ""} image${files.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </main>
  );
}
