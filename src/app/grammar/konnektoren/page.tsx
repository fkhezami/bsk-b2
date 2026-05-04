import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { KonnektorenClient } from "./KonnektorenClient";

export const metadata: Metadata = {
  title: "Konnektoren | BSK B2",
  description: "Alle deutschen Konnektoren: koordinierende Konjunktionen, Subjunktionen und Konjunktionaladverbien mit Wortstellung.",
};

export default function KonnektorenPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />
      <KonnektorenClient />
      <Footer />
    </main>
  );
}
