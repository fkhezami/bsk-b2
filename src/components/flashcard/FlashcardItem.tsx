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
      className="w-full cursor-pointer"
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
          height: "148px",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center px-5 gap-1"
          style={{ backfaceVisibility: "hidden", border: "1px solid #c7d2fe" }}
        >
          <LangBadge lang="de" size={18} />

          {article ? (
            <>
              {/* Gender badge + articles on same row */}
              <div className="flex items-center gap-2 text-xs mt-1">
                {(() => {
                  const gs = GENDER_STYLE[article.gender];
                  return (
                    <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-semibold border", gs.bg, gs.text, gs.border)}>
                      {article.label}
                    </span>
                  );
                })()}
                <span className="font-semibold text-brand-600">{article.definite}</span>
                <span className="text-brand-200">·</span>
                <span className="font-semibold text-brand-500">{article.indefinite}</span>
              </div>
              <p className="text-2xl font-bold text-brand-950 text-center leading-tight">{article.bare}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-brand-950 text-center leading-tight mt-1">{card.word_de}</p>
          )}

          <p className="text-xs text-brand-200 mt-1">tap to flip</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl shadow-sm flex flex-col items-center justify-center px-5 gap-2"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#1e1b4b",
            border: "1px solid #312e81",
          }}
        >
          <div className="flex items-center justify-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <LangBadge lang="en" />
              <p className="text-sm font-semibold text-white">{card.translation_en}</p>
            </div>
            <div className="w-px h-4 bg-white/20 shrink-0" />
            <div className="flex items-center gap-2">
              <LangBadge lang="uk" />
              <p className="text-sm font-semibold text-white">{card.translation_uk}</p>
            </div>
          </div>
          {card.example_de && (
            <p className="text-xs text-indigo-300 italic text-center leading-snug line-clamp-2">
              &ldquo;{card.example_de}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
