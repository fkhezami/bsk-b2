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
    return <p className="text-slate-500 text-sm">No vocabulary for this lesson.</p>;
  }

  const card = flashcards[index];

  const prev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    setFlipped(false);
    setIndex((i) => Math.min(flashcards.length - 1, i + 1));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-slate-500">
        {index + 1} / {flashcards.length}
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

      <div className="flex gap-2 flex-wrap justify-center mt-2">
        {flashcards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setFlipped(false); }}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === index ? "bg-slate-800" : "bg-slate-300 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
