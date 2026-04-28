"use client";

import { useState } from "react";
import { Flashcard } from "@/types";
import { FlashcardItem } from "./FlashcardItem";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  flashcards: Flashcard[];
}

export function FlashcardDeck({ flashcards }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (flashcards.length === 0) {
    return <p className="text-brand-300 text-sm">No vocabulary for this lesson.</p>;
  }

  const card = flashcards[index];

  const prev = () => { setFlipped(false); setIndex((i) => Math.max(0, i - 1)); };
  const next = () => { setFlipped(false); setIndex((i) => Math.min(flashcards.length - 1, i + 1)); };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-brand-400 font-medium">
        {index + 1} <span className="text-brand-300">/ {flashcards.length}</span>
      </p>

      <FlashcardItem card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      <div className="flex gap-3">
        <Button variant="secondary" size="sm" onClick={prev} disabled={index === 0}>
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button variant="secondary" size="sm" onClick={next} disabled={index === flashcards.length - 1}>
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Dot navigation */}
      <div className="flex gap-2 flex-wrap justify-center mt-1">
        {flashcards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setFlipped(false); }}
            className="transition-all"
            style={{
              width: i === index ? "20px" : "8px",
              height: "8px",
              borderRadius: "9999px",
              background: i === index ? "#4f46e5" : "#c7d2fe",
            }}
          />
        ))}
      </div>
    </div>
  );
}
