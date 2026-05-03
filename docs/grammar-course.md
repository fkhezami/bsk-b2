# Grammar Course — Author Guide

Use this document whenever creating a new grammar topic page for BSK B2.
It defines the file structure, design conventions, component patterns, and content requirements
so all grammar pages look and behave consistently.

---

## 1. File Structure

Every grammar topic lives under `src/app/grammar/<slug>/` and consists of exactly **two files**:

```
src/app/grammar/
├── page.tsx                          ← index listing all topics (already exists)
├── <slug>/
│   ├── page.tsx                      ← server component: metadata + shell
│   └── <TopicNameClient>.tsx         ← "use client" component: all interactive content
```

**Naming convention:**
- Slug: kebab-case German topic name, e.g. `genitiv`, `konjunktiv-2`, `passiv`
- Client file: PascalCase topic name + `Client`, e.g. `KonjunktivZweiClient.tsx`

### page.tsx (server component)

```tsx
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { MyTopicClient } from "./MyTopicClient";

export const metadata: Metadata = {
  title: "Topic Name | BSK B2",
  description: "One-sentence description of the grammar topic.",
};

export default function MyTopicPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      <PublicHeader />
      <MyTopicClient />
      <Footer />
    </main>
  );
}
```

### Client component shell

```tsx
"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, RotateCcw } from "lucide-react";

// types → data → UI primitives → chapter components → main export
```

---

## 2. Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js App Router (current version has async params — `params: Promise<{...}>`) |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS v4 (no config file — tokens defined in `globals.css` via `@theme inline`) |
| Icons | `lucide-react` (already installed) |
| State | React `useState` / `useMemo` only — no external state library |
| Data | Hardcoded TypeScript — no Supabase, no API calls |

---

## 3. Design System

All color tokens are defined in `src/app/globals.css` via `@theme inline` and map directly to Tailwind utility classes.

### Color tokens

| Token class | Hex | Use |
|---|---|---|
| `bg-brand-50` / `text-brand-50` | `#eef2ff` | Light info box backgrounds |
| `bg-brand-100` | `#e0e7ff` | Subtle borders, zebra rows |
| `bg-brand-200` / `border-brand-200` | `#c7d2fe` | Input borders |
| `text-brand-400` | `#818cf8` | Secondary labels, kasus badges |
| `text-brand-500` | `#6366f1` | Muted interactive |
| `bg-brand-600` / `border-brand-600` | `#4f46e5` | Primary accent, endings highlight |
| `bg-brand-700` | `#4338ca` | Active tab, icon backgrounds |
| `bg-brand-950` / `text-brand-950` | `#1e1b4b` | Table headers, page title |
| `text-gold-500` / `border-gold-500` | `#f59e0b` | Tip boxes, gold bar accent |
| `bg-gold-300` / `text-gold-300` | `#fcd34d` | Active tab text on dark nav |
| `bg-surface` (CSS var only) | `#f7f6ff` | Page background (use inline style) |

### Semantic color usage

| Purpose | Classes |
|---|---|
| **Merke** (rule to remember) | `bg-brand-50 border-l-4 border-brand-500 text-brand-900` |
| **Tipp** | `bg-yellow-50 border-l-4 border-gold-500 text-yellow-900` |
| **Achtung** (warning) | `bg-orange-50 border-l-4 border-orange-500 text-orange-900` |
| **Korrekt** example | `bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900` |
| **Fehler** example | `bg-red-50 border-l-4 border-red-500 text-red-900` |
| Table header | `bg-brand-950 text-white` |
| Table zebra even | `bg-white` |
| Table zebra odd | `bg-brand-50` |
| Word card — standard | `bg-white border border-brand-100` |
| Word card — gemischt | `border-l-4 border-l-orange-400 bg-orange-50` |
| Word card — Sonderfall | `border-l-4 border-l-red-400 bg-red-50` |
| Word card — Neutrum | `border-l-4 border-l-brand-500 bg-brand-50` |

### Typography

- Body font: `font-sans` → Geist Sans (loaded in root layout)
- Mono font: `font-mono` → Geist Mono (for structures, forms, grammar patterns)
- Page title: `text-3xl font-bold text-brand-950`
- Section heading: `text-xl font-bold text-brand-950`
- Sub-heading: `text-base font-semibold text-brand-900`
- Body text: `text-sm text-brand-800 leading-relaxed`
- Labels/badges: `text-xs text-brand-400` or `text-[10px] font-bold uppercase tracking-widest`

### Layout

