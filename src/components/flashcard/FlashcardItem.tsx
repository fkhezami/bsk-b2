"use client";

import { Flashcard } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}

export function FlashcardItem({ card, flipped, onFlip }: Props) {
  return (
    <div
      className="w-full max-w-md cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={onFlip}
      role="button"
      aria-label={flipped ? "Show German word" : "Show translation"}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: "220px",
        }}
      >
        {/* Front — German word */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border border-slate-200 bg-white shadow-md flex flex-col items-center justify-center p-8 backface-hidden"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Deutsch</p>
          <p className="text-3xl font-semibold text-slate-900 text-center">{card.word_de}</p>
          <p className="text-xs text-slate-400 mt-6">tap to flip</p>
        </div>

        {/* Back — translations + example */}
        <div
          className="absolute inset-0 rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-md flex flex-col items-center justify-center p-8 gap-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">English</p>
            <p className="text-xl font-semibold">{card.translation_en}</p>
          </div>
          <div className="w-8 h-px bg-slate-600" />
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Українська</p>
            <p className="text-xl font-semibold">{card.translation_uk}</p>
          </div>
          {card.example_de && (
            <p className="text-xs text-slate-400 text-center mt-2 italic">&ldquo;{card.example_de}&rdquo;</p>
          )}
        </div>
      </div>
    </div>
  );
}
