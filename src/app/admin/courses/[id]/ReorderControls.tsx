"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Item {
  id: string;
  display_order: number;
}

interface Props {
  item: Item;
  items: Item[];
  endpoint: "/api/admin/flashcards/reorder" | "/api/admin/grammar/reorder";
}

export function ReorderControls({ item, items, endpoint }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"up" | "down" | null>(null);

  const sorted = [...items].sort((a, b) => a.display_order - b.display_order);
  const idx = sorted.findIndex((i) => i.id === item.id);
  const isFirst = idx === 0;
  const isLast = idx === sorted.length - 1;

  const swap = async (direction: "up" | "down") => {
    const neighbor = direction === "up" ? sorted[idx - 1] : sorted[idx + 1];
    if (!neighbor) return;
    setLoading(direction);
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idA: item.id,
        orderA: item.display_order,
        idB: neighbor.id,
        orderB: neighbor.display_order,
      }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <button
        onClick={() => swap("up")}
        disabled={isFirst || loading !== null}
        className="text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="Move up"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => swap("down")}
        disabled={isLast || loading !== null}
        className="text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="Move down"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
