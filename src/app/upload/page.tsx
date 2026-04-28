"use client";

import { useState, useCallback } from "react";
import { Upload, CheckCircle, XCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, extractDateFromFile } from "@/lib/utils";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

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
    if (!images.length) return;
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

    const sorted = [...files].sort((a, b) => a.lastModified - b.lastModified);
    for (const file of sorted) {
      formData.append("files", file);
      formData.append(`last_modified_${file.name}`, String(file.lastModified));
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
      <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-8 max-w-md w-full text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-brand-950 mb-2">Upload complete</h1>
            <p className="text-brand-400 text-sm mb-6">
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
                  <span className="truncate text-brand-700">{r.name}</span>
                </li>
              ))}
            </ul>
            <Button onClick={() => { setFiles([]); setResults([]); setDone(false); }} variant="secondary">
              Upload more
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />

      <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-brand-950 mb-1">Upload class notes</h1>
        <p className="text-brand-400 text-sm mb-6">
          Select or drag your photos of today&apos;s notes. Images are grouped by date automatically.
        </p>

        {/* Drop zone */}
        <label
          htmlFor="file-input"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors",
            dragging ? "border-brand-500 bg-brand-50" : "border-brand-200 hover:border-brand-400 hover:bg-brand-50/50"
          )}
        >
          <>
            <Upload className="w-8 h-8 text-brand-400 mb-3" />
            <p className="text-sm text-brand-700 font-medium">Drop images here or click to select</p>
            <p className="text-xs text-brand-400 mt-1">JPG, PNG, HEIC, WebP · Faces blurred automatically after processing</p>
          </>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
          />
        </label>

        {/* File list grouped by date */}
        {files.length > 0 && (() => {
          const sorted = [...files].sort((a, b) => a.lastModified - b.lastModified);
          const groups = sorted.reduce<Record<string, File[]>>((acc, file) => {
            const iso = extractDateFromFile(file.name, file.lastModified);
            const date = new Date(iso).toLocaleDateString([], { weekday: "short", year: "numeric", month: "short", day: "numeric" });
            (acc[date] ??= []).push(file);
            return acc;
          }, {});

          return (
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
              {Object.entries(groups).map(([date, groupFiles]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                    {date} — lecture
                  </p>
                  <ul className="space-y-1.5 pl-4 border-l-2 border-blue-100">
                    {groupFiles.map((file) => (
                      <li key={file.name + file.lastModified} className="flex items-center gap-3 text-sm">
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="flex-1 truncate text-slate-700">{file.name}</span>
                        <span className="text-slate-400 text-xs shrink-0">
                          {new Date(file.lastModified).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <button
                          onClick={() => removeFile(files.indexOf(file))}
                          className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        })()}

        <Button
          className="w-full mt-6"
          size="lg"
          onClick={handleUpload}
          disabled={files.length === 0}
          loading={uploading}
        >
          {uploading ? "Uploading..." : (() => {
            const dates = new Set(files.map((f) => extractDateFromFile(f.name, f.lastModified)));
            return `Upload ${files.length} image${files.length !== 1 ? "s" : ""} → ${dates.size} lecture${dates.size !== 1 ? "s" : ""}`;
          })()}
        </Button>
      </div>
      </div>
      <Footer />
    </main>
  );
}
