import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { DirektIndirekteFragenClient } from "./DirektIndirekteFragenClient";

export const metadata: Metadata = {
  title: "Direkte & Indirekte Fragen | BSK B2",
  description: "Direkte und indirekte Fragen im Deutschen: Wortstellung, ob, W-Fragewörter und Einleitungssätze.",
};

export default function DirektIndirekteFragenPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />
      <DirektIndirekteFragenClient />
      <Footer />
    </main>
  );
}
