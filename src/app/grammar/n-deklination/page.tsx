import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { NDeklinationClient } from "./NDeklinationClient";

export const metadata: Metadata = {
  title: "N-Deklination | BSK B2",
  description:
    "Die schwache Deklination: vollständiger interaktiver Kurs mit Tabellen, Wortliste und Übungen auf Deutsch.",
};

export default function NDeklinationPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />
      <NDeklinationClient />
      <Footer />
    </main>
  );
}
