"use client";

import { useState } from "react";
import { Flashcard } from "@/types";
import { FlashcardItem } from "./FlashcardItem";
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
    <div className="flex flex-col gap-2">
      {/* Counter */}
      <p className="text-center text-xs text-brand-400 font-medium tabular-nums">
        {index + 1} <span className="text-brand-200">/</span> {flashcards.length}
      </p>

      {/* Card + arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={index === 0}
          className="shrink-0 p-1.5 rounded-lg text-brand-300 hover:text-brand-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <FlashcardItem card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
        </div>

        <button
          onClick={next}
          disabled={index === flashcards.length - 1}
          className="shrink-0 p-1.5 rounded-lg text-brand-300 hover:text-brand-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-1.5 flex-wrap justify-center mt-1">
        {flashcards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setFlipped(false); }}
            className="transition-all rounded-full"
            style={{
              width: i === index ? "18px" : "7px",
              height: "7px",
              background: i === index ? "#4f46e5" : "#c7d2fe",
            }}
          />
        ))}
      </div>
    </div>
  );
}
