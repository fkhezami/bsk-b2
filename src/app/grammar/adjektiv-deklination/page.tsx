import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { AdjektivDeklinationClient } from "./AdjektivDeklinationClient";

export const metadata: Metadata = {
  title: "Adjektivdeklination | BSK B2",
  description: "Die drei Typen der deutschen Adjektivdeklination: schwache, starke und gemischte Deklination.",
};

export default function AdjektivDeklinationPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />
      <AdjektivDeklinationClient />
      <Footer />
    </main>
  );
}
