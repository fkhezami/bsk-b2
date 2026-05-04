"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InfoTyp = "merke" | "tipp" | "achtung" | "richtig" | "falsch";

interface EintragEntry {
  wort: string;
  bedeutung: string;
  typ?: "ob" | "einleitung";
}

interface EintragCategory {
  name: string;
  entries: EintragEntry[];
}

interface QuizQuestion {
  frage: string;
  optionen: string[];
  richtig: number;
  erklaerung: string;
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

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
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-60">{INFO_LABELS[typ]}</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Beispiel({ label, text }: { label: string; text: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-baseline">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-400 w-16">{label}</span>
      <span className="text-sm text-brand-800 font-mono">{text}</span>
    </li>
  );
}

function PairBox({
  direkt,
  indirekt,
}: {
  direkt: React.ReactNode;
  indirekt: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-xl overflow-hidden border border-brand-100">
      <div className="flex items-start gap-2 px-4 py-2 bg-white border-b border-brand-50">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-400 pt-0.5 w-14">Direkt</span>
        <span className="text-sm text-brand-800 font-mono">{direkt}</span>
      </div>
      <div className="flex items-start gap-2 px-4 py-2 bg-brand-50">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-600 pt-0.5 w-14">Indirekt</span>
        <span className="text-sm text-brand-800 font-mono">{indirekt}</span>
      </div>
    </div>
  );
}

// ─── Word List Data (110+ Einträge) ──────────────────────────────────────────

const KATEGORIEN: EintragCategory[] = [
  {
    name: "W-Fragewörter — Personen",
    entries: [
      { wort: "wer", bedeutung: "who — Nominativ (Subjekt)" },
      { wort: "wen", bedeutung: "whom — Akkusativ (Objekt)" },
      { wort: "wem", bedeutung: "to whom — Dativ (indir. Objekt)" },
      { wort: "wessen", bedeutung: "whose — Genitiv" },
      { wort: "welche Person", bedeutung: "which person" },
      { wort: "welcher Mensch", bedeutung: "which person (formal)" },
    ],
  },
  {
    name: "W-Fragewörter — Sachen & wo-Komposita",
    entries: [
      { wort: "was", bedeutung: "what" },
      { wort: "womit", bedeutung: "with what / by means of what" },
      { wort: "worüber", bedeutung: "about what / over what" },
      { wort: "wovon", bedeutung: "of what / about what" },
      { wort: "wozu", bedeutung: "what for / to what end" },
      { wort: "wodurch", bedeutung: "through what / by what means" },
      { wort: "wofür", bedeutung: "for what" },
      { wort: "worauf", bedeutung: "on what / for what (waiting)" },
      { wort: "worin", bedeutung: "in what / wherein" },
      { wort: "woraus", bedeutung: "out of what / from what" },
      { wort: "worunter", bedeutung: "under what / among what" },
      { wort: "wonach", bedeutung: "after what / according to what" },
      { wort: "wobei", bedeutung: "in doing what / whereby" },
      { wort: "woran", bedeutung: "on what / at what (woran liegt es?)" },
      { wort: "worum", bedeutung: "about what (worum geht es?)" },
      { wort: "wovor", bedeutung: "of what / from what (fear)" },
      { wort: "wogegen", bedeutung: "against what" },
      { wort: "was für ein/eine", bedeutung: "what kind of" },
    ],
  },
  {
    name: "W-Fragewörter — Ort",
    entries: [
      { wort: "wo", bedeutung: "where (location)" },
      { wort: "wohin", bedeutung: "where to (direction)" },
      { wort: "woher", bedeutung: "where from (origin)" },
    ],
  },
  {
    name: "W-Fragewörter — Zeit",
    entries: [
      { wort: "wann", bedeutung: "when" },
      { wort: "wie lange", bedeutung: "how long (duration)" },
      { wort: "wie oft", bedeutung: "how often (frequency)" },
      { wort: "seit wann", bedeutung: "since when" },
      { wort: "bis wann", bedeutung: "until when" },
      { wort: "wie spät", bedeutung: "what time (Wie spät ist es?)" },
      { wort: "ab wann", bedeutung: "from when / starting when" },
      { wort: "wie früh", bedeutung: "how early" },
    ],
  },
  {
    name: "W-Fragewörter — Art, Weise & Menge",
    entries: [
      { wort: "wie", bedeutung: "how / what … like" },
      { wort: "wie sehr", bedeutung: "how much (intensely)" },
      { wort: "wie viel", bedeutung: "how much (amount)" },
      { wort: "wie viele", bedeutung: "how many (countable)" },
      { wort: "wie weit", bedeutung: "how far" },
      { wort: "wie schnell", bedeutung: "how fast" },
      { wort: "wie gut", bedeutung: "how well" },
      { wort: "wie alt", bedeutung: "how old" },
      { wort: "wie groß", bedeutung: "how big / how tall" },
      { wort: "wie teuer", bedeutung: "how expensive" },
    ],
  },
  {
    name: "W-Fragewörter — Grund",
    entries: [
      { wort: "warum", bedeutung: "why (general reason)" },
      { wort: "weshalb", bedeutung: "why (more formal / written)" },
      { wort: "weswegen", bedeutung: "why / for what reason (formal)" },
      { wort: "wozu", bedeutung: "what for / to what end" },
      { wort: "wieso", bedeutung: "why / how come (surprised tone)" },
      { wort: "inwiefern", bedeutung: "in what way / to what extent" },
    ],
  },
  {
    name: "Welch- Formen",
    entries: [
      { wort: "welcher", bedeutung: "which — Maskulin" },
      { wort: "welche", bedeutung: "which — Feminin / Plural" },
      { wort: "welches", bedeutung: "which — Neutrum" },
      { wort: "welchem", bedeutung: "which — Dativ M/N" },
      { wort: "welchen", bedeutung: "which — Akkusativ M / Dativ PL" },
      { wort: "welch ein / welch eine", bedeutung: "what a (exclamation)" },
    ],
  },
  {
    name: "ob — Besonderes Einleitewort für Ja/Nein-Fragen",
    entries: [
      {
        wort: "ob",
        bedeutung: "whether — ersetzt Ja/Nein-Fragen in der indirekten Rede",
        typ: "ob",
      },
    ],
  },
  {
    name: "Einleitende Verben",
    entries: [
      { wort: "fragen", bedeutung: "to ask", typ: "einleitung" },
      { wort: "sich fragen", bedeutung: "to wonder / to ask oneself", typ: "einleitung" },
      { wort: "wissen", bedeutung: "to know", typ: "einleitung" },
      { wort: "wissen wollen", bedeutung: "to want to know", typ: "einleitung" },
      { wort: "sagen", bedeutung: "to say / to tell", typ: "einleitung" },
      { wort: "erklären", bedeutung: "to explain", typ: "einleitung" },
      { wort: "verstehen", bedeutung: "to understand", typ: "einleitung" },
      { wort: "bemerken", bedeutung: "to notice", typ: "einleitung" },
      { wort: "überlegen", bedeutung: "to consider / to think about", typ: "einleitung" },
      { wort: "herausfinden", bedeutung: "to find out", typ: "einleitung" },
      { wort: "ahnen", bedeutung: "to suspect / to have a feeling", typ: "einleitung" },
      { wort: "glauben", bedeutung: "to believe", typ: "einleitung" },
      { wort: "zweifeln (an)", bedeutung: "to doubt", typ: "einleitung" },
      { wort: "zeigen", bedeutung: "to show", typ: "einleitung" },
      { wort: "berichten", bedeutung: "to report", typ: "einleitung" },
      { wort: "mitteilen", bedeutung: "to inform / to communicate", typ: "einleitung" },
      { wort: "erwähnen", bedeutung: "to mention", typ: "einleitung" },
      { wort: "beschreiben", bedeutung: "to describe", typ: "einleitung" },
      { wort: "feststellen", bedeutung: "to note / to determine", typ: "einleitung" },
      { wort: "vermuten", bedeutung: "to suspect / to assume", typ: "einleitung" },
      { wort: "untersuchen", bedeutung: "to investigate / to examine", typ: "einleitung" },
      { wort: "neugierig sein", bedeutung: "to be curious", typ: "einleitung" },
      { wort: "unklar sein", bedeutung: "to be unclear", typ: "einleitung" },
      { wort: "bezweifeln", bedeutung: "to doubt / to question", typ: "einleitung" },
      { wort: "nachfragen", bedeutung: "to ask (again) / to inquire", typ: "einleitung" },
    ],
  },
  {
    name: "Typische Einleitungssätze",
    entries: [
      { wort: "Ich frage mich, ob/wer/was …", bedeutung: "I wonder whether/who/what …", typ: "einleitung" },
      { wort: "Ich weiß nicht, ob/wer/was …", bedeutung: "I don't know whether/who/what …", typ: "einleitung" },
      { wort: "Ich möchte wissen, ob/wer/was …", bedeutung: "I would like to know whether …", typ: "einleitung" },
      { wort: "Kannst du mir sagen, ob/wann …?", bedeutung: "Can you tell me whether/when …?", typ: "einleitung" },
      { wort: "Er erklärt, warum/wie/wann …", bedeutung: "He explains why/how/when …", typ: "einleitung" },
      { wort: "Wir verstehen nicht, warum …", bedeutung: "We don't understand why …", typ: "einleitung" },
      { wort: "Es ist unklar, ob …", bedeutung: "It is unclear whether …", typ: "einleitung" },
      { wort: "Ich bin neugierig, wie …", bedeutung: "I am curious how …", typ: "einleitung" },
      { wort: "Bitte erkläre mir, warum …", bedeutung: "Please explain to me why …", typ: "einleitung" },
      { wort: "Sie beschreibt, wie/wo …", bedeutung: "She describes how/where …", typ: "einleitung" },
      { wort: "Wir wollen herausfinden, ob …", bedeutung: "We want to find out whether …", typ: "einleitung" },
      { wort: "Ich habe keine Ahnung, warum …", bedeutung: "I have no idea why …", typ: "einleitung" },
      { wort: "Sag mir bitte, wie/wo …", bedeutung: "Please tell me how/where …", typ: "einleitung" },
      { wort: "Es bleibt offen, wer/was …", bedeutung: "It remains open who/what …", typ: "einleitung" },
      { wort: "Ich bezweifle, ob …", bedeutung: "I doubt whether …", typ: "einleitung" },
      { wort: "Es hängt davon ab, ob …", bedeutung: "It depends on whether …", typ: "einleitung" },
      { wort: "Ich bin gespannt, wie …", bedeutung: "I am curious/excited how …", typ: "einleitung" },
      { wort: "Man fragt sich, warum …", bedeutung: "One wonders why …", typ: "einleitung" },
      { wort: "Weißt du, wann/wo …?", bedeutung: "Do you know when/where …?", typ: "einleitung" },
      { wort: "Er berichtet, was/wer …", bedeutung: "He reports what/who …", typ: "einleitung" },
      { wort: "Ich überlege, ob …", bedeutung: "I am thinking about whether …", typ: "einleitung" },
      { wort: "Es ist fraglich, ob …", bedeutung: "It is questionable whether …", typ: "einleitung" },
      { wort: "Ich kann mir vorstellen, wie …", bedeutung: "I can imagine how …", typ: "einleitung" },
      { wort: "Sie möchte erfahren, wer …", bedeutung: "She would like to find out who …", typ: "einleitung" },
      { wort: "Ich vermute, dass … (Aussage!)", bedeutung: "I suspect that … (statement, not a question)", typ: "einleitung" },
    ],
  },
];

