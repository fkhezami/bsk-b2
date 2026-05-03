import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Grammar | BSK B2",
  description: "Interaktive Grammatikkurse für Deutsch B2.",
};

const topics = [
  {
    href: "/grammar/n-deklination",
    title: "N-Deklination",
    subtitle: "Schwache Deklination",
    description: "9 Kapitel · Vollständige Tabellen · 177 Nomen · 15 Übungsaufgaben",
  },
];

export default function GrammarPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />

      <div className="max-w-3xl mx-auto px-4 py-12 w-full flex-1">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-brand-950">Grammar</h1>
          </div>
          <div className="h-1 w-12 rounded-full bg-gold-500 mt-3 ml-12" />
        </div>

        <ul className="space-y-3">
          {topics.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="flex gap-4 group">
                <div className="relative flex-1 bg-white rounded-2xl border border-brand-100 group-hover:border-brand-300 group-hover:shadow-md transition-all px-5 py-4 pr-10 overflow-hidden">
                  <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4 text-brand-200 group-hover:text-brand-500 transition-colors" />
                  <p className="font-semibold text-brand-950 leading-snug">{t.title}</p>
                  <p className="text-xs text-brand-400 mt-0.5">{t.subtitle}</p>
                  <p className="text-xs text-brand-300 mt-2">{t.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Footer />
    </main>
  );
}
