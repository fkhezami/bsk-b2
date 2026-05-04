"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InfoTyp = "merke" | "tipp" | "achtung" | "richtig" | "falsch";
type KonnektorTyp = "subjunktion" | "konjunktionaladverb" | "zweiteilig";

interface KonnektorEntry {
  wort: string;
  bedeutung: string;
  typ?: KonnektorTyp;
}

interface KonnektorCategory {
  name: string;
  entries: KonnektorEntry[];
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

function TypBadge({ typ }: { typ: KonnektorTyp | undefined }) {
  if (!typ) return <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 font-bold uppercase tracking-wide">Konjunktion</span>;
  if (typ === "subjunktion") return <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase tracking-wide">Subjunktion</span>;
  if (typ === "konjunktionaladverb") return <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold uppercase tracking-wide">Konj.-Adverb</span>;
  return <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold uppercase tracking-wide border border-brand-200">Zweiteilig</span>;
}

// Shows 3 ways to express the same idea — Subjunktion / Konjunktion / Konjunktionaladverb
function TrioBox({
  label,
  subjunktion,
  konjunktion,
  adverb,
}: {
  label?: string;
  subjunktion: React.ReactNode;
  konjunktion: React.ReactNode;
  adverb: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      {label && <p className="text-xs text-brand-400 mb-1.5 font-semibold">{label}</p>}
      <div className="rounded-xl overflow-hidden border border-brand-100">
        <div className="flex items-start gap-3 px-4 py-2.5 bg-red-50 border-b border-red-100">
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-red-500 pt-0.5 w-20">Subjunktion</span>
          <span className="text-sm text-brand-800 font-mono leading-snug">{subjunktion}</span>
        </div>
        <div className="flex items-start gap-3 px-4 py-2.5 bg-white border-b border-brand-50">
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-brand-500 pt-0.5 w-20">Konjunktion</span>
          <span className="text-sm text-brand-800 font-mono leading-snug">{konjunktion}</span>
        </div>
        <div className="flex items-start gap-3 px-4 py-2.5 bg-orange-50">
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-orange-600 pt-0.5 w-20">Konj.-Adverb</span>
          <span className="text-sm text-brand-800 font-mono leading-snug">{adverb}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Word List Data (102 Konnektoren) ────────────────────────────────────────

const KATEGORIEN: KonnektorCategory[] = [
  {
    name: "Koordinierende Konjunktionen",
    entries: [
      { wort: "und", bedeutung: "and — additive (joins equal elements, V2 in both clauses)" },
      { wort: "aber", bedeutung: "but — adversative contrast" },
      { wort: "oder", bedeutung: "or — alternative" },
      { wort: "denn", bedeutung: "because — causal (Hauptsatz word order! = weil but V2)" },
      { wort: "sondern", bedeutung: "but rather — corrective (used after negation: nicht X, sondern Y)" },
      { wort: "doch", bedeutung: "but / yet — adversative (stronger than aber)" },
      { wort: "beziehungsweise", bedeutung: "or respectively / that is to say (abbr. bzw.)" },
    ],
  },
  {
    name: "Kausalität — Grund & Ursache",
    entries: [
      { wort: "weil", bedeutung: "because (Verb-Ende — neue Information)", typ: "subjunktion" },
      { wort: "da", bedeutung: "since / as (Verb-Ende — bekannter Grund, oft satzeröffnend)", typ: "subjunktion" },
      { wort: "zumal", bedeutung: "especially since / all the more as (Verb-Ende, verstärkend)", typ: "subjunktion" },
      { wort: "deshalb", bedeutung: "therefore / that is why (Verb-2 nach Adverb)", typ: "konjunktionaladverb" },
      { wort: "daher", bedeutung: "therefore / hence (Verb-2, etwas formeller als deshalb)", typ: "konjunktionaladverb" },
      { wort: "deswegen", bedeutung: "because of that / therefore (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "darum", bedeutung: "therefore / that is why (Verb-2, umgangssprachlicher)", typ: "konjunktionaladverb" },
      { wort: "nämlich", bedeutung: "you see / namely (steht NACH dem Verb im Mittelfeld!)", typ: "konjunktionaladverb" },
      { wort: "aus diesem Grund", bedeutung: "for this reason (Verb-2, formell)", typ: "konjunktionaladverb" },
      { wort: "infolgedessen", bedeutung: "as a result / consequently (Verb-2, sehr formal)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Temporalität — Zeit & Abfolge",
    entries: [
      { wort: "als", bedeutung: "when — einmaliges Ereignis in der Vergangenheit (Verb-Ende)", typ: "subjunktion" },
      { wort: "wenn", bedeutung: "when / whenever — Gegenwart, Zukunft oder Wiederholung (Verb-Ende)", typ: "subjunktion" },
      { wort: "während", bedeutung: "while — Gleichzeitigkeit (Verb-Ende)", typ: "subjunktion" },
      { wort: "bevor", bedeutung: "before — Vorzeitigkeit des Hauptsatzes (Verb-Ende)", typ: "subjunktion" },
      { wort: "ehe", bedeutung: "before (Verb-Ende, literarischer als bevor)", typ: "subjunktion" },
      { wort: "nachdem", bedeutung: "after — Vorzeitigkeit des Nebensatzes, Plusquamperfekt! (Verb-Ende)", typ: "subjunktion" },
      { wort: "seitdem", bedeutung: "since / ever since (Verb-Ende)", typ: "subjunktion" },
      { wort: "seit", bedeutung: "since (Verb-Ende, Kurzform von seitdem)", typ: "subjunktion" },
      { wort: "bis", bedeutung: "until (Verb-Ende)", typ: "subjunktion" },
      { wort: "sobald", bedeutung: "as soon as (Verb-Ende)", typ: "subjunktion" },
      { wort: "solange", bedeutung: "as long as (Verb-Ende)", typ: "subjunktion" },
      { wort: "kaum dass", bedeutung: "hardly / scarcely had … when (Verb-Ende)", typ: "subjunktion" },
      { wort: "zunächst", bedeutung: "first / initially (Verb-2 nach Adverb)", typ: "konjunktionaladverb" },
      { wort: "danach", bedeutung: "afterwards / then (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "anschließend", bedeutung: "subsequently / following that (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "zuvor", bedeutung: "before / previously (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "gleichzeitig", bedeutung: "simultaneously / at the same time (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "währenddessen", bedeutung: "meanwhile / in the meantime (Verb-2)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Konzessivität — Einräumung & Gegengrund",
    entries: [
      { wort: "obwohl", bedeutung: "although / even though (Verb-Ende)", typ: "subjunktion" },
      { wort: "obgleich", bedeutung: "although (Verb-Ende, formeller als obwohl)", typ: "subjunktion" },
      { wort: "obschon", bedeutung: "although (Verb-Ende, sehr formal / literarisch)", typ: "subjunktion" },
      { wort: "wenngleich", bedeutung: "although / even though (Verb-Ende, formal)", typ: "subjunktion" },
      { wort: "auch wenn", bedeutung: "even if / even though (Verb-Ende)", typ: "subjunktion" },
      { wort: "trotzdem", bedeutung: "nevertheless / despite that (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "dennoch", bedeutung: "nevertheless / yet (Verb-2, formeller als trotzdem)", typ: "konjunktionaladverb" },
      { wort: "gleichwohl", bedeutung: "nonetheless (Verb-2, sehr formal)", typ: "konjunktionaladverb" },
      { wort: "nichtsdestotrotz", bedeutung: "nonetheless / notwithstanding (Verb-2)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Adversativität — Gegensatz & Kontrast",
    entries: [
      { wort: "während", bedeutung: "whereas / while (adversativ — Verb-Ende)", typ: "subjunktion" },
      { wort: "wohingegen", bedeutung: "whereas / while in contrast (Verb-Ende, formal)", typ: "subjunktion" },
      { wort: "jedoch", bedeutung: "however / but (Verb-2 oder im Mittelfeld)", typ: "konjunktionaladverb" },
      { wort: "allerdings", bedeutung: "however / admittedly (Verb-2 oder im Mittelfeld)", typ: "konjunktionaladverb" },
      { wort: "hingegen", bedeutung: "on the other hand / by contrast (Verb-2 oder im Mittelfeld)", typ: "konjunktionaladverb" },
      { wort: "dagegen", bedeutung: "on the contrary / against it (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "im Gegensatz dazu", bedeutung: "in contrast to that (Verb-2, formell)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Konditionalität — Bedingung",
    entries: [
      { wort: "wenn", bedeutung: "if / when — Bedingung oder Zeit (Verb-Ende)", typ: "subjunktion" },
      { wort: "falls", bedeutung: "if / in case — Bedingung (Verb-Ende, formal)", typ: "subjunktion" },
      { wort: "sofern", bedeutung: "provided that / as long as (Verb-Ende)", typ: "subjunktion" },
      { wort: "vorausgesetzt dass", bedeutung: "provided that / on condition that (Verb-Ende)", typ: "subjunktion" },
      { wort: "angenommen dass", bedeutung: "assuming that (Verb-Ende)", typ: "subjunktion" },
      { wort: "es sei denn", bedeutung: "unless — negative Bedingung (Verb-Ende)", typ: "subjunktion" },
      { wort: "sonst", bedeutung: "otherwise / or else (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "andernfalls", bedeutung: "otherwise / failing that (Verb-2, formell)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Finalität — Zweck & Absicht",
    entries: [
      { wort: "damit", bedeutung: "so that / in order that (Verb-Ende — verschiedene Subjekte möglich)", typ: "subjunktion" },
      { wort: "auf dass", bedeutung: "so that / in order that (Verb-Ende, altertümlich / religiös)", typ: "subjunktion" },
      { wort: "um … zu", bedeutung: "in order to (Infinitiv — NUR bei gleichem Subjekt!)", typ: "zweiteilig" },
      { wort: "zum Zweck (+ GEN)", bedeutung: "for the purpose of (Präpositionalphrase, formal)" },
      { wort: "mit dem Ziel (+ GEN)", bedeutung: "with the goal of (Präpositionalphrase, formal)" },
    ],
  },
  {
    name: "Konsekutivität — Folge & Ergebnis",
    entries: [
      { wort: "sodass", bedeutung: "so that / with the result that (Verb-Ende)", typ: "subjunktion" },
      { wort: "so … dass", bedeutung: "so … that (Verb-Ende — zweiteilig mit Gradangabe)", typ: "zweiteilig" },
      { wort: "folglich", bedeutung: "consequently / as a result (Verb-2, formal)", typ: "konjunktionaladverb" },
      { wort: "demnach", bedeutung: "accordingly / therefore (Verb-2, formal)", typ: "konjunktionaladverb" },
      { wort: "somit", bedeutung: "thus / therefore / hence (Verb-2, formal)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Modalität — Art & Weise & Mittel",
    entries: [
      { wort: "indem", bedeutung: "by (doing) — Mittel/Methode (Verb-Ende)", typ: "subjunktion" },
      { wort: "dadurch dass", bedeutung: "by the fact that / through (Verb-Ende)", typ: "subjunktion" },
      { wort: "ohne dass", bedeutung: "without (someone doing) — verschiedene Subjekte (Verb-Ende)", typ: "subjunktion" },
      { wort: "ohne … zu", bedeutung: "without doing — gleiches Subjekt (Infinitiv)", typ: "zweiteilig" },
      { wort: "anstatt dass", bedeutung: "instead of (someone doing) — verschiedene Subjekte (Verb-Ende)", typ: "subjunktion" },
      { wort: "anstatt … zu", bedeutung: "instead of doing — gleiches Subjekt (Infinitiv)", typ: "zweiteilig" },
      { wort: "je nachdem ob", bedeutung: "depending on whether (Verb-Ende)", typ: "subjunktion" },
    ],
  },
  {
    name: "Additivität — Ergänzung",
    entries: [
      { wort: "außerdem", bedeutung: "moreover / furthermore / in addition (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "zudem", bedeutung: "furthermore / moreover (Verb-2, formeller)", typ: "konjunktionaladverb" },
      { wort: "darüber hinaus", bedeutung: "beyond that / furthermore (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "ferner", bedeutung: "furthermore / additionally (Verb-2, formal)", typ: "konjunktionaladverb" },
      { wort: "überdies", bedeutung: "moreover / besides (Verb-2, formal)", typ: "konjunktionaladverb" },
      { wort: "obendrein", bedeutung: "on top of that / to boot (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "ebenfalls", bedeutung: "likewise / also / as well (Verb-2 oder im Mittelfeld)", typ: "konjunktionaladverb" },
      { wort: "ebenso", bedeutung: "likewise / similarly / just as (Verb-2)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Restriktivität & Alternativität",
    entries: [
      { wort: "außer dass", bedeutung: "except that (Verb-Ende)", typ: "subjunktion" },
      { wort: "außer wenn", bedeutung: "except when / unless (Verb-Ende)", typ: "subjunktion" },
      { wort: "abgesehen davon dass", bedeutung: "apart from the fact that (Verb-Ende)", typ: "subjunktion" },
      { wort: "nur dass", bedeutung: "only that / except that (Verb-Ende)", typ: "subjunktion" },
      { wort: "andernfalls", bedeutung: "otherwise / failing that (Verb-2)", typ: "konjunktionaladverb" },
      { wort: "sonst", bedeutung: "otherwise / or else (Verb-2)", typ: "konjunktionaladverb" },
    ],
  },
  {
    name: "Zweiteilige Konnektoren",
    entries: [
      { wort: "sowohl … als auch", bedeutung: "both … and — beide treffen zu (Addition)", typ: "zweiteilig" },
      { wort: "weder … noch", bedeutung: "neither … nor — beide werden verneint", typ: "zweiteilig" },
      { wort: "entweder … oder", bedeutung: "either … or — Auswahl zwischen Alternativen", typ: "zweiteilig" },
      { wort: "nicht nur … sondern auch", bedeutung: "not only … but also — verstärkte Addition", typ: "zweiteilig" },
      { wort: "zwar … aber", bedeutung: "admittedly … but — konzessive Einschränkung", typ: "zweiteilig" },
      { wort: "je … desto", bedeutung: "the more … the more — Proportionalität (Nebensatz + Hauptsatz)", typ: "zweiteilig" },
      { wort: "je … umso", bedeutung: "the more … the more — Proportionalität (Variante zu je…desto)", typ: "zweiteilig" },
      { wort: "einerseits … andererseits", bedeutung: "on the one hand … on the other — Abwägung", typ: "zweiteilig" },
      { wort: "zum einen … zum anderen", bedeutung: "for one thing … for another — Aufzählung", typ: "zweiteilig" },
      { wort: "teils … teils", bedeutung: "partly … partly — gemischte Aussage", typ: "zweiteilig" },
    ],
  },
];

// ─── Quiz Data (15 Fragen) ────────────────────────────────────────────────────

const QUIZ: QuizQuestion[] = [
  {
    frage: "Er bleibt zuhause, ___ er krank ist. (Verb am Ende — Nebensatz)",
    optionen: ["weil", "deshalb", "denn", "trotzdem"],
    richtig: 0,
    erklaerung: "'weil' ist eine Subjunktion und leitet einen Nebensatz ein: das Verb steht am Ende. 'denn' waere korrekt mit Hauptsatz-Wortstellung: 'Er bleibt zuhause, denn er ist krank.' 'deshalb' steht an Pos. 1 und braucht kein Komma davor.",
  },
  {
    frage: "Er ist krank. ___ bleibt er zuhause. (Konjunktionaladverb an Pos. 1)",
    optionen: ["Deshalb", "Weil", "Obwohl", "Da"],
    richtig: 0,
    erklaerung: "'Deshalb' ist ein Konjunktionaladverb. Es steht an Position 1 und das Verb folgt direkt danach (Verb-2): 'Deshalb bleibt er zuhause.' Das Subjekt rueckt nach dem Verb.",
  },
  {
    frage: "Welcher Satz ist grammatisch korrekt?",
    optionen: [
      "Er bleibt zuhause, weil er ist krank.",
      "Er bleibt zuhause, denn er ist krank.",
      "Er bleibt zuhause, deshalb er ist krank.",
      "Er bleibt zuhause, obwohl denn er krank.",
    ],
    richtig: 1,
    erklaerung: "'denn' ist eine koordinierende Konjunktion mit normaler Hauptsatz-Wortstellung (V2): 'denn er ist krank'. 'weil' wuerde Verb-Ende verlangen: 'weil er krank ist'. 'deshalb' steht nicht zwischen zwei Hauptsaetzen mit Komma.",
  },
  {
    frage: "___ ich klein war, wohnte ich in Muenchen. (einmaliges Ereignis, Vergangenheit)",
    optionen: ["Als", "Wenn", "Waehrend", "Seitdem"],
    richtig: 0,
    erklaerung: "'als' verwendet man fuer einmalige Ereignisse in der Vergangenheit. 'wenn' steht fuer wiederholte Handlungen in der Vergangenheit ('Wenn ich Ferien hatte, fuhr ich ans Meer') oder fuer Gegenwart und Zukunft.",
  },
  {
    frage: "Er hat kein Geld. ___ kauft er ein neues Auto.",
    optionen: ["Trotzdem", "Obwohl", "Weil", "Seitdem"],
    richtig: 0,
    erklaerung: "'Trotzdem' ist ein Konjunktionaladverb (Verb-2 danach). 'Obwohl' wuerde einen Nebensatz einleiten: 'Obwohl er kein Geld hat, kauft er ein neues Auto.' Beide sind konzessiv, aber verschiedene Typen.",
  },
  {
    frage: "Ich lerne fleissig, ___ ich die Pruefung bestehe. (Zweck, unterschiedliche Subjekte moeglich)",
    optionen: ["damit", "weil", "sodass", "obwohl"],
    richtig: 0,
    erklaerung: "'damit' drueckt Finalitaet (Zweck/Absicht) aus und leitet einen Nebensatz ein (Verb-Ende). 'sodass' wuerde eine Folge/Konsequenz ausdruecken, nicht eine Absicht. 'um...zu' geht nur bei gleichem Subjekt.",
  },
  {
    frage: "Sie spricht ___ Englisch ___ Franzoesisch. (beide treffen zu)",
    optionen: ["sowohl / als auch", "weder / noch", "entweder / oder", "nicht nur / sondern"],
    richtig: 0,
    erklaerung: "'sowohl...als auch' bedeutet 'both...and' — beide Alternativen treffen zu. 'weder...noch' wuerde beides verneinen. 'entweder...oder' schlaegt eine Auswahl vor.",
  },
  {
    frage: "Er mag ___ Kaffee ___ Tee. (beide werden abgelehnt)",
    optionen: ["weder / noch", "sowohl / als auch", "entweder / oder", "nicht nur / sondern auch"],
    richtig: 0,
    erklaerung: "'weder...noch' = 'neither...nor' — beide Optionen werden verneint. Das Verb bleibt positiv, die Verneinung steckt in 'weder...noch'.",
  },
  {
    frage: "___ mehr du uebst, ___ besser wird dein Deutsch.",
    optionen: ["Je / desto", "Sowohl / als auch", "Entweder / oder", "Zwar / aber"],
    richtig: 0,
    erklaerung: "'je...desto' drueckt Proportionalitaet aus. Struktur: je + Komparativ + Nebensatz (Verb-Ende), + desto + Komparativ + Verb + Subjekt (Hauptsatz). Beides sind Komparativformen.",
  },
  {
    frage: "___ er gegessen hatte, ging er spazieren. (Plusquamperfekt im Nebensatz)",
    optionen: [
      "Nachdem er gegessen hatte, ging er spazieren.",
      "Nachdem er hatte gegessen, ging er spazieren.",
      "Nachdem hatte er gegessen, ging er spazieren.",
      "Nachdem er gegessen hatte gegangen er.",
    ],
    richtig: 0,
    erklaerung: "'nachdem' ist eine Subjunktion: Verb ans Ende des Nebensatzes. Bei zweiteiligen Verbformen (Plusquamperfekt) geht das Hilfsverb ganz ans Ende: 'gegessen hatte'. Der Hauptsatz folgt mit normaler Wortstellung.",
  },
  {
    frage: "Er hat sehr viel gearbeitet, ___ er voellig erschoepft ist. (Konsequenz/Folge)",
    optionen: ["sodass", "damit", "obwohl", "falls"],
    richtig: 0,
    erklaerung: "'sodass' drueckt eine Folge/Konsequenz aus (= 'so that / as a result'). 'damit' wuerde eine Absicht/Zweck ausdruecken. 'sodass' leitet einen Nebensatz ein (Verb am Ende).",
  },
  {
    frage: "Er hat das Ziel erreicht, ___ er taeglich trainierte. (Mittel/Methode)",
    optionen: ["indem", "obwohl", "sodass", "damit"],
    richtig: 0,
    erklaerung: "'indem' drueckt die Art und Weise / das Mittel aus, durch das etwas erreicht wird (= 'by doing'). Es leitet einen Nebensatz ein (Verb-Ende): 'indem er taeglich trainierte'.",
  },
  {
    frage: "Was ist 'jedoch'?",
    optionen: [
      "Subjunktion (leitet Nebensatz ein, Verb-Ende)",
      "Koordinierende Konjunktion (V2 in beiden Sätzen)",
      "Konjunktionaladverb (steht an Pos. 1 oder im Mittelfeld, V2)",
      "Zweiteiliger Konnektor",
    ],
    richtig: 2,
    erklaerung: "'jedoch' ist ein Konjunktionaladverb (adversativ = aber/trotzdem). Es kann an Position 1 stehen (Verb danach) oder im Mittelfeld nach dem Verb. Es leitet keinen Nebensatz ein und ist keine koordinierende Konjunktion.",
  },
  {
    frage: "Er ist fleissig, ___ etwas naiiv. ('zwar...aber' — Teilsatz 2)",
    optionen: ["zwar / aber", "sowohl / als auch", "nicht nur / sondern auch", "weder / noch"],
    richtig: 0,
    erklaerung: "'zwar...aber' drückt eine Einräumung mit Einschränkung aus (= 'admittedly...but'): man gibt etwas zu (zwar), schränkt es aber ein (aber). 'sowohl...als auch' wäre rein additiv ohne Einschränkung.",
  },
  {
    frage: "Er lernt Deutsch, ___ er die Stellen in der Firma bewerben kann. (Zweck, gleiches Subjekt)",
    optionen: [
      "um sich … zu bewerben",
      "damit sich … zu bewerben",
      "sodass er … bewerben",
      "obwohl er … bewerben",
    ],
    richtig: 0,
    erklaerung: "Bei gleichem Subjekt im Haupt- und Zwecksatz verwendet man 'um...zu' mit Infinitiv: 'um sich bei der Stelle zu bewerben'. 'damit' wäre korrekt bei verschiedenen Subjekten und braucht ein konjugiertes Verb.",
  },
];

// ─── Chapters ─────────────────────────────────────────────────────────────────

function Chapter1() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Was sind Konnektoren?</h2>
      <p className="text-sm text-brand-400 mb-6">Überblick und Einteilung der drei Typen</p>

      <InfoBox typ="merke">
        <strong>Konnektoren</strong> verbinden Sätze oder Satzteile miteinander und zeigen die logische Beziehung zwischen ihnen an. Im Deutschen gibt es drei Haupttypen — und jeder hat eine andere Auswirkung auf die <strong>Wortstellung</strong>.
      </InfoBox>

      <div className="space-y-3 mb-6">
        <div className="bg-white border border-brand-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <TypBadge typ={undefined} />
            <p className="text-sm font-semibold text-brand-900">Koordinierende Konjunktionen</p>
          </div>
          <p className="text-xs text-brand-600 mb-1">und · aber · oder · denn · sondern</p>
          <p className="text-sm font-mono text-brand-800">Er ist müde, <strong>aber</strong> er arbeitet weiter.</p>
          <p className="text-xs text-brand-400 mt-1">→ Normaler Hauptsatz folgt (Verb an Position 2)</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <TypBadge typ="subjunktion" />
            <p className="text-sm font-semibold text-brand-900">Subjunktionen</p>
          </div>
          <p className="text-xs text-brand-600 mb-1">weil · obwohl · wenn · als · während · damit …</p>
          <p className="text-sm font-mono text-brand-800">Er schläft nicht, <strong>obwohl</strong> er müde <strong>ist</strong>.</p>
          <p className="text-xs text-brand-400 mt-1">→ Nebensatz: Verb rückt ans Ende</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <TypBadge typ="konjunktionaladverb" />
            <p className="text-sm font-semibold text-brand-900">Konjunktionaladverbien</p>
          </div>
          <p className="text-xs text-brand-600 mb-1">deshalb · trotzdem · jedoch · außerdem · danach …</p>
          <p className="text-sm font-mono text-brand-800">Er ist müde. <strong>Trotzdem</strong> <strong>arbeitet</strong> er weiter.</p>
          <p className="text-xs text-brand-400 mt-1">→ Adverb an Pos. 1 → Verb an Pos. 2 (Inversion)</p>
        </div>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Logische Beziehungen — ein Überblick</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Bedeutung</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Konjunktion</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Subjunktion</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Konj.-Adverb</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["Kausal (Grund)", "denn", "weil / da", "deshalb / daher"],
              ["Konzessiv (Gegengrund)", "aber", "obwohl / obgleich", "trotzdem / dennoch"],
              ["Temporal (Zeit)", "—", "als / wenn / während", "danach / zuvor"],
              ["Konditional (Bedingung)", "—", "wenn / falls", "sonst / andernfalls"],
              ["Final (Zweck)", "—", "damit", "—"],
              ["Konsekutiv (Folge)", "—", "sodass", "folglich / somit"],
              ["Adversativ (Gegensatz)", "aber / doch", "während / wohingegen", "jedoch / allerdings"],
              ["Additiv (Ergänzung)", "und", "—", "außerdem / zudem"],
            ] as [string, string, string, string][]).map(([bed, konj, subj, adv], i) => (
              <tr key={bed} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 text-xs font-semibold text-brand-700">{bed}</td>
                <td className="px-3 py-2 font-mono text-xs text-brand-800">{konj}</td>
                <td className="px-3 py-2 font-mono text-xs text-red-700">{subj}</td>
                <td className="px-3 py-2 font-mono text-xs text-orange-700">{adv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox typ="tipp">
        Der wichtigste Schritt beim Lernen von Konnektoren ist nicht die Bedeutung — es ist die <strong>Wortstellungsregel</strong>. Sobald du weißt, ob ein Wort Subjunktion, Konjunktion oder Konjunktionaladverb ist, weißt du automatisch die Wortstellung.
      </InfoBox>
    </div>
  );
}

function Chapter2() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Wortstellung — Die drei Typen</h2>
      <p className="text-sm text-brand-400 mb-6">Der entscheidende Unterschied zwischen allen Konnektoren</p>

      <InfoBox typ="merke">
        Die <strong>Wortstellung</strong> ist das Kernthema bei Konnektoren. Jeder der drei Typen hat eine eigene Regel — und dieselbe Bedeutung kann mit allen drei ausgedrückt werden.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Typ 1 — Koordinierende Konjunktion</h3>
      <div className="bg-white border border-brand-100 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs text-brand-500 mb-2">Hauptsatz + <span className="font-bold text-brand-700">Konjunktion</span> + Hauptsatz (V2)</p>
        <p className="font-mono text-sm text-brand-800 mb-1">Er ist krank, <strong>denn</strong> er hat eine Erkältung.</p>
        <p className="font-mono text-sm text-brand-800">Er kommt nicht, <strong>aber</strong> er ruft an.</p>
        <p className="text-xs text-brand-400 mt-2">→ Das konjugierte Verb bleibt an Position 2 im folgenden Hauptsatz.</p>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Typ 2 — Subjunktion (Nebensatz)</h3>
      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs text-red-600 mb-2">Hauptsatz + <span className="font-bold">Subjunktion</span> + Nebensatz (<strong>Verb am Ende!</strong>)</p>
        <p className="font-mono text-sm text-brand-800 mb-1">Er bleibt zuhause, <strong>weil</strong> er krank <strong>ist</strong>.</p>
        <p className="font-mono text-sm text-brand-800 mb-1"><strong>Weil</strong> er krank <strong>ist</strong>, bleibt er zuhause.</p>
        <p className="text-xs text-red-700 mt-2">→ Das Verb wandert ans <strong>Ende</strong> des Nebensatzes. Nebensatz kann auch vorne stehen — dann folgt Inversion im Hauptsatz.</p>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Typ 3 — Konjunktionaladverb</h3>
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-orange-700 mb-2"><span className="font-bold">Adverb</span> an Pos. 1 → <strong>Verb direkt danach</strong> → Subjekt → …</p>
        <p className="font-mono text-sm text-brand-800 mb-1">Er ist krank. <strong>Deshalb</strong> <strong>bleibt</strong> er zuhause.</p>
        <p className="font-mono text-sm text-brand-800 mb-1">Er ist krank. <strong>Trotzdem</strong> <strong>geht</strong> er zur Arbeit.</p>
        <p className="text-xs text-orange-700 mt-2">→ Das Adverb besetzt Position 1. Das Verb bleibt an Position 2 (Inversion: Verb vor Subjekt).</p>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Alle drei Typen — dieselbe Bedeutung</h3>
      <TrioBox
        label="Kausalität (Grund)"
        subjunktion={<>Er bleibt zuhause, <strong>weil</strong> er krank <strong>ist</strong>.</>}
        konjunktion={<>Er bleibt zuhause, <strong>denn</strong> er ist krank.</>}
        adverb={<>Er ist krank. <strong>Deshalb</strong> bleibt er zuhause.</>}
      />
      <TrioBox
        label="Konzessivität (Gegengrund)"
        subjunktion={<>Er arbeitet, <strong>obwohl</strong> er krank <strong>ist</strong>.</>}
        konjunktion={<>Er ist krank, <strong>aber</strong> er arbeitet.</>}
        adverb={<>Er ist krank. <strong>Trotzdem</strong> arbeitet er.</>}
      />

      <InfoBox typ="achtung">
        <strong>Sonderfall nämlich:</strong> 'nämlich' ist ein Konjunktionaladverb, steht aber <em>nicht</em> an Position 1 — es steht im Mittelfeld, <em>nach</em> dem Verb:<br />
        <span className="font-mono">Er bleibt zuhause. Er ist <strong>nämlich</strong> krank.</span>
      </InfoBox>

      <InfoBox typ="achtung">
        <strong>Flexibel: jedoch / allerdings / hingegen</strong> können an Position 1 stehen (Inversion) oder im Mittelfeld (nach dem Verb), ohne die Grammatik zu verletzen:<br />
        <span className="font-mono">Er ist krank. <strong>Jedoch</strong> geht er zur Arbeit.</span><br />
        <span className="font-mono">Er ist krank. Er geht <strong>jedoch</strong> zur Arbeit.</span>
      </InfoBox>
    </div>
  );
}

function Chapter3() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Koordinierende Konjunktionen</h2>
      <p className="text-sm text-brand-400 mb-6">und · aber · oder · denn · sondern · doch</p>

      <InfoBox typ="merke">
        Koordinierende Konjunktionen verbinden zwei <strong>gleichrangige Hauptsätze</strong>. Sie stehen zwischen den Sätzen, besetzen keine Position im Satz und ändern die Wortstellung <em>nicht</em>. Das Verb im zweiten Satz bleibt an Position 2.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Die fünf Kernkonjunktionen</h3>
      <div className="space-y-3 mb-6">
        {([
          ["und", "and", "Er lernt Deutsch und sie lernt Spanisch."],
          ["aber", "but", "Er ist intelligent, aber er ist faul."],
          ["oder", "or", "Kommst du heute oder morgen?"],
          ["denn", "because (V2!)", "Er bleibt zuhause, denn er ist krank."],
          ["sondern", "but rather (nach Negation)", "Er ist nicht faul, sondern er ist krank."],
        ] as [string, string, string][]).map(([w, b, e], i) => (
          <div key={w} className={`rounded-xl px-4 py-3 border ${i % 2 === 0 ? "bg-white border-brand-100" : "bg-brand-50 border-brand-100"}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-brand-700 text-base">{w}</span>
              <span className="text-xs text-brand-400">{b}</span>
            </div>
            <p className="text-sm font-mono text-brand-800">{e}</p>
          </div>
        ))}
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">denn vs. weil — wichtiger Unterschied!</h3>
      <InfoBox typ="achtung">
        <strong>denn</strong> und <strong>weil</strong> bedeuten beide "because", aber:<br />
        — <em>denn</em> = koordinierende Konjunktion → Hauptsatz-Wortstellung (V2)<br />
        — <em>weil</em> = Subjunktion → Nebensatz (Verb am Ende)
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="denn" text={<>Er bleibt zuhause, <strong>denn</strong> er ist krank. (V2: ist)</>} />
        <Beispiel label="weil" text={<>Er bleibt zuhause, <strong>weil</strong> er krank <strong>ist</strong>. (Verb-Ende: ist)</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">sondern vs. aber — wichtiger Unterschied!</h3>
      <InfoBox typ="achtung">
        <strong>sondern</strong> steht nach einer <em>Verneinung</em> und korrigiert eine falsche Aussage. <strong>aber</strong> drückt einfach einen Gegensatz aus.
      </InfoBox>
      <ul className="space-y-2 mb-4">
        <Beispiel label="sondern" text={<>Er ist nicht faul, <strong>sondern</strong> er ist krank. (Korrektur nach Negation)</>} />
        <Beispiel label="aber" text={<>Er ist fleißig, <strong>aber</strong> er macht Fehler. (Gegensatz, keine Negation nötig)</>} />
        <Beispiel label="falsch" text={<>Er ist nicht faul, <strong>aber</strong> er ist krank. (möglich, aber sondern besser)</>} />
      </ul>
    </div>
  );
}

function Chapter4() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Kausale Konnektoren</h2>
      <p className="text-sm text-brand-400 mb-6">Grund und Ursache — weil · da · denn · deshalb · daher</p>

      <InfoBox typ="merke">
        Kausale Konnektoren drücken einen <strong>Grund oder eine Ursache</strong> aus. Alle drei Typen existieren, aber mit unterschiedlicher Wortstellung und leicht verschiedener Nuance.
      </InfoBox>

      <TrioBox
        label="Kausale Konnektoren — Vergleich"
        subjunktion={<>Er bleibt zuhause, <strong>weil</strong> er krank <strong>ist</strong>.</>}
        konjunktion={<>Er bleibt zuhause, <strong>denn</strong> er ist krank.</>}
        adverb={<>Er ist krank. <strong>Deshalb</strong> bleibt er zuhause.</>}
      />

      <h3 className="text-base font-semibold text-brand-900 mb-3">weil vs. da — wann welches?</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Wort</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Wann?</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-3 py-2 font-mono font-bold text-xs text-red-700">weil</td>
              <td className="px-3 py-2 text-xs text-brand-800">Neue Information — der Hörer weiß den Grund noch nicht</td>
              <td className="px-3 py-2 font-mono text-xs">Er weint, weil er traurig ist.</td>
            </tr>
            <tr className="bg-brand-50">
              <td className="px-3 py-2 font-mono font-bold text-xs text-red-700">da</td>
              <td className="px-3 py-2 text-xs text-brand-800">Bekannte Information — Grund ist dem Hörer bekannt, oft am Satzanfang</td>
              <td className="px-3 py-2 font-mono text-xs">Da er krank ist, bleibt er zuhause.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">nämlich — Sonderposition im Mittelfeld</h3>
      <InfoBox typ="achtung">
        <strong>nämlich</strong> ist ein Konjunktionaladverb, steht aber <em>nicht</em> an Position 1. Es steht immer im Mittelfeld — nach dem konjugierten Verb:
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="richtig" text={<>Er bleibt zuhause. Er ist <strong>nämlich</strong> krank.</>} />
        <Beispiel label="falsch" text={<>Er bleibt zuhause. <strong>Nämlich</strong> ist er krank. ✗</>} />
        <Beispiel label="richtig" text={<>Ich komme nicht. Ich habe <strong>nämlich</strong> keine Zeit.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Weitere Beispiele</h3>
      <ul className="space-y-2 mb-4">
        <Beispiel label="weil" text={<>Sie lernt Deutsch, <strong>weil</strong> sie in Deutschland arbeiten <strong>möchte</strong>.</>} />
        <Beispiel label="da" text={<><strong>Da</strong> das Wetter schön <strong>ist</strong>, gehen wir spazieren.</>} />
        <Beispiel label="daher" text={<>Er hatte keine Zeit. <strong>Daher</strong> konnte er nicht kommen.</>} />
        <Beispiel label="deswegen" text={<>Sie hat Angst vor Hunden. <strong>Deswegen</strong> geht sie nicht in den Park.</>} />
        <Beispiel label="zumal" text={<>Es war kalt, <strong>zumal</strong> es auch noch regnete.</>} />
      </ul>
    </div>
  );
}

function Chapter5() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Temporale Konnektoren</h2>
      <p className="text-sm text-brand-400 mb-6">Zeit & Abfolge — als · wenn · während · bevor · nachdem …</p>

      <InfoBox typ="merke">
        Temporale Konnektoren beschreiben <strong>zeitliche Verhältnisse</strong>: Gleichzeitigkeit, Vorzeitigkeit (etwas passierte vorher) oder Nachzeitigkeit (etwas passiert danach). Alle Subjunktionen verlangen Verb-Ende.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">als vs. wenn — der häufigste Fehler!</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Wort</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Verwendung</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-3 py-2 font-mono font-bold text-xs text-red-700">als</td>
              <td className="px-3 py-2 text-xs text-brand-800">Einmaliges Ereignis in der Vergangenheit</td>
              <td className="px-3 py-2 font-mono text-xs">Als ich klein war, wohnte ich in Wien.</td>
            </tr>
            <tr className="bg-brand-50">
              <td className="px-3 py-2 font-mono font-bold text-xs text-red-700">wenn</td>
              <td className="px-3 py-2 text-xs text-brand-800">Wiederholtes Ereignis (Vergangenheit) + Gegenwart + Zukunft</td>
              <td className="px-3 py-2 font-mono text-xs">Wenn ich Ferien hatte, fuhr ich ans Meer.</td>
            </tr>
            <tr className="bg-white">
              <td className="px-3 py-2 font-mono font-bold text-xs text-red-700">wenn</td>
              <td className="px-3 py-2 text-xs text-brand-800">Gegenwart / Zukunft</td>
              <td className="px-3 py-2 font-mono text-xs">Wenn ich morgen Zeit habe, rufe ich an.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">nachdem — Plusquamperfekt beachten!</h3>
      <InfoBox typ="achtung">
        Nach <strong>nachdem</strong> steht der Nebensatz im <strong>Plusquamperfekt</strong> (hatte + Partizip II / war + Partizip II), weil die Handlung im Nebensatz vor der Handlung im Hauptsatz abgeschlossen wurde:
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="richtig" text={<>Nachdem er gegessen <strong>hatte</strong>, ging er spazieren.</>} />
        <Beispiel label="richtig" text={<>Nachdem sie die Prüfung bestanden <strong>hatte</strong>, feierte sie.</>} />
        <Beispiel label="falsch" text={<>Nachdem er gegessen hat, ging er spazieren. ✗ (Perfekt = falsch)</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Alle temporalen Subjunktionen im Überblick</h3>
      <ul className="space-y-2 mb-5">
        <Beispiel label="während" text={<><strong>Während</strong> sie kochte, las er die Zeitung. (gleichzeitig)</>} />
        <Beispiel label="bevor" text={<><strong>Bevor</strong> sie schläft, putzt sie die Zähne. (Vorzeitigkeit des HS)</>} />
        <Beispiel label="seitdem" text={<><strong>Seitdem</strong> er umgezogen ist, sehe ich ihn selten.</>} />
        <Beispiel label="bis" text={<>Ich warte hier, <strong>bis</strong> du zurückkommst.</>} />
        <Beispiel label="sobald" text={<><strong>Sobald</strong> er ankommt, rufst du mich an.</>} />
        <Beispiel label="solange" text={<><strong>Solange</strong> es regnet, bleiben wir drin.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Zeitadverbien für Abfolgen (Konjunktionaladverbien)</h3>
      <ul className="space-y-2 mb-4">
        <Beispiel label="zunächst" text={<><strong>Zunächst</strong> kochte er, dann aß er und danach schlief er.</>} />
        <Beispiel label="danach" text={<>Er las das Buch. <strong>Danach</strong> schaute er einen Film.</>} />
        <Beispiel label="gleichzeitig" text={<>Sie lernte. <strong>Gleichzeitig</strong> hörte sie Musik.</>} />
        <Beispiel label="zuvor" text={<>Er hatte <strong>zuvor</strong> das Formular ausgefüllt.</>} />
      </ul>
    </div>
  );
}

function Chapter6() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Konzessive & Adversative Konnektoren</h2>
      <p className="text-sm text-brand-400 mb-6">Gegengrund & Kontrast — obwohl · trotzdem · jedoch · wohingegen</p>

      <InfoBox typ="merke">
        <strong>Konzessiv</strong>: Der Nebensatz nennt einen Grund, der die Handlung im Hauptsatz <em>nicht</em> verhindert (= obwohl, trotzdem).<br />
        <strong>Adversativ</strong>: Zwei Sachverhalte werden als Gegensatz nebeneinandergestellt (= aber, jedoch, wohingegen).
      </InfoBox>

      <TrioBox
        label="Konzessiv — alle drei Typen"
        subjunktion={<>Er arbeitet, <strong>obwohl</strong> er krank <strong>ist</strong>.</>}
        konjunktion={<>Er ist krank, <strong>aber</strong> er arbeitet.</>}
        adverb={<>Er ist krank. <strong>Trotzdem</strong> arbeitet er.</>}
      />

      <h3 className="text-base font-semibold text-brand-900 mb-3">Konzessive Subjunktionen im Vergleich</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Wort</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Register</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["obwohl", "neutral / alltäglich", "Er schläft nicht, obwohl er müde ist."],
              ["obgleich", "formal / geschrieben", "Er reist, obgleich er krank ist."],
              ["obschon", "sehr formal / literarisch", "Er sprach, obschon niemand zuhörte."],
              ["wenngleich", "formal / geschrieben", "Er lächelte, wenngleich es schwer fiel."],
              ["auch wenn", "umgangssprachlicher", "Auch wenn es schwer ist, gib nicht auf."],
            ] as [string, string, string][]).map(([w, r, e], i) => (
              <tr key={w} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-mono text-xs font-bold text-red-700">{w}</td>
                <td className="px-3 py-2 text-xs text-brand-600">{r}</td>
                <td className="px-3 py-2 font-mono text-xs text-brand-800">{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Adversative Konnektoren — Gegensatz</h3>
      <ul className="space-y-2 mb-5">
        <Beispiel label="jedoch" text={<>Er ist klug. <strong>Jedoch</strong> macht er viele Fehler.</>} />
        <Beispiel label="allerdings" text={<>Der Film war gut. <strong>Allerdings</strong> war er sehr lang.</>} />
        <Beispiel label="hingegen" text={<>Er liebt Sport. Sein Bruder <strong>hingegen</strong> hasst ihn.</>} />
        <Beispiel label="dagegen" text={<>Sie isst gern Fleisch. Er <strong>dagegen</strong> ist Vegetarier.</>} />
        <Beispiel label="während" text={<>Er liest Bücher, <strong>während</strong> sie lieber Filme schaut. (adversativ)</>} />
        <Beispiel label="wohingegen" text={<>Er wohnt in Berlin, <strong>wohingegen</strong> sie in München <strong>lebt</strong>.</>} />
      </ul>

      <InfoBox typ="tipp">
        <strong>während</strong> hat zwei Bedeutungen: <em>temporal</em> (while — gleichzeitig) und <em>adversativ</em> (whereas — Gegensatz). Der Kontext entscheidet:<br />
        <span className="font-mono">Temporal: Während sie kochte, las er. (gleichzeitig)</span><br />
        <span className="font-mono">Adversativ: Während er Kaffee trinkt, mag sie Tee. (Gegensatz)</span>
      </InfoBox>
    </div>
  );
}

function Chapter7() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Konditionale & Finale Konnektoren</h2>
      <p className="text-sm text-brand-400 mb-6">Bedingung & Zweck — wenn · falls · damit · um … zu</p>

      <InfoBox typ="merke">
        <strong>Konditional</strong>: Nennt eine Bedingung, unter der etwas gilt oder eintritt.<br />
        <strong>Final</strong>: Nennt den Zweck oder die Absicht einer Handlung.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Konditionale Konnektoren</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Wort</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Nuance</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["wenn", "allgemeine Bedingung (neutral)", "Wenn es regnet, bleibe ich zuhause."],
              ["falls", "Bedingung mit Unsicherheit (formal)", "Falls Sie Fragen haben, melden Sie sich."],
              ["sofern", "Bedingung mit Voraussetzung", "Sofern er rechtzeitig kommt, fangen wir an."],
              ["vorausgesetzt dass", "starke Voraussetzung (formal)", "Wir kommen, vorausgesetzt dass es klappt."],
              ["es sei denn", "negative Bedingung (= unless)", "Ich gehe, es sei denn, es regnet."],
              ["sonst / andernfalls", "Folge der nicht erfüllten Bedingung (Adverb)", "Beeil dich, sonst verpasst du den Zug."],
            ] as [string, string, string][]).map(([w, n, e], i) => (
              <tr key={w} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-mono text-xs font-bold text-red-700 whitespace-nowrap">{w}</td>
                <td className="px-3 py-2 text-xs text-brand-600">{n}</td>
                <td className="px-3 py-2 font-mono text-xs text-brand-800">{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Finale Konnektoren — damit vs. um … zu</h3>
      <InfoBox typ="merke">
        Beide drücken Zweck/Absicht aus, aber die Wahl hängt vom <strong>Subjekt</strong> ab:
      </InfoBox>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Konstruktion</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Bedingung</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-red-50">
              <td className="px-3 py-2 font-mono text-xs font-bold text-red-700">damit</td>
              <td className="px-3 py-2 text-xs text-brand-800">Verschiedene Subjekte möglich (Nebensatz, Verb-Ende)</td>
              <td className="px-3 py-2 font-mono text-xs">Ich erkläre es, damit du es verstehst.</td>
            </tr>
            <tr className="bg-brand-50">
              <td className="px-3 py-2 font-mono text-xs font-bold text-brand-700">um … zu</td>
              <td className="px-3 py-2 text-xs text-brand-800">NUR gleiches Subjekt! (Infinitivkonstruktion)</td>
              <td className="px-3 py-2 font-mono text-xs">Ich lerne, um die Prüfung zu bestehen.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 mb-4">
        <Beispiel label="damit" text={<>Sie spricht langsam, <strong>damit</strong> alle sie verstehen <strong>können</strong>.</>} />
        <Beispiel label="um…zu" text={<>Er trainiert täglich, <strong>um</strong> fitter <strong>zu werden</strong>.</>} />
        <Beispiel label="damit" text={<>Der Arzt verschreibt Tabletten, <strong>damit</strong> der Patient besser schlafen <strong>kann</strong>.</>} />
        <Beispiel label="um…zu" text={<>Sie reist nach Berlin, <strong>um</strong> ihre Familie <strong>zu besuchen</strong>.</>} />
      </ul>
    </div>
  );
}

function Chapter8() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Konsekutive & Modale Konnektoren</h2>
      <p className="text-sm text-brand-400 mb-6">Folge & Art/Weise — sodass · indem · ohne … zu · anstatt … zu</p>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Konsekutive Konnektoren — Folge/Ergebnis</h3>
      <InfoBox typ="merke">
        Konsekutive Konnektoren beschreiben das <strong>Ergebnis oder die Konsequenz</strong> einer Handlung. Der Unterschied zu Finalität: Finalität = beabsichtigt, Konsekutiv = tatsächliche Folge (oft unbeabsichtigt).
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel label="sodass" text={<>Er arbeitete sehr viel, <strong>sodass</strong> er erschöpft <strong>war</strong>.</>} />
        <Beispiel label="so…dass" text={<>Es war <strong>so</strong> kalt, <strong>dass</strong> die Seen einfroren.</>} />
        <Beispiel label="folglich" text={<>Er hat die Prüfung nicht bestanden. <strong>Folglich</strong> muss er wiederholen.</>} />
        <Beispiel label="somit" text={<>Er hat alle Aufgaben erledigt. <strong>Somit</strong> ist das Projekt abgeschlossen.</>} />
        <Beispiel label="demnach" text={<>Es gibt keine freien Plätze. <strong>Demnach</strong> müssen wir stehen.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Modale Konnektoren — Art und Weise</h3>
      <InfoBox typ="merke">
        Modale Konnektoren beschreiben, <strong>wie</strong> etwas getan wird (indem), oder was dabei <strong>nicht</strong> getan wird (ohne…zu) oder was <strong>stattdessen</strong> erwartet würde (anstatt…zu).
      </InfoBox>

      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Konstruktion</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Subjekt</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Bedeutung</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["indem", "gleich", "by (doing) — Methode/Mittel"],
              ["dadurch dass", "gleich oder verschieden", "by the fact that — Mittel (formeller)"],
              ["ohne … zu", "gleich", "without doing — Infinitiv"],
              ["ohne dass", "verschieden", "without (someone) doing — Nebensatz"],
              ["anstatt … zu", "gleich", "instead of doing — Infinitiv"],
              ["anstatt dass", "verschieden", "instead of (someone) doing — Nebensatz"],
            ] as [string, string, string][]).map(([k, s, b], i) => (
              <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-mono text-xs font-bold text-red-700">{k}</td>
                <td className="px-3 py-2 text-xs text-brand-600">{s}</td>
                <td className="px-3 py-2 text-xs text-brand-800">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2 mb-4">
        <Beispiel label="indem" text={<>Er lernt effektiv, <strong>indem</strong> er täglich übt.</>} />
        <Beispiel label="ohne…zu" text={<>Sie hat die Prüfung bestanden, <strong>ohne</strong> viel zu lernen.</>} />
        <Beispiel label="ohne dass" text={<>Er ist gegangen, <strong>ohne dass</strong> jemand es gemerkt hat.</>} />
        <Beispiel label="anstatt…zu" text={<><strong>Anstatt</strong> zu lernen, sieht er fern.</>} />
        <Beispiel label="anstatt dass" text={<><strong>Anstatt dass</strong> er kommt, schickt er eine E-Mail.</>} />
      </ul>
    </div>
  );
}

function Chapter9() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Zweiteilige Konnektoren</h2>
      <p className="text-sm text-brand-400 mb-6">Korrelative Konnektoren — sowohl … als auch · je … desto …</p>

      <InfoBox typ="merke">
        Zweiteilige Konnektoren bestehen aus zwei Teilen, die in verschiedenen Teilen des Satzes stehen. Sie verbinden zwei parallele Elemente oder Sätze und drücken spezifische logische Beziehungen aus.
      </InfoBox>

      <div className="space-y-5">

        <div>
          <h3 className="text-base font-semibold text-brand-900 mb-2">sowohl … als auch — both … and</h3>
          <InfoBox typ="tipp">Beide Alternativen treffen zu (additive Verstärkung). Verb richtet sich nach dem Gesamtsubjekt (meist Plural).</InfoBox>
          <ul className="space-y-1.5">
            <Beispiel label="—" text={<>Sie spricht <strong>sowohl</strong> Englisch <strong>als auch</strong> Französisch.</>} />
            <Beispiel label="—" text={<><strong>Sowohl</strong> er <strong>als auch</strong> sie kommen zur Party.</>} />
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-brand-900 mb-2">weder … noch — neither … nor</h3>
          <InfoBox typ="tipp">Beide Alternativen werden verneint. Das Verb steht positiv — die Verneinung steckt in weder…noch.</InfoBox>
          <ul className="space-y-1.5">
            <Beispiel label="—" text={<>Er mag <strong>weder</strong> Kaffee <strong>noch</strong> Tee.</>} />
            <Beispiel label="—" text={<><strong>Weder</strong> er <strong>noch</strong> sie weiß die Antwort.</>} />
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-brand-900 mb-2">entweder … oder — either … or</h3>
          <InfoBox typ="tipp">Eine von zwei Alternativen wird gewählt. Bei entweder am Satzanfang folgt Inversion.</InfoBox>
          <ul className="space-y-1.5">
            <Beispiel label="—" text={<>Ich esse <strong>entweder</strong> Pizza <strong>oder</strong> Pasta.</>} />
            <Beispiel label="—" text={<><strong>Entweder</strong> kommst du jetzt, <strong>oder</strong> ich gehe ohne dich.</>} />
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-brand-900 mb-2">nicht nur … sondern auch — not only … but also</h3>
          <InfoBox typ="tipp">Verstärkte Addition: beide Elemente treffen zu, das zweite ist die überraschendere Ergänzung.</InfoBox>
          <ul className="space-y-1.5">
            <Beispiel label="—" text={<>Er ist <strong>nicht nur</strong> intelligent, <strong>sondern</strong> auch sehr fleißig.</>} />
            <Beispiel label="—" text={<><strong>Nicht nur</strong> in Deutschland, <strong>sondern auch</strong> in Österreich spricht man Deutsch.</>} />
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-brand-900 mb-2">zwar … aber — admittedly … but</h3>
          <InfoBox typ="tipp">Konzessive Einschränkung: etwas wird eingeräumt (zwar), aber sofort relativiert (aber).</InfoBox>
          <ul className="space-y-1.5">
            <Beispiel label="—" text={<>Er ist <strong>zwar</strong> müde, <strong>aber</strong> er macht weiter.</>} />
            <Beispiel label="—" text={<><strong>Zwar</strong> ist es teuer, <strong>aber</strong> es lohnt sich.</>} />
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-brand-900 mb-2">je … desto / je … umso — the more … the more</h3>
          <InfoBox typ="achtung">
            Struktur: <strong>je</strong> + Komparativ + Nebensatz (Verb-Ende) , + <strong>desto/umso</strong> + Komparativ + Verb + Subjekt.<br />
            Im je-Satz: Verb am Ende. Im desto-Satz: Komparativ an Pos. 1, Verb an Pos. 2.
          </InfoBox>
          <ul className="space-y-1.5">
            <Beispiel label="—" text={<><strong>Je</strong> mehr du übst, <strong>desto</strong> besser wirst du.</>} />
            <Beispiel label="—" text={<><strong>Je</strong> länger er wartet, <strong>umso</strong> nervöser wird er.</>} />
            <Beispiel label="—" text={<><strong>Je</strong> früher wir losfahren, <strong>desto</strong> weniger Stau haben wir.</>} />
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-brand-900 mb-2">einerseits … andererseits — on the one hand … on the other</h3>
          <ul className="space-y-1.5">
            <Beispiel label="—" text={<><strong>Einerseits</strong> ist das Angebot günstig, <strong>andererseits</strong> ist die Qualität schlecht.</>} />
            <Beispiel label="—" text={<>Das Projekt ist <strong>einerseits</strong> riskant, <strong>andererseits</strong> sehr lukrativ.</>} />
          </ul>
        </div>

      </div>
    </div>
  );
}

function Chapter10() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Tipps & Tricks</h2>
      <p className="text-sm text-brand-400 mb-6">Strategien, Eselsbrücken und häufige Prüfungsfehler</p>

      <InfoBox typ="tipp">
        <strong>Tipp 1 — Typ zuerst, Bedeutung zweite:</strong> Lerne jeden Konnektor mit seinem Typ (Subjunktion / Konjunktion / Konjunktionaladverb). Der Typ bestimmt die Wortstellung — das ist wichtiger als die genaue Bedeutung.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 2 — Die drei Fragen beim Schreiben:</strong> (1) Was will ich ausdrücken? (2) Welchen Typ brauche ich? (3) Welches Wort passt am besten?
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 3 — Subjunktion erkennen:</strong> Kannst du den Teilsatz nicht alleine stehen lassen? Dann ist es ein Nebensatz (Subjunktion) → Verb ans Ende. <em>Er ist krank</em> = vollständig. <em>weil er krank ist</em> = nicht alleine stehend.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 4 — Konjunktionaladverb vs. Konjunktion:</strong> Steht das Wort am Satzanfang und zieht das Verb <em>direkt</em> nach sich? → Konjunktionaladverb. Steht das Wort zwischen zwei Hauptsätzen ohne Inversion? → Konjunktion.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 5 — damit vs. um…zu:</strong> Frag dich: Haben Haupt- und Nebensatz dasselbe Subjekt? Wenn ja → <em>um…zu</em> (kürzer, eleganter). Wenn nein oder unsicher → <em>damit</em> (immer sicher).
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 6 — als vs. wenn:</strong> Einmalig + Vergangenheit → <em>als</em>. Alles andere (Gegenwart, Zukunft, Wiederholung) → <em>wenn</em>. Merkhilfe: <em>Als</em> = einmal, <em>wenn</em> = oft/immer/jetzt/bald.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 7 — je…desto Struktur auswendig lernen:</strong> Lerne dieses Muster als feste Formel: <em>Je [Komparativ] + Nebensatz(Verb-Ende), desto [Komparativ] + Verb + Subjekt.</em>
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-2">Die häufigsten Fehler auf B2-Niveau</h3>

      <InfoBox typ="falsch">
        <strong>Wortstellung nach Konjunktionaladverb vergessen:</strong><br />
        <em>Er ist krank. Deshalb er bleibt zuhause.</em> ✗<br />
        Richtig: <em>Deshalb <strong>bleibt</strong> er zuhause.</em> (Inversion: Verb vor Subjekt)
      </InfoBox>

      <InfoBox typ="falsch">
        <strong>weil mit Hauptsatz-Wortstellung:</strong><br />
        <em>Er bleibt zuhause, weil er ist krank.</em> ✗<br />
        Richtig: <em>weil er krank <strong>ist</strong>.</em> (Verb ans Ende)
      </InfoBox>

      <InfoBox typ="falsch">
        <strong>als statt wenn (oder umgekehrt):</strong><br />
        <em>Wenn ich klein war, wohnte ich einmal in Wien.</em> ✗<br />
        Richtig: <em><strong>Als</strong> ich klein war, …</em> (einmalig + Vergangenheit)
      </InfoBox>

      <InfoBox typ="falsch">
        <strong>um…zu bei verschiedenen Subjekten:</strong><br />
        <em>Ich erkläre es, um du es verstehen zu können.</em> ✗<br />
        Richtig: <em>Ich erkläre es, <strong>damit</strong> du es verstehst.</em>
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-2">Schnellreferenz Wortstellung</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Typ</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Position des Verbs</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-3 py-2 text-xs font-semibold text-brand-700">Konjunktion</td>
              <td className="px-3 py-2 text-xs text-brand-800">V2 im folgenden Hauptsatz</td>
              <td className="px-3 py-2 font-mono text-xs">Er ist krank, <strong>denn</strong> er ist erkältet.</td>
            </tr>
            <tr className="bg-red-50">
              <td className="px-3 py-2 text-xs font-semibold text-red-700">Subjunktion</td>
              <td className="px-3 py-2 text-xs text-brand-800">Verb ans ENDE des Nebensatzes</td>
              <td className="px-3 py-2 font-mono text-xs">Er bleibt, <strong>weil</strong> er krank <strong>ist</strong>.</td>
            </tr>
            <tr className="bg-orange-50">
              <td className="px-3 py-2 text-xs font-semibold text-orange-700">Konj.-Adverb</td>
              <td className="px-3 py-2 text-xs text-brand-800">Adverb an Pos.1 → Verb an Pos.2 (Inversion)</td>
              <td className="px-3 py-2 font-mono text-xs">Er ist krank. <strong>Deshalb</strong> <strong>bleibt</strong> er.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chapter11() {
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
      <h2 className="text-xl font-bold text-brand-950 mb-1">Wortliste</h2>
      <p className="text-sm text-brand-400 mb-4">{totalCount} Konnektoren · kategorisiert und farbkodiert nach Typ</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
        <input
          type="text"
          placeholder="Konnektor oder Bedeutung suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-200 text-sm text-brand-800 placeholder:text-brand-300 focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-5 text-[10px] text-brand-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-2 border-l-red-500 bg-red-50 inline-block" />
          Subjunktion (Verb-Ende)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-2 border-l-orange-500 bg-orange-50 inline-block" />
          Konjunktionaladverb (Verb-2)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-2 border-l-brand-500 bg-brand-50 inline-block" />
          Zweiteilig
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-brand-200 bg-white inline-block" />
          Koordinierende Konjunktion
        </span>
      </div>

      {filtered.map((cat) => (
        <div key={cat.name} className="mb-6">
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-2">{cat.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cat.entries.map((e) => {
              const cardStyle =
                e.typ === "subjunktion"        ? "border-l-4 border-l-red-500 bg-red-50"     :
                e.typ === "konjunktionaladverb"? "border-l-4 border-l-orange-400 bg-orange-50" :
                e.typ === "zweiteilig"         ? "border-l-4 border-l-brand-500 bg-brand-50"  :
                                                 "bg-white border border-brand-100";
              return (
                <div key={e.wort} className={`rounded-xl px-3 py-2 ${cardStyle}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-brand-900 font-mono">{e.wort}</p>
                    <TypBadge typ={e.typ} />
                  </div>
                  <p className="text-xs text-brand-500 mt-0.5 leading-tight">{e.bedeutung}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Chapter12() {
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
      <p className="text-sm text-brand-400 mb-6">{QUIZ.length} Aufgaben zu Konnektoren und Wortstellung</p>

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
              <p className="text-sm text-brand-800 mb-3 leading-relaxed font-mono">{q.frage}</p>
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

// ─── Chapter 12: Zusammenfassung ─────────────────────────────────────────────

function ChapterZusammenfassung() {
  const rows: [string, string, string, string][] = [
    ["Kausal (Grund)",      "denn",       "weil",              "deshalb / daher"],
    ["Kausal (Grund)",      "—",          "da",                "deswegen"],
    ["Konzessiv (trotzdem)","aber",       "obwohl",            "trotzdem / dennoch"],
    ["Konditional (wenn)",  "—",          "wenn / falls",      "dann / sonst"],
    ["Temporal (gleichz.)", "—",          "während / als",     "dabei / gleichzeitig"],
    ["Temporal (danach)",   "—",          "nachdem / sobald",  "danach / anschließend"],
    ["Temporal (davor)",    "—",          "bevor / bis",       "vorher / zuvor"],
    ["Final (Ziel)",        "—",          "damit / um…zu",     "dafür / zu diesem Zweck"],
    ["Konsekutiv (Folge)",  "—",          "sodass",            "deshalb / folglich"],
    ["Adversativ (aber)",   "aber / doch","während (kontrast)","hingegen / dagegen"],
    ["Modal (Art & Weise)", "—",          "indem / ohne…zu",   "so / auf diese Weise"],
    ["Alternativ (oder)",   "oder",       "—",                 "sonst / andernfalls"],
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Zusammenfassung</h2>
      <p className="text-sm text-brand-400 mb-6">Alle semantischen Gruppen mit je einem Vertreter pro Typ</p>

      <InfoBox typ="merke">
        <strong>Koordinierende Konjunktionen</strong> (und, aber, denn…) → Verb auf Position 2 im Folgesatz.<br />
        <strong>Subjunktionen</strong> (weil, obwohl, wenn…) → Verb ans <strong>Ende</strong> des Nebensatzes.<br />
        <strong>Konjunktionaladverbien</strong> (deshalb, trotzdem, danach…) → Verb auf Position 2, aber das Adverb selbst steht auf Position 1.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Semantische Übersicht nach Bedeutungsgruppe</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap">Bedeutung</th>
              <th className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap">Konjunktion (V2)</th>
              <th className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap">Subjunktion (V-Ende)</th>
              <th className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap">Konj.-Adverb (V2)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([bed, konj, subj, adv], i) => (
              <tr key={`${bed}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs whitespace-nowrap">{bed}</td>
                <td className="px-3 py-2 text-brand-800 font-mono">{konj || "—"}</td>
                <td className="px-3 py-2 text-brand-800 font-mono">{subj}</td>
                <td className="px-3 py-2 text-brand-800 font-mono">{adv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-6">Wortstellungsbeispiele</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left font-medium text-xs">Typ</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Konjunktion (denn)", "Er bleibt zu Hause, denn er ist krank."],
              ["Subjunktion (weil)", "Er bleibt zu Hause, weil er krank ist."],
              ["Konj.-Adverb (deshalb)", "Er ist krank, deshalb bleibt er zu Hause."],
              ["Subjunktion (obwohl)", "Er geht zur Arbeit, obwohl er krank ist."],
              ["Konj.-Adverb (trotzdem)", "Er ist krank. Trotzdem geht er zur Arbeit."],
              ["Zweiteilig (je…desto)", "Je mehr er lernt, desto besser wird er."],
              ["Zweiteilig (entweder…oder)", "Entweder rufst du an, oder ich schreibe."],
              ["Zweiteilig (sowohl…als auch)", "Sowohl Lena als auch Tim kommen mit."],
            ].map(([typ, bsp], i) => (
              <tr key={typ} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs whitespace-nowrap">{typ}</td>
                <td className="px-3 py-2 text-brand-800 italic">{bsp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox typ="tipp">
        Zweiteilige Konnektoren stehen immer <strong>paarweise</strong>: <em>entweder … oder</em>,
        <em> weder … noch</em>, <em>sowohl … als auch</em>, <em>nicht nur … sondern auch</em>,
        <em> zwar … aber</em>, <em>je … desto</em>.
      </InfoBox>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const TABS = [
  "1. Einführung",
  "2. Wortstellung",
  "3. Koordinierend",
  "4. Kausalität",
  "5. Temporalität",
  "6. Konzessiv & Adversativ",
  "7. Konditional & Final",
  "8. Konsekutiv & Modal",
  "9. Zweiteilig",
  "10. Tipps & Tricks",
  "11. Wortliste",
  "12. Zusammenfassung",
  "13. Übungen",
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
  Chapter11,
  ChapterZusammenfassung,
  Chapter12,
];

export function KonnektorenClient() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveChapter = CHAPTERS[activeTab];

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-2">
        <h1 className="text-3xl font-bold text-brand-950 mb-1">Konnektoren</h1>
        <p className="text-sm text-brand-400 mb-1">Konjunktionen · Subjunktionen · Konjunktionaladverbien · Zweiteilige Konnektoren</p>
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