// ─── Quiz Data (15 Fragen) ────────────────────────────────────────────────────

const QUIZ: QuizQuestion[] = [
  {
    frage: "Welcher Satz ist eine direkte Frage?",
    optionen: [
      "Ich frage, ob du kommst.",
      "Kommst du morgen?",
      "Er weiß, wann der Zug fährt.",
      "Sie erklärt, wie es funktioniert.",
    ],
    richtig: 1,
    erklaerung: "Direkte Fragen sind eigenständige Fragesätze mit Fragezeichen. 'Kommst du morgen?' ist eine direkte Ja/Nein-Frage — das Verb steht an erster Position (Verberststellung).",
  },
  {
    frage: `Direkte Frage: "Kommt sie morgen?" → Indirekte Frage: Ich frage, ___ sie morgen kommt.`,
    optionen: ["ob", "dass", "wenn", "weil"],
    richtig: 0,
    erklaerung: "Ja/Nein-Fragen (ohne W-Wort) werden in indirekte Fragen mit 'ob' (= whether) umgewandelt. 'dass' leitet Aussagesätze ein, 'wenn' drückt Zeit oder Bedingung aus.",
  },
  {
    frage: `Direkte Frage: "Wo wohnst du?" → Indirekte Frage: Ich möchte wissen, ___ du wohnst.`,
    optionen: ["wo", "ob", "dass", "wohin"],
    richtig: 0,
    erklaerung: "W-Fragen behalten ihr W-Fragewort als Einleitewort in der indirekten Frage. 'Wo' fragt nach dem Ort und bleibt als Einleitewort erhalten.",
  },
  {
    frage: "Welche Wortstellung ist in einer indirekten Frage korrekt?",
    optionen: [
      "Ich weiß nicht, ob kommt er morgen.",
      "Ich weiß nicht, ob er morgen kommt.",
      "Ich weiß nicht, ob er kommt morgen.",
      "Ich weiß nicht er ob morgen kommt.",
    ],
    richtig: 1,
    erklaerung: "In indirekten Fragen steht das konjugierte Verb am Ende des Nebensatzes: Einleitewort + Subjekt + … + Verb. Die direkte Frage 'Kommt er morgen?' wird zu 'ob er morgen kommt'.",
  },
  {
    frage: `Direkte Frage: "Wann fährt der Zug?" → Indirekte Frage: Er fragt, ___.`,
    optionen: [
      "wann fährt der Zug",
      "wann der Zug fährt",
      "ob der Zug fährt wann",
      "der Zug wann fährt",
    ],
    richtig: 1,
    erklaerung: "In der indirekten Frage rückt das Verb ans Ende: 'wann der Zug fährt'. In der direkten Frage steht das Verb an zweiter Position: 'Wann fährt der Zug?'",
  },
  {
    frage: `Direkte Frage: "Wer hat das gesagt?" → Indirekte Frage: Ich möchte wissen, ___ das gesagt hat.`,
    optionen: ["wer", "wen", "wem", "ob"],
    richtig: 0,
    erklaerung: "'wer' fragt nach der Person im Nominativ (Subjekt). Da die Person in der direkten Frage das Subjekt ist, bleibt 'wer' als Einleitewort erhalten.",
  },
  {
    frage: `Direkte Frage: "Wen hast du eingeladen?" → Indirekte Frage: Er fragt, ___ ich eingeladen habe.`,
    optionen: ["wen", "wer", "wem", "ob"],
    richtig: 0,
    erklaerung: "'wen' ist der Akkusativ von 'wer' — es fragt nach der Person als direktes Objekt. Da 'einladen' ein Akkusativobjekt verlangt, bleibt 'wen' erhalten.",
  },
  {
    frage: `Direkte Frage: "Wie lange lebst du schon hier?" → Indirekte Frage: Sie fragt, ___ du schon hier lebst.`,
    optionen: ["wie lange", "wann", "wie oft", "ob"],
    richtig: 0,
    erklaerung: "'wie lange' fragt nach der Dauer und wird als zweiteiliges Fragewort in die indirekte Frage übernommen: 'wie lange du schon hier lebst'.",
  },
  {
    frage: `Direkte Frage: "Warum bist du so müde?" → Indirekte Frage: Er will wissen, ___ ich so müde bin.`,
    optionen: ["warum", "ob", "dass", "wann"],
    richtig: 0,
    erklaerung: "W-Fragen (hier: warum) werden mit demselben W-Wort als Einleitewort der indirekten Frage eingeleitet. 'ob' würde nur eine Ja/Nein-Frage einleiten.",
  },
  {
    frage: `Direkte Frage: "Hast du das Buch gelesen?" → Indirekte Frage: Ich frage mich, ___ du das Buch gelesen hast.`,
    optionen: ["ob", "was", "wann", "wie"],
    richtig: 0,
    erklaerung: "Da die direkte Frage eine Ja/Nein-Frage ohne W-Wort ist ('Hast du …?'), wird sie mit 'ob' in die indirekte Frage umgewandelt.",
  },
  {
    frage: "Welcher Einleitungssatz passt zu einer indirekten Frage?",
    optionen: [
      "Ich sage dir, dass …",
      "Ich denke, dass …",
      "Ich möchte wissen, …",
      "Ich bin froh, dass …",
    ],
    richtig: 2,
    erklaerung: "'Ich möchte wissen, …' leitet eine indirekte Frage ein und wird mit ob oder einem W-Wort fortgesetzt. Die anderen Optionen leiten Aussagesätze (dass-Sätze) ein.",
  },
  {
    frage: "Welcher Satz hat die korrekte Zeichensetzung?",
    optionen: [
      "Ich weiß nicht ob er kommt.",
      "Ich weiß nicht, ob er kommt.",
      "Ich weiß nicht, ob er kommt?",
      "Ich weiß nicht ob, er kommt.",
    ],
    richtig: 1,
    erklaerung: "Vor einem Nebensatz (hier der indirekte Fragesatz) steht ein Komma. Am Ende einer indirekten Frage steht ein Punkt — kein Fragezeichen, da der Hauptsatz selbst keine direkte Frage ist.",
  },
  {
    frage: `Direkte Frage: "Kann er Klavier spielen?" → Indirekte Frage: Ich frage, ___ er Klavier spielen kann.`,
    optionen: ["ob", "dass", "weil", "wenn"],
    richtig: 0,
    erklaerung: "Auch Fragen mit Modalverben sind Ja/Nein-Fragen und werden mit 'ob' eingeleitet. Das Modalverb wandert ans Ende: 'ob er Klavier spielen kann'.",
  },
  {
    frage: `Direkte Frage: "Was hat sie gestern gemacht?" → Indirekte Frage: Er möchte wissen, was sie gestern ___ hat.`,
    optionen: ["gemacht", "macht", "machen", "zu machen"],
    richtig: 0,
    erklaerung: "Das Perfekt bleibt in der indirekten Frage erhalten. Das Hilfsverb 'hat' wandert ans Ende, nach dem Partizip II: 'was sie gestern gemacht hat'.",
  },
  {
    frage: "Welcher Satz ist eine korrekt gebildete indirekte Frage?",
    optionen: [
      "Ich weiß nicht, wann kommt er nach Hause.",
      "Ich weiß nicht ob kommt er nach Hause.",
      "Ich weiß nicht, wann er nach Hause kommt.",
      "Ich weiß nicht wann er nach Hause kommt.",
    ],
    richtig: 2,
    erklaerung: "Korrekt: 'wann er nach Hause kommt' — W-Wort + Subjekt + … + Verb am Ende + Komma vor dem Nebensatz. Option A/B: falsche Verbstellung. Option D: fehlendes Komma.",
  },
];

