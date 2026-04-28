"use client";

import { useRouter } from "next/navigation";
import { InlineEdit } from "./InlineEdit";
import { LangBadge } from "@/components/ui/LangBadge";
import type { Flashcard } from "@/types";

export function FlashcardEditFields({ card }: { card: Flashcard }) {
  const router = useRouter();

  async function patch(field: string, value: string) {
    await fetch(`/api/admin/flashcards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    router.refresh();
  }

  return (
    <div className="flex-1 min-w-0 space-y-1">
      <InlineEdit
        value={card.word_de}
        onSave={(v) => patch("word_de", v)}
        displayClassName="font-semibold text-blue-800 text-sm"
      />
      <div className="flex flex-wrap gap-x-3">
        <span className="flex items-center gap-1 text-xs">
          <LangBadge lang="en" />
          <InlineEdit
            value={card.translation_en}
            onSave={(v) => patch("translation_en", v)}
            displayClassName="text-blue-800"
          />
        </span>
        <span className="flex items-center gap-1 text-xs">
          <LangBadge lang="uk" />
          <InlineEdit
            value={card.translation_uk}
            onSave={(v) => patch("translation_uk", v)}
            displayClassName="text-blue-800"
          />
        </span>
      </div>
      <InlineEdit
        value={card.example_de ?? ""}
        onSave={(v) => patch("example_de", v)}
        placeholder="Add example sentence…"
        displayClassName="text-blue-400 text-xs italic"
      />
    </div>
  );
}
