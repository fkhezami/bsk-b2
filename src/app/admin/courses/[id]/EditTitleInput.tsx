"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  courseId: string;
  currentTitle: string | null;
  fallbackDate: string;
}

export function EditTitleInput({ courseId, currentTitle, fallbackDate }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentTitle ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancel = () => {
    setValue(currentTitle ?? "");
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: value.trim() || null }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={fallbackDate}
          className="text-2xl font-bold text-slate-900 border-b-2 border-slate-400 bg-transparent outline-none flex-1 pb-0.5"
        />
        <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
          <Check className="w-5 h-5" />
        </button>
        <button onClick={cancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-2xl font-bold text-slate-900">
        {currentTitle ?? fallbackDate}
      </h1>
      <button
        onClick={startEdit}
        className="text-slate-300 group-hover:text-slate-500 transition-colors"
        title="Edit title"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}