// ─── Chapters ─────────────────────────────────────────────────────────────────

function Chapter1() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Direkte vs. Indirekte Fragen</h2>
      <p className="text-sm text-brand-400 mb-6">Grundunterschied und Überblick</p>

      <InfoBox typ="merke">
        Eine <strong>direkte Frage</strong> ist ein eigenständiger Fragesatz mit Fragezeichen. Eine <strong>indirekte Frage</strong> ist ein Nebensatz, der in einen Hauptsatz eingebettet ist — sie hat kein Fragezeichen und das Verb steht am Ende.
      </InfoBox>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-brand-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-2">Direkte Frage</p>
          <ul className="space-y-1 text-sm text-brand-800 font-mono">
            <li>Eigenständiger Fragesatz</li>
            <li>Endet mit <strong>?</strong></li>
            <li>Verb an Pos. 1 oder 2</li>
            <li>Direkte Kommunikation</li>
          </ul>
        </div>
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-2">Indirekte Frage</p>
          <ul className="space-y-1 text-sm text-brand-800 font-mono">
            <li>Eingebetteter Nebensatz</li>
            <li>Endet mit <strong>.</strong> (kein ?)</li>
            <li>Verb am <strong>Ende</strong></li>
            <li>Eingeleitet durch ob oder W-Wort</li>
          </ul>
        </div>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Gegenüberstellung: Direkt → Indirekt</h3>

      <PairBox
        direkt={<>Kommst du morgen?</>}
        indirekt={<>Ich frage, <strong>ob</strong> du morgen <strong>kommst</strong>.</>}
      />
      <PairBox
        direkt={<>Wo wohnst du?</>}
        indirekt={<>Ich möchte wissen, <strong>wo</strong> du <strong>wohnst</strong>.</>}
      />
      <PairBox
        direkt={<>Wann fährt der Zug?</>}
        indirekt={<>Er fragt, <strong>wann</strong> der Zug <strong>fährt</strong>.</>}
      />
      <PairBox
        direkt={<>Warum bist du müde?</>}
        indirekt={<>Sie weiß nicht, <strong>warum</strong> ich müde <strong>bin</strong>.</>}
      />
      <PairBox
        direkt={<>Hat er das Buch gelesen?</>}
        indirekt={<>Ich frage mich, <strong>ob</strong> er das Buch gelesen <strong>hat</strong>.</>}
      />

      <InfoBox typ="tipp">
        <strong>Zwei Schlüsselregeln für indirekte Fragen:</strong><br />
        1. Ja/Nein-Fragen → Einleitung mit <strong>ob</strong><br />
        2. W-Fragen → Einleitung mit dem <strong>gleichen W-Wort</strong><br />
        In beiden Fällen: <strong>Verb ans Ende</strong> des Nebensatzes.
      </InfoBox>
    </div>
  );
}

