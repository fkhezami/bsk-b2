"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onSave: (val: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
}

export function InlineEdit({ value, onSave, multiline = false, placeholder = "—", className, displayClassName }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  function start() {
    setDraft(value);
    setEditing(true);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  async function save() {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!multiline && e.key === "Enter") { e.preventDefault(); save(); }
    if (e.key === "Escape") cancel();
  }

  if (editing) {
    const shared = {
      ref,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setDraft(e.target.value),
      onKeyDown,
      disabled: saving,
      className: cn(
        "w-full border border-brand-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white",
        className
      ),
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {multiline
          ? <textarea {...shared} rows={6} style={{ resize: "vertical" }} />
          : <input {...shared} type="text" placeholder={placeholder} />
        }
        <div className="flex gap-1.5">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 text-xs bg-brand-700 text-white px-2 py-1 rounded-lg hover:bg-brand-800 disabled:opacity-50 transition-colors">
            <Check className="w-3 h-3" />{saving ? "Saving…" : "Save"}
          </button>
          <button onClick={cancel} disabled={saving} className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 px-2 py-1 rounded-lg transition-colors">
            <X className="w-3 h-3" />Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={start}
      className={cn("group flex items-start gap-1.5 text-left w-full hover:opacity-80 transition-opacity", displayClassName)}
    >
      <span className={value ? "" : "italic text-slate-300"}>{value || placeholder}</span>
      <Pencil className="w-3 h-3 shrink-0 mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity text-slate-400" />
    </button>
  );
}
