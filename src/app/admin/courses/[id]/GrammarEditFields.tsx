"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import { InlineEdit } from "./InlineEdit";
import { GrammarLines } from "@/components/grammar/GrammarLines";
import type { GrammarNote } from "@/types";

export function GrammarEditFields({ note }: { note: GrammarNote }) {
  const router = useRouter();
  const [editingExplanation, setEditingExplanation] = useState(false);
  const [draft, setDraft] = useState(note.explanation);
  const [saving, setSaving] = useState(false);

  async function patch(field: string, value: string) {
    await fetch(`/api/admin/grammar/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    router.refresh();
  }

  async function saveExplanation() {
    setSaving(true);
    await patch("explanation", draft);
    setSaving(false);
    setEditingExplanation(false);
  }

  return (
    <>
      {/* Title row + edit button */}
      <div className="ml-6 mb-2 flex items-start justify-between gap-2">
        <InlineEdit
          value={note.title}
          onSave={(v) => patch("title", v)}
          displayClassName="font-bold text-red-700 text-base"
        />
        {!editingExplanation && (
          <button
            onClick={() => { setDraft(note.explanation); setEditingExplanation(true); }}
            className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
          >
            <Pencil className="w-3 h-3" />Edit
          </button>
        )}
      </div>

      {/* Explanation */}
      <div className="ml-6 mb-3">
        {editingExplanation ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={10}
              style={{ resize: "vertical" }}
              className="w-full border border-brand-300 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            />
            <div className="flex gap-1.5">
              <button onClick={saveExplanation} disabled={saving} className="inline-flex items-center gap-1 text-xs bg-brand-700 text-white px-2 py-1 rounded-lg hover:bg-brand-800 disabled:opacity-50 transition-colors">
                <Check className="w-3 h-3" />{saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => { setDraft(note.explanation); setEditingExplanation(false); }} disabled={saving} className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 px-2 py-1 rounded-lg transition-colors">
                <X className="w-3 h-3" />Cancel
              </button>
            </div>
          </div>
        ) : (
          <GrammarLines explanation={note.explanation} />
        )}
      </div>

      {/* Structure */}
      <div className="bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100 ml-6">
        <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">Struktur</p>
        <InlineEdit
          value={note.structure ?? ""}
          onSave={(v) => patch("structure", v)}
          placeholder="Add structure formula…"
          displayClassName="font-mono text-sm text-blue-800"
        />
      </div>
    </>
  );
}