function Chapter2() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Direkte Ja/Nein-Fragen</h2>
      <p className="text-sm text-brand-400 mb-6">Verberststellung — das Verb steht an erster Position</p>

      <InfoBox typ="merke">
        Bei direkten Ja/Nein-Fragen steht das konjugierte Verb an <strong>erster Position</strong>. Es gibt kein Fragewort — die Antwort ist immer ja oder nein. Am Ende steht ein Fragezeichen.
      </InfoBox>

      <div className="bg-brand-950 text-white rounded-xl px-5 py-4 mb-5 font-mono text-sm">
        <p className="text-brand-300 text-[10px] uppercase tracking-widest mb-2">Struktur</p>
        <p><span className="text-gold-300">Verb</span> + Subjekt + (Objekte) + (Ergänzungen) ?</p>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Beispiele — Ja/Nein-Fragen</h3>
      <ul className="space-y-2 mb-6">
        <Beispiel label="Präsens" text={<><strong>Kommst</strong> du morgen zur Party?</>} />
        <Beispiel label="Perfekt" text={<><strong>Hat</strong> er das Buch schon gelesen?</>} />
        <Beispiel label="Modal" text={<><strong>Kann</strong> sie Klavier spielen?</>} />
        <Beispiel label="Passiv" text={<><strong>Wird</strong> das Projekt bis Freitag fertig?</>} />
        <Beispiel label="Konjunktiv" text={<><strong>Wäre</strong> es möglich, früher zu kommen?</>} />
        <Beispiel label="Negation" text={<><strong>Hast</strong> du die E-Mail nicht bekommen?</>} />
        <Beispiel label="Futur" text={<><strong>Wird</strong> er nächsten Monat zurückkommen?</>} />
      </ul>

      <InfoBox typ="achtung">
        Im Deutschen gibt es kein Do/Does/Did wie im Englischen. Die Frage entsteht allein durch die Verberststellung: <em>Du kommst. → Kommst du?</em>
      </InfoBox>

      <InfoBox typ="tipp">
        Eine Aussage wird zur Ja/Nein-Frage, indem man Verb und Subjekt einfach vertauscht:<br />
        <strong>Du kommst morgen.</strong> → <strong>Kommst du morgen?</strong><br />
        <strong>Er hat das Buch gelesen.</strong> → <strong>Hat er das Buch gelesen?</strong>
      </InfoBox>
    </div>
  );
}

function Chapter3() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Direkte W-Fragen</h2>
      <p className="text-sm text-brand-400 mb-6">W-Fragewort an erster Position, Verb an zweiter</p>

      <InfoBox typ="merke">
        Bei direkten W-Fragen steht das <strong>Fragewort an Position 1</strong>, das konjugierte Verb an <strong>Position 2</strong>. Die Antwort gibt eine konkrete Information — keine Ja/Nein-Antwort.
      </InfoBox>

      <div className="bg-brand-950 text-white rounded-xl px-5 py-4 mb-5 font-mono text-sm">
        <p className="text-brand-300 text-[10px] uppercase tracking-widest mb-2">Struktur</p>
        <p><span className="text-gold-300">W-Wort</span> + <span className="text-brand-300">Verb</span> + Subjekt + (Objekte) ?</p>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Beispiele — W-Fragen</h3>
      <ul className="space-y-2 mb-6">
        <Beispiel label="wer" text={<><strong>Wer</strong> hat das gesagt?</>} />
        <Beispiel label="was" text={<><strong>Was</strong> machst du am Wochenende?</>} />
        <Beispiel label="wo" text={<><strong>Wo</strong> wohnst du?</>} />
        <Beispiel label="wann" text={<><strong>Wann</strong> fährt der nächste Zug?</>} />
        <Beispiel label="wie" text={<><strong>Wie</strong> heißt du?</>} />
        <Beispiel label="warum" text={<><strong>Warum</strong> lernst du Deutsch?</>} />
        <Beispiel label="wohin" text={<><strong>Wohin</strong> fährst du in den Urlaub?</>} />
        <Beispiel label="womit" text={<><strong>Womit</strong> schreibst du?</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">W-Wort als Teil einer Präpositionalphrase</h3>
      <InfoBox typ="tipp">
        Bei Fragen nach Sachen, die von einer Präposition begleitet werden, nutzt man <strong>wo(r)- + Präposition</strong> anstatt Präposition + was:
      </InfoBox>
      <ul className="space-y-2 mb-4">
        <Beispiel label="richtig" text={<><strong>Womit</strong> schreibst du? (mit + was → womit)</>} />
        <Beispiel label="falsch" text={<>Mit was schreibst du? (umgangssprachlich, nicht standard)</>} />
        <Beispiel label="richtig" text={<><strong>Worüber</strong> sprichst du? (über + was → worüber)</>} />
        <Beispiel label="richtig" text={<><strong>Wofür</strong> interessierst du dich? (für + was → wofür)</>} />
        <Beispiel label="Hinweis" text={<>Beginnt die Präposition mit einem Vokal: <strong>wor-</strong> + Präp. → worauf, worin, woraus</>} />
      </ul>
    </div>
  );
}