- Max content width: `max-w-4xl mx-auto px-4`
- Page top padding: `pt-10 pb-2` for title block, `py-8` for chapter content
- Sticky header height: `64px` → sticky tab nav uses `top-[64px]`
- Card rounding: `rounded-xl` (standard), `rounded-2xl` (large cards)

---

## 4. Reusable UI Components

Define these locally in each `Client.tsx` — they are not shared globally.

### InfoBox

```tsx
type InfoTyp = "merke" | "tipp" | "achtung" | "richtig" | "falsch";

const INFO_STYLES: Record<InfoTyp, string> = {
  merke:   "bg-brand-50 border-brand-500 text-brand-900",
  tipp:    "bg-yellow-50 border-gold-500 text-yellow-900",
  achtung: "bg-orange-50 border-orange-500 text-orange-900",
  richtig: "bg-emerald-50 border-emerald-600 text-emerald-900",
  falsch:  "bg-red-50 border-red-500 text-red-900",
};

const INFO_LABELS: Record<InfoTyp, string> = {
  merke: "Merke", tipp: "Tipp", achtung: "Achtung", richtig: "Korrekt", falsch: "Fehler",
};

function InfoBox({ typ, children }: { typ: InfoTyp; children: React.ReactNode }) {
  return (
    <div className={`border-l-4 rounded-r-lg px-4 py-3 mb-4 ${INFO_STYLES[typ]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-60">
        {INFO_LABELS[typ]}
      </p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
```

### DeklTable (declension / conjugation table)

```tsx
type DeklRow = [string, string, string]; // [label, col1, col2]

function DeklTable({ title, rows }: { title?: string; rows: DeklRow[] }) {
  return (
    <div className="mb-5">
      {title && (
        <h4 className="text-sm font-semibold text-brand-700 mb-2 uppercase tracking-wide">{title}</h4>
      )}
      <div className="overflow-x-auto rounded-lg border border-brand-100">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left font-medium text-xs">Kasus</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Singular</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Plural</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, c1, c2], i) => (
              <tr key={label} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs whitespace-nowrap">{label}</td>
                <td className="px-3 py-2">{c1}</td>
                <td className="px-3 py-2">{c2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

Adapt column headers to the grammar topic (e.g. Person/Singular/Plural for verbs, Maskulin/Feminin/Neutrum for adjectives).

### Beispiel (example sentence with case/label tag)

```tsx
function Beispiel({ kasus, text }: { kasus: string; text: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-baseline">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-400 w-8">
        {kasus}
      </span>
      <span className="text-sm text-brand-800">{text}</span>
    </li>
  );
}
```

Usage:
```tsx
<ul className="space-y-2">
  <Beispiel kasus="NOM" text={<>Der <strong>Held</strong> kämpft.</>} />
  <Beispiel kasus="AKK" text={<>Ich sehe den <strong>Helden</strong>.</>} />
</ul>
```

---

## 5. Tab Navigation

Use a `sticky` nav bar positioned below the main header (`top-[64px]`).

```tsx
const TABS = ["1. Einführung", "2. Erkennung", /* ... */];
const CHAPTERS = [Chapter1, Chapter2, /* ... */];

export function MyTopicClient() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveChapter = CHAPTERS[activeTab];

  return (
    <div className="flex-1">
      {/* Title block */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-2">
        <h1 className="text-3xl font-bold text-brand-950 mb-1">Topic Title</h1>
        <p className="text-sm text-brand-400 mb-1">Subtitle</p>
        <div className="h-1 w-12 rounded-full bg-gold-500" />
      </div>

      {/* Sticky tab nav */}
      <nav
        className="sticky top-[64px] z-10 border-b border-brand-100 shadow-sm"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-none">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === i
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-brand-500 hover:text-brand-800 hover:bg-brand-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Active chapter */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ActiveChapter />
      </div>
    </div>
  );
}
```

---

## 6. Word List (Chapter: Wortliste)

```tsx
interface WordEntry {
  artikel: string;        // "der" | "die" | "das"
  wort: string;           // base form
  genitiv: string;        // full genitive: "des Helden"
  plural: string;         // full plural: "die Helden"
  typ?: "gemischt" | "sonderfall" | "neutrum"; // optional highlight
}

interface WordCategory {
  name: string;
  words: WordEntry[];
}
```

Search/filter pattern:
```tsx
const [query, setQuery] = useState("");

const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return CATEGORIES;
  return CATEGORIES
    .map((cat) => ({
      ...cat,
      words: cat.words.filter(
        (w) =>
          w.wort.toLowerCase().includes(q) ||
          w.genitiv.toLowerCase().includes(q) ||
          w.plural.toLowerCase().includes(q)
      ),
    }))
    .filter((cat) => cat.words.length > 0);
}, [query]);
```

Word card rendering — apply `cardStyle` based on `w.typ`:
```tsx
const cardStyle =
  w.typ === "gemischt"  ? "border-l-4 border-l-orange-400 bg-orange-50" :
  w.typ === "sonderfall"? "border-l-4 border-l-red-400 bg-red-50"       :
  w.typ === "neutrum"   ? "border-l-4 border-l-brand-500 bg-brand-50"   :
                          "bg-white border border-brand-100";
```

---

## 7. Quiz (Chapter: Übungen)

```tsx
interface QuizQuestion {
  frage: string;          // sentence with blank: "Ich sehe ___ (Held, Akkusativ)."
  optionen: string[];     // exactly 4 options
  richtig: number;        // 0-indexed correct answer
  erklaerung: string;     // explanation shown after answering
}
```

State pattern:
```tsx
const [answers, setAnswers] = useState<Record<number, number>>({});

const handleAnswer = (qIdx: number, aIdx: number) => {
  if (answers[qIdx] !== undefined) return; // lock after first click
  setAnswers((prev) => ({ ...prev, [qIdx]: aIdx }));
};

const score = QUIZ.reduce((acc, q, i) => acc + (answers[i] === q.richtig ? 1 : 0), 0);
```

Option button style logic:
```tsx
// answered = answers[qi] !== undefined
// ai = current option index

let style = "border border-brand-100 text-brand-700 hover:border-brand-300"; // unanswered
if (answered) {
  if (ai === q.richtig)        style = "border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
  else if (ai === chosen)      style = "border-2 border-red-400 bg-red-50 text-red-700";
  else                         style = "border border-brand-100 text-brand-400 opacity-60";
}
```

Always show explanation after any click. Always show correct answer highlighted green, even when the user chose wrong.

---

## 8. Adding to the Grammar Index

After creating the page, add one entry to the `topics` array in `src/app/grammar/page.tsx`:

```tsx
const topics = [
  // existing entries …
  {
    href: "/grammar/<slug>",
    title: "Topic Title",
    subtitle: "German subtitle",
    description: "X Kapitel · Brief description",
  },
];
```

---

## 9. Content Requirements

Each grammar course must include:

| # | Chapter | Minimum content |
|---|---|---|
| 1 | Einführung | Definition, basic rule, full form table, ≥5 example sentences |
| 2 | Erkennung / Bildung | How to recognise or form the structure, groups/patterns |
| 3 | Detail | Deeper explanation (suffixes, stems, strong vs. weak, etc.) |
| 4 | Tabellen | Full paradigm tables for ≥2 representative words/verbs |
| 5 | Besonderheiten | Irregular forms, sub-types, mixed patterns |
| 6 | Sonderfälle | All exceptions, fully explained with tables |
| 7 | Tipps & Tricks | ≥5 learning tips, mnemonics, top-10 frequency list |
| 8 | Wortliste | ≥100 words/forms, searchable, categorised, colour-coded |
| 9 | Übungen | ≥10 multiple-choice questions covering all aspects |

Adapt chapter names and count to the specific topic — not every topic needs exactly 9 chapters,
but should cover introduction, recognition, tables, exceptions, word list, and exercises.

Every chapter must contain **at least 5 example sentences** in natural German.

---

## 10. Critical Gotchas

### German quotation marks inside JS string literals

German quotes `„word"` inside double-quoted JS strings will **crash the parser** because the
closing `"` is an ASCII `"` that terminates the string early.

**Wrong:**
```ts
erklaerung: "„Tourist" ist ein N-Deklinationsnomen.",
```

**Correct — use template literals for any string containing „...:":**
```ts
erklaerung: `„Tourist" ist ein N-Deklinationsnomen.`,
```

This applies to all JS string literals (data arrays, object fields). German quotes **inside JSX
text content** (between HTML tags) are always safe.

### Tailwind v4 — no arbitrary color values needed

All required colors are already in `globals.css`. Use `text-brand-950`, `bg-gold-500` etc.
directly — no need for `text-[#1e1b4b]` arbitrary values.

### Sticky nav offset

The `PublicHeader` is `sticky top-0 z-50` with a height of `64px`.
The chapter tab nav must use `sticky top-[64px] z-10` to sit directly below it.

### TypeScript — no `any`

All data arrays and component props must be fully typed. Define interfaces at the top of
the client file before the data constants.
