"use client";

import { Flashcard } from "@/types";
import { parseArticle } from "@/lib/utils";
import { LangBadge } from "@/components/ui/LangBadge";
import { cn } from "@/lib/utils";

const GENDER_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  m: { bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200" },
  f: { bg: "bg-pink-50",  text: "text-pink-700",  border: "border-pink-200" },
  n: { bg: "bg-teal-50",  text: "text-teal-700",  border: "border-teal-200" },
};

interface Props {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}

export function FlashcardItem({ card, flipped, onFlip }: Props) {
  const article = parseArticle(card.word_de);

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
          height: "260px",
        }}
      >
        {/* Front — German word + article + gender */}
        <div
          className="absolute inset-0 rounded-2xl bg-white shadow-lg flex flex-col items-center justify-center p-8 gap-2"
          style={{ backfaceVisibility: "hidden", border: "1px solid #c7d2fe" }}
        >
          <LangBadge lang="de" size={24} />

          {article ? (
            <>
              {/* Articles row */}
              <div className="flex items-center gap-3 text-sm text-brand-400">
                <span><span className="font-semibold text-brand-600">{article.definite}</span></span>
                <span className="text-brand-200">·</span>
                <span><span className="font-semibold text-brand-500">{article.indefinite}</span></span>
              </div>
              {/* Bare word */}
              <p className="text-3xl font-bold text-brand-950 text-center">{article.bare}</p>
              {/* Gender badge */}
              {(() => {
                const gs = GENDER_STYLE[article.gender];
                return (
                  <span className={cn("mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", gs.bg, gs.text, gs.border)}>
                    {article.label}
                  </span>
                );
              })()}
            </>
          ) : (
            <p className="text-3xl font-bold text-brand-950 text-center">{card.word_de}</p>
          )}

          <p className="text-xs text-brand-300 mt-3">tap to flip</p>
        </div>

        {/* Back — both translations with styled language badges */}
        <div
          className="absolute inset-0 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 gap-4"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#1e1b4b",
            border: "1px solid #312e81",
          }}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <LangBadge lang="en" />
              <p className="text-lg font-semibold text-white">{card.translation_en}</p>
            </div>
            <div className="w-8 h-px bg-gold-500/40" />
            <div className="flex items-center gap-2">
              <LangBadge lang="uk" />
              <p className="text-lg font-semibold text-white">{card.translation_uk}</p>
            </div>
          </div>

          {card.example_de && (
            <p className="text-xs text-brand-300 text-center italic">
              &ldquo;{card.example_de}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