function Chapter4() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Indirekte Fragen mit ob</h2>
      <p className="text-sm text-brand-400 mb-6">Umwandlung von Ja/Nein-Fragen in Nebensätze</p>

      <InfoBox typ="merke">
        Direkte Ja/Nein-Fragen werden in indirekte Fragen mit <strong>ob</strong> (= whether) umgewandelt. Das konjugierte Verb wandert ans <strong>Ende</strong> des Nebensatzes. Vor dem Nebensatz steht ein <strong>Komma</strong>.
      </InfoBox>

      <div className="bg-brand-950 text-white rounded-xl px-5 py-4 mb-5 font-mono text-sm">
        <p className="text-brand-300 text-[10px] uppercase tracking-widest mb-2">Struktur</p>
        <p>Hauptsatz + , + <span className="text-gold-300">ob</span> + Subjekt + … + <span className="text-brand-300">Verb</span> .</p>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Umwandlung: direkt → indirekt</h3>
      <PairBox
        direkt={<>Kommt er morgen?</>}
        indirekt={<>Ich frage mich, <strong>ob</strong> er morgen <strong>kommt</strong>.</>}
      />
      <PairBox
        direkt={<>Hat sie das Buch gelesen?</>}
        indirekt={<>Wir wissen nicht, <strong>ob</strong> sie das Buch gelesen <strong>hat</strong>.</>}
      />
      <PairBox
        direkt={<>Kann er gut kochen?</>}
        indirekt={<>Sie fragt, <strong>ob</strong> er gut kochen <strong>kann</strong>.</>}
      />
      <PairBox
        direkt={<>Wird das Projekt rechtzeitig fertig?</>}
        indirekt={<>Es ist unklar, <strong>ob</strong> das Projekt rechtzeitig fertig <strong>wird</strong>.</>}
      />
      <PairBox
        direkt={<>Hast du die E-Mail bekommen?</>}
        indirekt={<>Er fragt dich, <strong>ob</strong> du die E-Mail bekommen <strong>hast</strong>.</>}
      />

      <InfoBox typ="achtung">
        <strong>Kein Fragezeichen</strong> am Ende einer indirekten Frage! Der Hauptsatz bestimmt die Satzart. Nur wenn der Hauptsatz selbst eine Frage ist, steht ein Fragezeichen:<br />
        <em>Weißt du, ob er kommt<strong>?</strong></em> (Hier ist der Hauptsatz eine Frage.)
      </InfoBox>

      <InfoBox typ="tipp">
        Merke: <strong>ob</strong> = whether. Nie <em>wenn</em> (= when/if im Konditionalsatz) oder <em>dass</em> (= that für Aussagen) als Ersatz für ob verwenden!
      </InfoBox>
    </div>
  );
}

function Chapter5() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Indirekte W-Fragen</h2>
      <p className="text-sm text-brand-400 mb-6">W-Fragewort leitet den Nebensatz ein — Verb ans Ende</p>

      <InfoBox typ="merke">
        Direkte W-Fragen behalten ihr <strong>W-Fragewort als Einleitewort</strong> in der indirekten Frage. Das konjugierte Verb wandert ans <strong>Ende</strong> des Nebensatzes. Vor dem Nebensatz steht ein <strong>Komma</strong>.
      </InfoBox>

      <div className="bg-brand-950 text-white rounded-xl px-5 py-4 mb-5 font-mono text-sm">
        <p className="text-brand-300 text-[10px] uppercase tracking-widest mb-2">Struktur</p>
        <p>Hauptsatz + , + <span className="text-gold-300">W-Wort</span> + Subjekt + … + <span className="text-brand-300">Verb</span> .</p>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Umwandlung: direkt → indirekt</h3>
      <PairBox
        direkt={<>Wo wohnst du?</>}
        indirekt={<>Ich möchte wissen, <strong>wo</strong> du <strong>wohnst</strong>.</>}
      />
      <PairBox
        direkt={<>Wann fährt der Zug?</>}
        indirekt={<>Kannst du mir sagen, <strong>wann</strong> der Zug <strong>fährt</strong>?</>}
      />
      <PairBox
        direkt={<>Warum lernst du Deutsch?</>}
        indirekt={<>Er fragt mich, <strong>warum</strong> ich Deutsch <strong>lerne</strong>.</>}
      />
      <PairBox
        direkt={<>Wer hat das Fenster geöffnet?</>}
        indirekt={<>Wir wissen nicht, <strong>wer</strong> das Fenster geöffnet <strong>hat</strong>.</>}
      />
      <PairBox
        direkt={<>Wie lange lebst du schon hier?</>}
        indirekt={<>Sie fragt, <strong>wie lange</strong> du schon hier <strong>lebst</strong>.</>}
      />
      <PairBox
        direkt={<>Womit schreibst du?</>}
        indirekt={<>Ich frage mich, <strong>womit</strong> du <strong>schreibst</strong>.</>}
      />

      <InfoBox typ="tipp">
        Mehrteilige W-Fragewörter wie <em>wie lange, wie viel, wie oft, seit wann</em> werden <strong>zusammen als Einheit</strong> in den Nebensatz übernommen:<br />
        <em>Wie lange dauert das? → ob … — nein! → Ich frage, <strong>wie lange</strong> das dauert.</em>
      </InfoBox>
    </div>
  );
}

function Chapter6() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Einleitungssätze</h2>
      <p className="text-sm text-brand-400 mb-6">Welche Hauptsätze leiten indirekte Fragen ein</p>

      <InfoBox typ="merke">
        Indirekte Fragen werden von einem Hauptsatz eingeleitet, der ein Verb des Fragens, Wissens oder Kommunizierens enthält. Der Nebensatz folgt nach einem Komma und beginnt mit <strong>ob</strong> oder dem <strong>W-Wort</strong>.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Häufige Einleitungsformeln</h3>

      <div className="space-y-2 mb-5">
        {[
          ["Ich frage mich,", "ob/wer/was/wann …"],
          ["Ich weiß nicht,", "ob/wer/was/wann …"],
          ["Ich möchte wissen,", "ob/wer/was/wann …"],
          ["Er weiß nicht,", "ob/warum/wie …"],
          ["Wir verstehen nicht,", "warum/weshalb/wie …"],
          ["Kannst du mir sagen,", "ob/wann/wo …?"],
          ["Es ist unklar,", "ob/wer/was …"],
          ["Ich bin gespannt,", "wie/ob/was …"],
          ["Sie erklärt,", "wie/warum/wo …"],
          ["Es hängt davon ab,", "ob/wie/wann …"],
        ].map(([einl, fort]) => (
          <div key={einl} className="flex gap-2 items-baseline bg-white border border-brand-100 rounded-lg px-4 py-2">
            <span className="text-sm font-mono text-brand-800 shrink-0">{einl}</span>
            <span className="text-xs text-brand-400">{fort}</span>
          </div>
        ))}
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Indirekte Fragen als Hauptsatz-Fragen</h3>
      <InfoBox typ="tipp">
        Wenn der Einleitungssatz selbst eine Frage ist, bekommt die indirekte Frage ein <strong>Fragezeichen</strong>:
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="Frage" text={<>Weißt du, <strong>ob</strong> er kommt<strong>?</strong></>} />
        <Beispiel label="Frage" text={<>Kannst du mir sagen, <strong>wann</strong> der Kurs beginnt<strong>?</strong></>} />
        <Beispiel label="Aussage" text={<>Ich weiß nicht, ob er kommt.</>} />
        <Beispiel label="Aussage" text={<>Sie fragt, warum er nicht antwortet.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Höfliche Bitten als indirekte Fragen</h3>
      <ul className="space-y-2 mb-4">
        <Beispiel label="höflich" text={<>Könnten Sie mir sagen, <strong>wo</strong> der Bahnhof <strong>ist</strong>?</>} />
        <Beispiel label="höflich" text={<>Würden Sie mir erklären, <strong>wie</strong> das Gerät <strong>funktioniert</strong>?</>} />
        <Beispiel label="höflich" text={<>Dürfte ich fragen, <strong>wann</strong> Sie Zeit <strong>haben</strong>?</>} />
      </ul>
    </div>
  );
}

function Chapter7() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Wortstellung im Detail</h2>
      <p className="text-sm text-brand-400 mb-6">Verb-End-Stellung — alle Zeitformen und Sonderformen</p>

      <InfoBox typ="merke">
        In indirekten Fragen gilt immer die <strong>Nebensatz-Wortstellung</strong>: das konjugierte Verb steht am Ende. Das gilt für alle Zeitformen, Modalverben, Passiv und trennbare Verben.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Verb-End in verschiedenen Zeitformen</h3>

      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Zeitform</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Direkte Frage</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Indirekte Frage (Nebensatz)</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["Präsens", "Kommt er?", "ob er kommt"],
              ["Perfekt", "Ist er gekommen?", "ob er gekommen ist"],
              ["Präteritum", "Kam er?", "ob er kam"],
              ["Futur I", "Wird er kommen?", "ob er kommen wird"],
              ["Modalverb", "Kann er kommen?", "ob er kommen kann"],
              ["Passiv Präs.", "Wird es gebaut?", "ob es gebaut wird"],
              ["Trennbar", "Ruft er an?", "ob er anruft"],
            ] as [string, string, string][]).map(([zeit, direkt, indirekt], i) => (
              <tr key={zeit} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 text-xs font-semibold text-brand-600 whitespace-nowrap">{zeit}</td>
                <td className="px-3 py-2 font-mono text-xs text-brand-800">{direkt}</td>
                <td className="px-3 py-2 font-mono text-xs text-brand-700">… {indirekt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Pronomen-Anpassung</h3>
      <InfoBox typ="achtung">
        Bei der Umwandlung in eine indirekte Frage müssen Pronomen angepasst werden. Die Perspektive wechselt:
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="Direkt" text={<>Wo wohnst <strong>du</strong>?</>} />
        <Beispiel label="Indirekt" text={<>Er fragt, wo <strong>ich</strong> wohne. (wenn ich gefragt werde)</>} />
        <Beispiel label="Direkt" text={<>Was habt <strong>ihr</strong> gestern gemacht?</>} />
        <Beispiel label="Indirekt" text={<>Sie fragt, was <strong>wir</strong> gestern gemacht haben.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Indirekte Fragen ohne Einleitungssatz (elliptisch)</h3>
      <p className="text-sm text-brand-800 leading-relaxed mb-3">
        Im Alltag werden indirekte Fragen oft ohne ausgeschriebenen Hauptsatz verwendet, besonders als Rückfragen:
      </p>
      <ul className="space-y-2 mb-4">
        <Beispiel label="Ellipse" text={<>Ob das stimmt? (= Ich frage mich, ob das stimmt.)</>} />
        <Beispiel label="Ellipse" text={<>Wer das wohl gemacht hat? (rhetorisch)</>} />
        <Beispiel label="Ellipse" text={<>Wie das bloß funktioniert? (= Ich verstehe nicht, wie …)</>} />
      </ul>
    </div>
  );
}

function Chapter8() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Sonderfälle</h2>
      <p className="text-sm text-brand-400 mb-6">Besondere Konstruktionen und häufige Fehler</p>

      <h3 className="text-base font-semibold text-brand-900 mb-3">1. Verschachtelte indirekte Fragen</h3>
      <p className="text-sm text-brand-800 leading-relaxed mb-3">
        Indirekte Fragen können selbst Nebensätze enthalten. Das Verb des innersten Satzes steht ganz am Ende:
      </p>
      <ul className="space-y-2 mb-5">
        <Beispiel label="Einfach" text={<>Ich frage, ob er kommt.</>} />
        <Beispiel label="Komplex" text={<>Ich frage, ob er kommt, wenn er Zeit hat.</>} />
        <Beispiel label="Komplex" text={<>Ich weiß nicht, ob sie weiß, dass er krank ist.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">2. Indirekte Fragen mit Konjunktiv I (Indirekte Rede)</h3>
      <InfoBox typ="merke">
        In der formellen Schriftsprache (Zeitungsartikel, Berichte) werden indirekte Fragen manchmal mit <strong>Konjunktiv I</strong> formuliert — besonders wenn man wiedergibt, was jemand anderes gefragt hat.
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="Normal" text={<>Er fragt, ob sie kommen kann.</>} />
        <Beispiel label="Konj. I" text={<>Er fragte, ob sie kommen könne. (formell)</>} />
        <Beispiel label="Normal" text={<>Sie fragt, wann das Ergebnis bekanntgegeben wird.</>} />
        <Beispiel label="Konj. I" text={<>Sie fragte, wann das Ergebnis bekanntgegeben werde.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">3. ob … oder … (Alternative)</h3>
      <InfoBox typ="tipp">
        Mit <strong>ob … oder …</strong> lassen sich Alternativfragen bilden:
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="—" text={<>Ich frage, <strong>ob</strong> er kommt <strong>oder</strong> nicht.</>} />
        <Beispiel label="—" text={<>Es ist unklar, <strong>ob</strong> sie bleibt <strong>oder</strong> geht.</>} />
        <Beispiel label="—" text={<>Wir wissen nicht, <strong>ob</strong> er Student <strong>oder</strong> Lehrer ist.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">4. Häufige Fehler</h3>

      <InfoBox typ="falsch">
        <strong>Falsche Verbstellung:</strong><br />
        <em>Ich weiß nicht, ob kommt er morgen.</em> ✗<br />
        Richtig: <em>Ich weiß nicht, ob er morgen <strong>kommt</strong>.</em>
      </InfoBox>

      <InfoBox typ="falsch">
        <strong>ob statt W-Wort:</strong><br />
        <em>Ich frage, ob wann er kommt.</em> ✗<br />
        Richtig: <em>Ich frage, <strong>wann</strong> er kommt.</em>
      </InfoBox>

      <InfoBox typ="falsch">
        <strong>Fragezeichen am Ende:</strong><br />
        <em>Ich weiß nicht, ob er kommt?</em> ✗<br />
        Richtig: <em>Ich weiß nicht, ob er kommt<strong>.</strong></em>
      </InfoBox>

      <InfoBox typ="falsch">
        <strong>Kein Komma vor dem Nebensatz:</strong><br />
        <em>Ich weiß nicht ob er kommt.</em> ✗<br />
        Richtig: <em>Ich weiß nicht<strong>,</strong> ob er kommt.</em>
      </InfoBox>
    </div>
  );
}

function Chapter9() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Tipps & Tricks</h2>
      <p className="text-sm text-brand-400 mb-6">Lernstrategien, Eselsbrücken und häufige Prüfungsfehler</p>

      <InfoBox typ="tipp">
        <strong>Tipp 1 — Ja/Nein-Test:</strong> Könnte die direkte Frage mit ja oder nein beantwortet werden? Dann → <strong>ob</strong>. Enthält sie ein W-Wort? Dann → das gleiche <strong>W-Wort</strong>.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 2 — Verb ans Ende schicken:</strong> Nimm die direkte Frage, stell das Verb ans Ende und setze ob oder das W-Wort davor. Fertig. <em>Kommt er? → ob er kommt.</em>
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 3 — Kein Fragezeichen:</strong> Indirekte Fragen sind Nebensätze, keine Fragesätze. Am Ende steht immer ein Punkt — außer der Hauptsatz selbst ist eine Frage.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 4 — ob ≠ wenn:</strong> <em>wenn</em> = when (Zeit) oder if (Bedingung). <em>ob</em> = whether (Ungewissheit). Verwechsle sie nicht: <em>Ich frage, ob er kommt</em> (nicht: <em>wenn er kommt</em>).
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 5 — wo(r)- Komposita:</strong> Bei Fragen nach Sachen mit Präposition: <strong>wo + Präposition</strong> (womit, wofür, worüber …). Beginnt die Präposition mit Vokal: <strong>wor- + Präposition</strong> (worauf, worin, woraus). Merke: kein Präp. + was!
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 6 — Perspektivwechsel nicht vergessen:</strong> Wenn du eine direkte Frage in eine indirekte umwandelst, passe Personalpronomen und Possessivpronomen an die neue Sprecherperspektive an.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 7 — Lernstrategie Umformungsübung:</strong> Nimm jeden Tag 5 Fragen aus einem Buch oder Film und forme sie in indirekte Fragen um. Diese aktive Übung trainiert das Muster schneller als passives Lesen.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-2">Schnellübersicht — Die wichtigsten Regeln</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Direkter Fragetyp</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Einleitewort</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Verbposition</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Satzzeichen</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["Ja/Nein-Frage", "ob", "am Ende", ". (oder ? wenn Hauptsatz Frage)"],
              ["W-Frage", "W-Wort (gleich wie direkt)", "am Ende", ". (oder ?)"],
              ["Alternativfrage", "ob … oder …", "am Ende", ". (oder ?)"],
            ] as [string, string, string, string][]).map(([t, e, v, z], i) => (
              <tr key={t} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 text-xs text-brand-800 font-semibold">{t}</td>
                <td className="px-3 py-2 font-mono text-xs text-brand-700">{e}</td>
                <td className="px-3 py-2 text-xs text-brand-800">{v}</td>
                <td className="px-3 py-2 text-xs text-brand-600">{z}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chapter10() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return KATEGORIEN;
    return KATEGORIEN.map((cat) => ({
      ...cat,
      entries: cat.entries.filter(
        (e) =>
          e.wort.toLowerCase().includes(q) ||
          e.bedeutung.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.entries.length > 0);
  }, [query]);

  const totalCount = KATEGORIEN.reduce((acc, cat) => acc + cat.entries.length, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Wortliste & Referenz</h2>
      <p className="text-sm text-brand-400 mb-4">{totalCount} Einträge · W-Fragewörter · Verben · Einleitungssätze</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
        <input
          type="text"
          placeholder="Fragewort oder Bedeutung suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-200 text-sm text-brand-800 placeholder:text-brand-300 focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex gap-4 mb-5 text-[10px] text-brand-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-2 border-l-orange-400 bg-orange-50 inline-block" />
          ob (Sonderfall)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-2 border-l-brand-500 bg-brand-50 inline-block" />
          Einleiteverb / -satz
        </span>
      </div>

      {filtered.map((cat) => (
        <div key={cat.name} className="mb-6">
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-2">{cat.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cat.entries.map((e) => {
              const cardStyle =
                e.typ === "ob"        ? "border-l-4 border-l-orange-400 bg-orange-50" :
                e.typ === "einleitung"? "border-l-4 border-l-brand-500 bg-brand-50"   :
                                       "bg-white border border-brand-100";
              return (
                <div key={e.wort} className={`rounded-xl px-3 py-2 ${cardStyle}`}>
                  <p className="font-semibold text-sm text-brand-900 font-mono">{e.wort}</p>
                  <p className="text-xs text-brand-400 mt-0.5 leading-tight">{e.bedeutung}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Chapter11() {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (qIdx: number, aIdx: number) => {
    if (answers[qIdx] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: aIdx }));
  };

  const reset = () => setAnswers({});
  const answered = Object.keys(answers).length;
  const score = QUIZ.reduce((acc, q, i) => acc + (answers[i] === q.richtig ? 1 : 0), 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Übungen</h2>
      <p className="text-sm text-brand-400 mb-6">{QUIZ.length} Aufgaben zu direkten und indirekten Fragen</p>

      {answered === QUIZ.length && (
        <div className="mb-6 bg-brand-50 border border-brand-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-900">Ergebnis: {score} / {QUIZ.length}</p>
            <p className="text-xs text-brand-400 mt-0.5">
              {score === QUIZ.length
                ? "Perfekt! Alle Antworten richtig!"
                : score >= Math.ceil(QUIZ.length * 0.7)
                ? "Sehr gut — noch ein paar Korrekturen nötig."
                : "Wiederhole die Kapitel und versuche es nochmal!"}
            </p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-medium hover:bg-brand-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Neu starten
          </button>
        </div>
      )}

      <div className="space-y-6">
        {QUIZ.map((q, qi) => {
          const chosen = answers[qi];
          const isAnswered = chosen !== undefined;

          return (
            <div key={qi} className="bg-white border border-brand-100 rounded-2xl px-5 py-4">
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">
                Aufgabe {qi + 1}
              </p>
              <p className="text-sm text-brand-800 mb-3 leading-relaxed">{q.frage}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {q.optionen.map((opt, ai) => {
                  let style =
                    "border border-brand-100 text-brand-700 hover:border-brand-300 cursor-pointer";
                  if (isAnswered) {
                    if (ai === q.richtig)
                      style = "border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                    else if (ai === chosen)
                      style = "border-2 border-red-400 bg-red-50 text-red-700";
                    else
                      style = "border border-brand-100 text-brand-400 opacity-60";
                  }
                  return (
                    <button
                      key={ai}
                      onClick={() => handleAnswer(qi, ai)}
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-all font-mono ${style}`}
                    >
                      {isAnswered && ai === q.richtig && (
                        <CheckCircle className="w-3 h-3 inline mr-1 text-emerald-500" />
                      )}
                      {isAnswered && ai === chosen && ai !== q.richtig && (
                        <XCircle className="w-3 h-3 inline mr-1 text-red-400" />
                      )}
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div
                  className={`border-l-4 rounded-r-lg px-3 py-2 text-xs leading-relaxed ${
                    chosen === q.richtig
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-red-50 border-red-400 text-red-800"
                  }`}
                >
                  {q.erklaerung}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chapter 11: Zusammenfassung ─────────────────────────────────────────────

function ChapterZusammenfassung() {
  const rows: [string, string, string, string][] = [
    ["Ja/Nein", "Kommt er morgen?", "ob", "Ich frage, ob er morgen kommt."],
    ["Ja/Nein + Modal", "Kann sie kommen?", "ob", "Ich frage, ob sie kommen kann."],
    ["Ja/Nein Perfekt", "Hat er angerufen?", "ob", "Er fragt, ob er angerufen hat."],
    ["NOM — Person", "Wer kommt?", "wer", "Ich weiß nicht, wer kommt."],
    ["AKK — Person", "Wen siehst du?", "wen", "Er fragt, wen ich sehe."],
    ["DAT — Person", "Wem hilfst du?", "wem", "Sie fragt, wem ich helfe."],
    ["Sache / Objekt", "Was machst du?", "was", "Ich frage, was du machst."],
    ["Ort (statisch)", "Wo wohnst du?", "wo", "Er fragt, wo ich wohne."],
    ["Richtung", "Wohin fährst du?", "wohin", "Sie fragt, wohin ich fahre."],
    ["Herkunft", "Woher kommst du?", "woher", "Ich frage, woher er kommt."],
    ["Zeit", "Wann fängt es an?", "wann", "Er fragt, wann es anfängt."],
    ["Dauer", "Wie lange bleibst du?", "wie lange", "Sie fragt, wie lange ich bleibe."],
    ["Grund", "Warum weinst du?", "warum / weshalb", "Er fragt, warum ich weine."],
    ["Art & Weise", "Wie machst du das?", "wie", "Ich frage, wie du das machst."],
    ["Menge", "Wie viel kostet es?", "wie viel", "Er fragt, wie viel es kostet."],
    ["Auswahl", "Welches Buch liest du?", "welches", "Sie fragt, welches Buch ich lese."],
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Zusammenfassung</h2>
      <p className="text-sm text-brand-400 mb-6">Alle Fragetypen — direkt und indirekt auf einen Blick</p>

      <InfoBox typ="merke">
        Indirekte Fragen sind Nebensätze: das <strong>Verb steht am Ende</strong>, ein
        <strong> Komma</strong> trennt Haupt- und Nebensatz, und das Fragewort (oder <em>ob</em> bei Ja/Nein-Fragen)
        leitet den Nebensatz ein. Das direkte Fragezeichen entfällt.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Umwandlungstabelle: Alle Fragetypen</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap">Fragetyp</th>
              <th className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap">Direkte Frage</th>
              <th className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap">Einleitewort</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Indirekte Frage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([typ, direkt, einleit, indirekt], i) => (
              <tr key={typ} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs whitespace-nowrap">{typ}</td>
                <td className="px-3 py-2 text-brand-800 italic whitespace-nowrap">{direkt}</td>
                <td className="px-3 py-2 font-mono text-brand-700 font-bold whitespace-nowrap">{einleit}</td>
                <td className="px-3 py-2 text-brand-800">{indirekt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-6">Wortstellung im Vergleich</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left font-medium text-xs">Satztyp</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Position 1</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Position 2 (Verb)</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Ende</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Direkte Frage", "Verb / W-Wort", "Subjekt", "—"],
              ["Indirekte Frage", "ob / W-Wort", "Subjekt …", "Verb"],
              ["Hauptsatz", "Subjekt / Adverb", "Verb", "Rest"],
            ].map(([typ, p1, p2, end], i) => (
              <tr key={typ} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs">{typ}</td>
                <td className="px-3 py-2 text-brand-800">{p1}</td>
                <td className="px-3 py-2 text-brand-800">{p2}</td>
                <td className="px-3 py-2 text-brand-800 font-bold">{end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox typ="tipp">
        Häufige Einleitungssätze: <em>Ich frage mich, …</em> · <em>Kannst du mir sagen, …</em> ·
        <em> Weißt du, …</em> · <em>Ich weiß nicht, …</em> · <em>Es ist unklar, …</em>
      </InfoBox>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const TABS = [
  "1. Einführung",
  "2. Ja/Nein-Fragen",
  "3. W-Fragen",
  "4. Indirekt mit ob",
  "5. Indirekte W-Fragen",
  "6. Einleitungssätze",
  "7. Wortstellung",
  "8. Sonderfälle",
  "9. Tipps & Tricks",
  "10. Wortliste",
  "11. Zusammenfassung",
  "12. Übungen",
];

const CHAPTERS = [
  Chapter1,
  Chapter2,
  Chapter3,
  Chapter4,
  Chapter5,
  Chapter6,
  Chapter7,
  Chapter8,
  Chapter9,
  Chapter10,
  ChapterZusammenfassung,
  Chapter11,
];

export function DirektIndirekteFragenClient() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveChapter = CHAPTERS[activeTab];

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-2">
        <h1 className="text-3xl font-bold text-brand-950 mb-1">Direkte & Indirekte Fragen</h1>
        <p className="text-sm text-brand-400 mb-1">Wortstellung · ob · W-Fragewörter · Einleitungssätze</p>
        <div className="h-1 w-12 rounded-full bg-gold-500" />
      </div>

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ActiveChapter />
      </div>
    </div>
  );
}
