"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InfoTyp = "merke" | "tipp" | "achtung" | "richtig" | "falsch";
type AdjRow = [string, string, string, string, string];

interface AdjektivEntry {
  wort: string;
  bedeutung: string;
  typ?: "unveraenderlich" | "besonderheit";
}

interface AdjektivCategory {
  name: string;
  words: AdjektivEntry[];
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

function AdjTable({
  title,
  headers,
  rows,
}: {
  title?: string;
  headers?: string[];
  rows: AdjRow[];
}) {
  const cols = headers ?? ["Maskulin", "Feminin", "Neutrum", "Plural"];
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
              {cols.map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([kasus, m, f, n, pl], i) => (
              <tr key={kasus} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs whitespace-nowrap">{kasus}</td>
                <td className="px-3 py-2 font-mono text-xs">{m}</td>
                <td className="px-3 py-2 font-mono text-xs">{f}</td>
                <td className="px-3 py-2 font-mono text-xs">{n}</td>
                <td className="px-3 py-2 font-mono text-xs">{pl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Beispiel({ kasus, text }: { kasus: string; text: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-baseline">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-400 w-12">{kasus}</span>
      <span className="text-sm text-brand-800">{text}</span>
    </li>
  );
}

// ─── Word List Data (130 Adjectives) ─────────────────────────────────────────

const KATEGORIEN: AdjektivCategory[] = [
  {
    name: "Farben",
    words: [
      { wort: "rot", bedeutung: "red" },
      { wort: "blau", bedeutung: "blue" },
      { wort: "grün", bedeutung: "green" },
      { wort: "gelb", bedeutung: "yellow" },
      { wort: "schwarz", bedeutung: "black" },
      { wort: "weiß", bedeutung: "white" },
      { wort: "grau", bedeutung: "grey" },
      { wort: "braun", bedeutung: "brown" },
      { wort: "lila", bedeutung: "purple / lilac — unveränderlich", typ: "unveraenderlich" },
      { wort: "rosa", bedeutung: "pink — unveränderlich", typ: "unveraenderlich" },
      { wort: "orange", bedeutung: "orange — unveränderlich", typ: "unveraenderlich" },
      { wort: "beige", bedeutung: "beige — unveränderlich", typ: "unveraenderlich" },
      { wort: "türkis", bedeutung: "turquoise" },
      { wort: "golden", bedeutung: "golden" },
      { wort: "silbern", bedeutung: "silver" },
    ],
  },
  {
    name: "Größe & Form",
    words: [
      { wort: "groß", bedeutung: "big / tall" },
      { wort: "klein", bedeutung: "small" },
      { wort: "lang", bedeutung: "long" },
      { wort: "kurz", bedeutung: "short" },
      { wort: "breit", bedeutung: "wide" },
      { wort: "schmal", bedeutung: "narrow" },
      { wort: "hoch", bedeutung: "high / tall — Stamm: hoh-", typ: "besonderheit" },
      { wort: "tief", bedeutung: "deep / low" },
      { wort: "dick", bedeutung: "thick / fat" },
      { wort: "dünn", bedeutung: "thin" },
      { wort: "rund", bedeutung: "round" },
      { wort: "eckig", bedeutung: "angular" },
      { wort: "flach", bedeutung: "flat" },
      { wort: "eng", bedeutung: "narrow / tight" },
      { wort: "weit", bedeutung: "wide / far" },
    ],
  },
  {
    name: "Qualität & Zustand",
    words: [
      { wort: "gut", bedeutung: "good" },
      { wort: "schlecht", bedeutung: "bad" },
      { wort: "schön", bedeutung: "beautiful" },
      { wort: "hässlich", bedeutung: "ugly" },
      { wort: "neu", bedeutung: "new" },
      { wort: "alt", bedeutung: "old" },
      { wort: "frisch", bedeutung: "fresh" },
      { wort: "sauber", bedeutung: "clean" },
      { wort: "schmutzig", bedeutung: "dirty" },
      { wort: "kaputt", bedeutung: "broken" },
      { wort: "leicht", bedeutung: "light / easy" },
      { wort: "schwer", bedeutung: "heavy / difficult" },
      { wort: "teuer", bedeutung: "expensive — Stamm: teur-", typ: "besonderheit" },
      { wort: "billig", bedeutung: "cheap" },
      { wort: "warm", bedeutung: "warm" },
      { wort: "kalt", bedeutung: "cold" },
      { wort: "heiß", bedeutung: "hot" },
      { wort: "kühl", bedeutung: "cool" },
      { wort: "nass", bedeutung: "wet" },
      { wort: "trocken", bedeutung: "dry" },
    ],
  },
  {
    name: "Charakter & Persönlichkeit",
    words: [
      { wort: "freundlich", bedeutung: "friendly" },
      { wort: "unfreundlich", bedeutung: "unfriendly" },
      { wort: "nett", bedeutung: "nice" },
      { wort: "höflich", bedeutung: "polite" },
      { wort: "unhöflich", bedeutung: "impolite" },
      { wort: "ehrlich", bedeutung: "honest" },
      { wort: "unehrlich", bedeutung: "dishonest" },
      { wort: "fleißig", bedeutung: "hardworking" },
      { wort: "faul", bedeutung: "lazy" },
      { wort: "klug", bedeutung: "clever / smart" },
      { wort: "dumm", bedeutung: "stupid" },
      { wort: "mutig", bedeutung: "brave" },
      { wort: "ängstlich", bedeutung: "anxious / fearful" },
      { wort: "geduldig", bedeutung: "patient" },
      { wort: "ungeduldig", bedeutung: "impatient" },
      { wort: "lustig", bedeutung: "funny" },
      { wort: "ernst", bedeutung: "serious" },
      { wort: "bescheiden", bedeutung: "modest" },
      { wort: "arrogant", bedeutung: "arrogant" },
      { wort: "großzügig", bedeutung: "generous" },
    ],
  },
  {
    name: "Gefühle & Stimmung",
    words: [
      { wort: "glücklich", bedeutung: "happy" },
      { wort: "traurig", bedeutung: "sad" },
      { wort: "wütend", bedeutung: "angry" },
      { wort: "aufgeregt", bedeutung: "excited" },
      { wort: "müde", bedeutung: "tired" },
      { wort: "entspannt", bedeutung: "relaxed" },
      { wort: "gestresst", bedeutung: "stressed" },
      { wort: "nervös", bedeutung: "nervous" },
      { wort: "ruhig", bedeutung: "calm / quiet" },
      { wort: "fröhlich", bedeutung: "cheerful" },
      { wort: "deprimiert", bedeutung: "depressed" },
      { wort: "begeistert", bedeutung: "enthusiastic" },
      { wort: "enttäuscht", bedeutung: "disappointed" },
      { wort: "überrascht", bedeutung: "surprised" },
      { wort: "erleichtert", bedeutung: "relieved" },
    ],
  },
  {
    name: "Zeit & Häufigkeit",
    words: [
      { wort: "früh", bedeutung: "early" },
      { wort: "spät", bedeutung: "late" },
      { wort: "schnell", bedeutung: "fast" },
      { wort: "langsam", bedeutung: "slow" },
      { wort: "häufig", bedeutung: "frequent" },
      { wort: "selten", bedeutung: "rare" },
      { wort: "regelmäßig", bedeutung: "regular" },
      { wort: "dauernd", bedeutung: "constant" },
      { wort: "vorübergehend", bedeutung: "temporary" },
      { wort: "ewig", bedeutung: "eternal" },
      { wort: "modern", bedeutung: "modern" },
      { wort: "aktuell", bedeutung: "current" },
      { wort: "zukünftig", bedeutung: "future" },
      { wort: "vergangen", bedeutung: "past" },
      { wort: "täglich", bedeutung: "daily" },
    ],
  },
  {
    name: "Intelligenz & Fähigkeit",
    words: [
      { wort: "intelligent", bedeutung: "intelligent" },
      { wort: "begabt", bedeutung: "talented / gifted" },
      { wort: "kreativ", bedeutung: "creative" },
      { wort: "kompetent", bedeutung: "competent" },
      { wort: "erfahren", bedeutung: "experienced" },
      { wort: "unerfahren", bedeutung: "inexperienced" },
      { wort: "professionell", bedeutung: "professional" },
      { wort: "qualifiziert", bedeutung: "qualified" },
      { wort: "fähig", bedeutung: "capable" },
      { wort: "unfähig", bedeutung: "incapable" },
      { wort: "geschickt", bedeutung: "skillful" },
      { wort: "ungeschickt", bedeutung: "clumsy" },
      { wort: "weise", bedeutung: "wise" },
      { wort: "naiv", bedeutung: "naive" },
      { wort: "vernünftig", bedeutung: "reasonable" },
    ],
  },
  {
    name: "Natur & Umwelt",
    words: [
      { wort: "natürlich", bedeutung: "natural" },
      { wort: "künstlich", bedeutung: "artificial" },
      { wort: "wild", bedeutung: "wild" },
      { wort: "zahm", bedeutung: "tame" },
      { wort: "giftig", bedeutung: "toxic / poisonous" },
      { wort: "gesund", bedeutung: "healthy" },
      { wort: "krank", bedeutung: "sick" },
      { wort: "biologisch", bedeutung: "organic / biological" },
      { wort: "ökologisch", bedeutung: "ecological" },
      { wort: "umweltfreundlich", bedeutung: "environmentally friendly" },
      { wort: "dunkel", bedeutung: "dark — Stamm: dunkl-", typ: "besonderheit" },
      { wort: "hell", bedeutung: "bright / light" },
      { wort: "laut", bedeutung: "loud" },
      { wort: "leise", bedeutung: "quiet / soft" },
      { wort: "glatt", bedeutung: "smooth / slippery" },
    ],
  },
];

// ─── Quiz Data (15 questions) ─────────────────────────────────────────────────

const QUIZ: QuizQuestion[] = [
  {
    frage: "Der ___ Mann arbeitet hier. (alt, Nominativ Maskulin, nach 'der')",
    optionen: ["alte", "alten", "alter", "altem"],
    richtig: 0,
    erklaerung: "Schwache Deklination nach dem bestimmten Artikel: Nominativ Maskulin bekommt -e (der alte Mann).",
  },
  {
    frage: "Ich sehe den ___ Hund. (klein, Akkusativ Maskulin, nach 'den')",
    optionen: ["kleinen", "kleine", "kleiner", "kleinem"],
    richtig: 0,
    erklaerung: "Schwache Deklination: Akkusativ Maskulin nach 'den' bekommt -en (den kleinen Hund).",
  },
  {
    frage: "Er hilft der ___ Frau. (alt, Dativ Feminin, nach 'der')",
    optionen: ["alten", "alte", "alter", "altem"],
    richtig: 0,
    erklaerung: "Schwache Deklination: Dativ Feminin nach 'der' bekommt -en (der alten Frau).",
  },
  {
    frage: "Das Haus des ___ Mannes ist verkauft. (reich, Genitiv Maskulin, nach 'des')",
    optionen: ["reichen", "reiche", "reicher", "reiches"],
    richtig: 0,
    erklaerung: "Schwache Deklination: Genitiv Maskulin nach 'des' bekommt -en (des reichen Mannes).",
  },
  {
    frage: "Die ___ Bücher sind alle vergriffen. (neu, Nominativ Plural, nach 'die')",
    optionen: ["neuen", "neue", "neuer", "neues"],
    richtig: 0,
    erklaerung: "Schwache Deklination: Plural in allen Kasus bekommt -en (die neuen Bücher).",
  },
  {
    frage: "___ Kaffee schmeckt am besten. (stark, Nominativ Maskulin, kein Artikel)",
    optionen: ["Starker", "Starke", "Starkes", "Starkem"],
    richtig: 0,
    erklaerung: "Starke Deklination ohne Artikel: Nominativ Maskulin bekommt -er. Das Adjektiv zeigt selbst das Genus.",
  },
  {
    frage: "___ Wasser ist unersetzlich. (sauber, Nominativ Neutrum, kein Artikel)",
    optionen: ["Sauberes", "Saubere", "Sauberer", "Sauberem"],
    richtig: 0,
    erklaerung: "Starke Deklination ohne Artikel: Nominativ Neutrum bekommt -es (sauberes Wasser).",
  },
  {
    frage: "Sie genießt ___ Luft am Meer. (frisch, Akkusativ Feminin, kein Artikel)",
    optionen: ["frische", "frischen", "frischer", "frischem"],
    richtig: 0,
    erklaerung: "Starke Deklination ohne Artikel: Akkusativ Feminin bekommt -e (frische Luft).",
  },
  {
    frage: "Mit ___ Willen schafft man alles. (stark, Dativ Maskulin, kein Artikel)",
    optionen: ["starkem", "starken", "starker", "starke"],
    richtig: 0,
    erklaerung: "Starke Deklination ohne Artikel: Dativ Maskulin bekommt -em (mit starkem Willen).",
  },
  {
    frage: "Das ist ein ___ Hund. (groß, Nominativ Maskulin, nach 'ein')",
    optionen: ["großer", "großen", "große", "großem"],
    richtig: 0,
    erklaerung: "Gemischte Deklination: Nominativ Maskulin nach 'ein' bekommt -er, weil 'ein' das Genus nicht markiert.",
  },
  {
    frage: "Das ist ein ___ Kind. (süß, Nominativ Neutrum, nach 'ein')",
    optionen: ["süßes", "süßen", "süße", "süßem"],
    richtig: 0,
    erklaerung: "Gemischte Deklination: Nominativ Neutrum nach 'ein' bekommt -es, weil 'ein' das Genus nicht markiert.",
  },
  {
    frage: "Ich habe einen ___ Fehler gemacht. (schwer, Akkusativ Maskulin, nach 'einen')",
    optionen: ["schweren", "schwere", "schwerer", "schwerem"],
    richtig: 0,
    erklaerung: "Gemischte Deklination: Akkusativ Maskulin nach 'einen' bekommt -en (einen schweren Fehler).",
  },
  {
    frage: "Sie lebt in einer ___ Stadt. (klein, Dativ Feminin, nach 'einer')",
    optionen: ["kleinen", "kleine", "kleiner", "kleinem"],
    richtig: 0,
    erklaerung: "Gemischte Deklination: Dativ Feminin nach 'einer' bekommt -en (in einer kleinen Stadt).",
  },
  {
    frage: "Das ist ein ___ Gebäude. (hoch, Nominativ Neutrum, nach 'ein')",
    optionen: ["hohes", "hochs", "hoches", "hoch"],
    richtig: 0,
    erklaerung: "'hoch' verliert das -c- vor Endungen: Stamm = hoh- + es → hohes Gebäude.",
  },
  {
    frage: "Es war eine ___ Nacht. (dunkel, Nominativ Feminin, nach 'eine')",
    optionen: ["dunkle", "dunkele", "dunklen", "dunklen"],
    richtig: 0,
    erklaerung: "'dunkel' verliert das -e- des Stamms vor Endungen: dunkl- + e → dunkle Nacht.",
  },
];

// ─── Chapters ─────────────────────────────────────────────────────────────────

function Chapter1() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Was ist Adjektivdeklination?</h2>
      <p className="text-sm text-brand-400 mb-6">Grundlagen und Überblick der drei Typen</p>

      <InfoBox typ="merke">
        Adjektive, die <strong>attributiv</strong> (vor einem Nomen) stehen, müssen in Genus, Kasus und Numerus mit dem Nomen übereinstimmen. Die Endung hängt davon ab, welcher Artikel (wenn überhaupt) vor dem Adjektiv steht.
      </InfoBox>

      <p className="text-sm text-brand-800 leading-relaxed mb-5">
        Es gibt drei Deklinationstypen, die sich nach dem Artikelwort richten:
      </p>

      <div className="space-y-3 mb-6">
        <div className="bg-white border border-brand-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-1">Typ 1 — Schwache Deklination</p>
          <p className="text-sm text-brand-800 mb-1">Nach dem <strong>bestimmten Artikel</strong> (der, die, das) → meistens <strong>-e</strong> oder <strong>-en</strong></p>
          <p className="font-mono text-sm text-brand-600">der alt<strong className="text-brand-700">e</strong> Mann · den alt<strong className="text-brand-700">en</strong> Mann</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-1">Typ 2 — Starke Deklination</p>
          <p className="text-sm text-brand-800 mb-1"><strong>Ohne Artikel</strong> → Adjektiv übernimmt die Artikelendung selbst</p>
          <p className="font-mono text-sm text-brand-600">alt<strong className="text-brand-700">er</strong> Mann · alt<strong className="text-brand-700">em</strong> Mann</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-1">Typ 3 — Gemischte Deklination</p>
          <p className="text-sm text-brand-800 mb-1">Nach dem <strong>unbestimmten Artikel</strong> (ein, eine, kein, mein …) → Mix aus Typ 1 und Typ 2</p>
          <p className="font-mono text-sm text-brand-600">ein alt<strong className="text-brand-700">er</strong> Mann · einen alt<strong className="text-brand-700">en</strong> Mann</p>
        </div>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Beispielsätze — alle drei Typen</h3>
      <ul className="space-y-2 mb-6">
        <Beispiel kasus="Schw." text={<>Der <strong>alte</strong> Mann liest jeden Tag. (schwach, NOM M)</>} />
        <Beispiel kasus="Schw." text={<>Ich besuche die <strong>schönen</strong> Berge. (schwach, AKK PL)</>} />
        <Beispiel kasus="Stark" text={<><strong>Kalter</strong> Kaffee schmeckt nicht gut. (stark, NOM M)</>} />
        <Beispiel kasus="Stark" text={<>Er trinkt <strong>frische</strong> Milch. (stark, AKK F)</>} />
        <Beispiel kasus="Gem." text={<>Das ist ein <strong>neues</strong> Auto. (gemischt, NOM N)</>} />
        <Beispiel kasus="Gem." text={<>Sie wohnt in einer <strong>kleinen</strong> Stadt. (gemischt, DAT F)</>} />
      </ul>

      <InfoBox typ="tipp">
        <strong>Schlüsselfrage:</strong> Zeigt der Artikel bereits das Genus (Geschlecht) des Nomens? Wenn ja → <strong>schwache Endung</strong> (-e oder -en). Wenn nein → <strong>starke Endung</strong> (wie beim bestimmten Artikel).
      </InfoBox>

      <InfoBox typ="achtung">
        <strong>Prädikative Adjektive</strong> (nach sein, werden, bleiben) werden <em>nicht</em> dekliniert: Der Mann ist <strong>alt</strong>. Das Wetter war <strong>schön</strong>. Diese Regel gilt immer.
      </InfoBox>
    </div>
  );
}

function Chapter2() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Schwache Deklination</h2>
      <p className="text-sm text-brand-400 mb-6">Nach dem bestimmten Artikel der / die / das</p>

      <InfoBox typ="merke">
        Die schwache Deklination verwendet man nach dem bestimmten Artikel und nach <strong>dieser, jener, jeder, welcher, solcher, mancher, derselbe</strong>. Das Muster ist einfach: <strong>-e</strong> in fünf Feldern, <strong>-en</strong> in den übrigen sieben.
      </InfoBox>

      <AdjTable
        title='Schwache Deklination — "alt"'
        rows={[
          ["Nominativ", "der alte Mann", "die alte Frau", "das alte Kind", "die alten Kinder"],
          ["Akkusativ", "den alten Mann", "die alte Frau", "das alte Kind", "die alten Kinder"],
          ["Dativ",     "dem alten Mann", "der alten Frau", "dem alten Kind", "den alten Kindern"],
          ["Genitiv",   "des alten Mannes", "der alten Frau", "des alten Kindes", "der alten Kinder"],
        ]}
      />

      <InfoBox typ="tipp">
        <strong>5-Felder-Regel:</strong> Die Endung <strong>-e</strong> erscheint nur in fünf Feldern — NOM M, NOM F, NOM N, AKK F und AKK N. Alle anderen sieben Felder bekommen <strong>-en</strong>.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Weitere Beispiele</h3>
      <ul className="space-y-2 mb-6">
        <Beispiel kasus="NOM M" text={<>Der <strong>große</strong> Park liegt in der Stadtmitte.</>} />
        <Beispiel kasus="AKK M" text={<>Ich besuche den <strong>großen</strong> Park jeden Sonntag.</>} />
        <Beispiel kasus="DAT M" text={<>Wir spielen in dem <strong>großen</strong> Park Fußball.</>} />
        <Beispiel kasus="GEN M" text={<>Die Bäume des <strong>großen</strong> Parks sind über hundert Jahre alt.</>} />
        <Beispiel kasus="NOM F" text={<>Die <strong>neue</strong> Lehrerin ist sehr freundlich.</>} />
        <Beispiel kasus="AKK N" text={<>Ich mag das <strong>schöne</strong> Wetter im Frühling sehr.</>} />
        <Beispiel kasus="DAT PL" text={<>Er dankt den <strong>netten</strong> Kolleginnen für ihre Hilfe.</>} />
      </ul>

      <AdjTable
        title="Nur die Endungen — Schwache Deklination"
        rows={[
          ["Nominativ", "-e", "-e", "-e", "-en"],
          ["Akkusativ", "-en", "-e", "-e", "-en"],
          ["Dativ",     "-en", "-en", "-en", "-en"],
          ["Genitiv",   "-en", "-en", "-en", "-en"],
        ]}
      />
    </div>
  );
}

function Chapter3() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Starke Deklination</h2>
      <p className="text-sm text-brand-400 mb-6">Ohne Artikel — das Adjektiv trägt die Genus-Information</p>

      <InfoBox typ="merke">
        Ohne vorausgehenden Artikel muss das Adjektiv selbst Genus und Kasus des Nomens signalisieren. Es übernimmt fast alle Endungen des bestimmten Artikels. Einzige Ausnahme: Genitiv M und N bekommt <strong>-en</strong> statt -es.
      </InfoBox>

      <AdjTable
        title='Starke Deklination — "kalt"'
        rows={[
          ["Nominativ", "kalter Kaffee", "kalte Milch", "kaltes Bier", "kalte Getränke"],
          ["Akkusativ", "kalten Kaffee", "kalte Milch", "kaltes Bier", "kalte Getränke"],
          ["Dativ",     "kaltem Kaffee", "kalter Milch", "kaltem Bier", "kalten Getränken"],
          ["Genitiv",   "kalten Kaffees", "kalter Milch", "kalten Biers", "kalter Getränke"],
        ]}
      />

      <InfoBox typ="tipp">
        Vergleich mit dem bestimmten Artikel: <strong>der→-er, die→-e, das→-es, dem→-em, den→-en, des→-en</strong> (GEN M/N bekommt -en, nicht -es).
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Typische Kontexte ohne Artikel</h3>
      <ul className="space-y-2 mb-6">
        <Beispiel kasus="NOM M" text={<><strong>Frischer</strong> Fisch ist sehr gesund und lecker.</>} />
        <Beispiel kasus="AKK M" text={<>Ich trinke morgens <strong>starken</strong> Kaffee ohne Zucker.</>} />
        <Beispiel kasus="DAT M" text={<>Mit <strong>gutem</strong> Willen lässt sich alles lösen.</>} />
        <Beispiel kasus="NOM N" text={<><strong>Sauberes</strong> Wasser ist ein kostbares Gut.</>} />
        <Beispiel kasus="AKK F" text={<>Er atmet <strong>frische</strong> Bergluft in tiefen Zügen.</>} />
        <Beispiel kasus="NOM PL" text={<><strong>Große</strong> Städte haben viele kulturelle Angebote.</>} />
        <Beispiel kasus="DAT N" text={<>Bei <strong>schönem</strong> Wetter gehen wir immer spazieren.</>} />
      </ul>

      <AdjTable
        title="Nur die Endungen — Starke Deklination"
        rows={[
          ["Nominativ", "-er", "-e", "-es", "-e"],
          ["Akkusativ", "-en", "-e", "-es", "-e"],
          ["Dativ",     "-em", "-er", "-em", "-en"],
          ["Genitiv",   "-en", "-er", "-en", "-er"],
        ]}
      />

      <InfoBox typ="achtung">
        Die starke Deklination tritt auch nach <strong>viel, wenig, etwas, manch, solch</strong> (Singular) und nach <strong>viele, einige, mehrere, andere, wenige, beide</strong> (Plural) auf, wenn kein Artikel vorangeht.
      </InfoBox>
    </div>
  );
}

function Chapter4() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Gemischte Deklination</h2>
      <p className="text-sm text-brand-400 mb-6">Nach ein / eine / kein und den Possessivartikeln</p>

      <InfoBox typ="merke">
        Nach <strong>ein, eine, kein, mein, dein, sein, ihr, unser, euer</strong> gilt die gemischte Deklination: stark in den drei Feldern, wo der Artikel das Genus nicht markiert — NOM M, NOM N und AKK N. In allen anderen Feldern folgt die schwache Endung.
      </InfoBox>

      <AdjTable
        title='Gemischte Deklination — "jung"'
        rows={[
          ["Nominativ", "ein junger Mann ★", "eine junge Frau", "ein junges Kind ★", "keine jungen Kinder"],
          ["Akkusativ", "einen jungen Mann", "eine junge Frau", "ein junges Kind ★", "keine jungen Kinder"],
          ["Dativ",     "einem jungen Mann", "einer jungen Frau", "einem jungen Kind", "keinen jungen Kindern"],
          ["Genitiv",   "eines jungen Mannes", "einer jungen Frau", "eines jungen Kindes", "keiner jungen Kinder"],
        ]}
      />

      <InfoBox typ="tipp">
        Die drei ★-markierten Felder (NOM M, NOM N, AKK N) sind die einzigen mit starker Endung. Warum? Weil <em>ein / eine</em> an diesen Stellen kein sichtbares Genus-Signal hat — das Adjektiv springt ein.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Beispielsätze</h3>
      <ul className="space-y-2 mb-6">
        <Beispiel kasus="NOM M ★" text={<>Das ist ein <strong>interessanter</strong> Film — du solltest ihn sehen.</>} />
        <Beispiel kasus="NOM N ★" text={<>Das ist ein <strong>gutes</strong> Buch für Anfänger.</>} />
        <Beispiel kasus="AKK M" text={<>Ich sehe einen <strong>bekannten</strong> Schauspieler im Café.</>} />
        <Beispiel kasus="AKK N ★" text={<>Wir haben ein <strong>neues</strong> Haus am Stadtrand gekauft.</>} />
        <Beispiel kasus="DAT N" text={<>Er wohnt in einem <strong>kleinen</strong> Dorf nahe der Grenze.</>} />
        <Beispiel kasus="GEN M" text={<>Das ist das Auto eines <strong>reichen</strong> Geschäftsmannes.</>} />
        <Beispiel kasus="DAT F" text={<>Sie studiert an einer <strong>bekannten</strong> Universität in Berlin.</>} />
      </ul>

      <AdjTable
        title="Nur die Endungen — Gemischte Deklination"
        rows={[
          ["Nominativ", "-er ★", "-e", "-es ★", "-en"],
          ["Akkusativ", "-en", "-e", "-es ★", "-en"],
          ["Dativ",     "-en", "-en", "-en", "-en"],
          ["Genitiv",   "-en", "-en", "-en", "-en"],
        ]}
      />

      <InfoBox typ="achtung">
        Im Plural gibt es keinen Unterschied zwischen unbestimmtem Artikel und Verneinung: <em>keine alten Bücher</em> — hier ist kein starkes Feld, alles wird -en.
      </InfoBox>
    </div>
  );
}

function Chapter5() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Alle Tabellen im Vergleich</h2>
      <p className="text-sm text-brand-400 mb-6">Schwach · Stark · Gemischt auf einen Blick</p>

      <p className="text-sm text-brand-800 leading-relaxed mb-5">
        Die folgenden Tabellen zeigen die reinen Endungen für alle drei Deklinationstypen. Vergleiche die Muster — du wirst feststellen, dass die Endungen eng mit dem bestimmten Artikel zusammenhängen.
      </p>

      <h3 className="text-base font-semibold text-brand-900 mb-2">Schwache Deklination</h3>
      <p className="text-xs text-brand-400 mb-3">nach der / die / das / diese / jede …</p>
      <AdjTable
        rows={[
          ["Nominativ", "-e", "-e", "-e", "-en"],
          ["Akkusativ", "-en", "-e", "-e", "-en"],
          ["Dativ",     "-en", "-en", "-en", "-en"],
          ["Genitiv",   "-en", "-en", "-en", "-en"],
        ]}
      />

      <h3 className="text-base font-semibold text-brand-900 mb-2 mt-6">Starke Deklination</h3>
      <p className="text-xs text-brand-400 mb-3">ohne Artikel</p>
      <AdjTable
        rows={[
          ["Nominativ", "-er", "-e", "-es", "-e"],
          ["Akkusativ", "-en", "-e", "-es", "-e"],
          ["Dativ",     "-em", "-er", "-em", "-en"],
          ["Genitiv",   "-en", "-er", "-en", "-er"],
        ]}
      />

      <h3 className="text-base font-semibold text-brand-900 mb-2 mt-6">Gemischte Deklination</h3>
      <p className="text-xs text-brand-400 mb-3">nach ein / eine / kein / mein …</p>
      <AdjTable
        rows={[
          ["Nominativ", "-er ★", "-e", "-es ★", "-en"],
          ["Akkusativ", "-en", "-e", "-es ★", "-en"],
          ["Dativ",     "-en", "-en", "-en", "-en"],
          ["Genitiv",   "-en", "-en", "-en", "-en"],
        ]}
      />

      <InfoBox typ="merke">
        <strong>Gemischt = Stark an 3 Stellen + Schwach überall sonst.</strong> Die drei starken Stellen (★) sind genau die Kasus-Genus-Kombinationen, wo <em>ein/kein</em> selbst keine Genusmarkierung trägt (NOM M, NOM N, AKK N).
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Schnelltest:</strong> Schau dir den Artikel an. Hat er eine eindeutige Endung (-er, -e, -es, -em, -en)? Dann nimmt das Adjektiv -e oder -en (schwach). Hat der Artikel keine oder eine mehrdeutige Endung (wie bare &quot;ein&quot;)? Dann übernimmt das Adjektiv die starke Endung.
      </InfoBox>
    </div>
  );
}

function Chapter6() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Besonderheiten</h2>
      <p className="text-sm text-brand-400 mb-6">Lautveränderungen im Adjektivstamm</p>

      <h3 className="text-base font-semibold text-brand-900 mb-3">1. Adjektive auf -el → Stamm verliert -e-</h3>
      <InfoBox typ="merke">
        Adjektive mit dem Suffix <strong>-el</strong> verlieren das <strong>-e-</strong> des Stamms, sobald eine Flexionsendung folgt.
      </InfoBox>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left text-xs font-medium">Grundform</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Stamm vor Endung</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Beispiel</th>
            </tr>
          </thead>
          <tbody>
            {([
              ["dunkel", "dunkl-", "eine dunkle Nacht"],
              ["übel", "übl-", "ein übles Wetter"],
              ["edel", "edl-", "ein edler Wein"],
              ["eitel", "eitl-", "eitle Menschen"],
              ["heikel", "heikl-", "eine heikle Situation"],
            ] as [string, string, string][]).map(([g, s, b], i) => (
              <tr key={g} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-mono text-xs">{g}</td>
                <td className="px-3 py-2 font-mono text-xs text-brand-600">{s}</td>
                <td className="px-3 py-2 text-xs text-brand-800">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-brand-900 mb-3">2. Adjektive auf -er nach langem Vokal → -e- kann entfallen</h3>
      <InfoBox typ="merke">
        Bei <strong>teuer, sauer, heiter</strong> und ähnlichen Adjektiven kann (bei teuer: muss) das innere <strong>-e-</strong> wegfallen, wenn eine Endung folgt.
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel kasus="teuer" text={<>ein <strong>teures</strong> Auto (nicht: teueres) — e-Ausfall obligatorisch</>} />
        <Beispiel kasus="sauer" text={<><strong>saurer</strong> Regen (auch: sauerer möglich, aber selten)</>} />
        <Beispiel kasus="heiter" text={<><strong>heiteres</strong> Wetter (das -e- bleibt hier meistens)</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">3. hoch → Stamm hoh-</h3>
      <InfoBox typ="merke">
        <strong>hoch</strong> ist unregelmäßig: das <strong>-c-</strong> fällt vor jeder Endung weg. Der Stamm wird zu <strong>hoh-</strong>.
      </InfoBox>
      <ul className="space-y-2 mb-5">
        <Beispiel kasus="NOM N" text={<>Das ist ein <strong>hohes</strong> Gebäude. (nicht: hochs oder hoches)</>} />
        <Beispiel kasus="AKK M" text={<>Wir besteigen den <strong>hohen</strong> Berg in der Schweiz.</>} />
        <Beispiel kasus="NOM F" text={<>Die <strong>hohe</strong> Temperatur ist für den Sommer ungewöhnlich.</>} />
        <Beispiel kasus="DAT PL" text={<>In den <strong>hohen</strong> Bergen liegt noch viel Schnee.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">4. Partizipien als Adjektive</h3>
      <p className="text-sm text-brand-800 leading-relaxed mb-3">
        Partizip I (P1) und Partizip II (P2) werden wie gewöhnliche Adjektive dekliniert und folgen denselben Regeln.
      </p>
      <ul className="space-y-2 mb-5">
        <Beispiel kasus="P1" text={<>der <strong>laufende</strong> Motor · einen <strong>lachenden</strong> Mann</>} />
        <Beispiel kasus="P2" text={<>das <strong>gebaute</strong> Haus · ein <strong>geschriebener</strong> Brief</>} />
        <Beispiel kasus="P2" text={<>ein <strong>verletzter</strong> Spieler · die <strong>gebratene</strong> Wurst</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">5. Ortsnamen-Adjektive auf -er (unveränderlich)</h3>
      <InfoBox typ="achtung">
        Von Ortsnamen abgeleitete Adjektive auf <strong>-er</strong> werden <em>nie</em> dekliniert — sie bleiben in jeder Position gleich.
      </InfoBox>
      <ul className="space-y-2 mb-4">
        <Beispiel kasus="—" text={<>das <strong>Berliner</strong> Bier · eine <strong>Berliner</strong> Zeitung</>} />
        <Beispiel kasus="—" text={<>der <strong>Münchner</strong> Hauptbahnhof · die <strong>Wiener</strong> Philharmoniker</>} />
        <Beispiel kasus="—" text={<>ein <strong>Schweizer</strong> Käse · <strong>Schweizer</strong> Uhren sind berühmt.</>} />
      </ul>
    </div>
  );
}

function Chapter7() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Sonderfälle</h2>
      <p className="text-sm text-brand-400 mb-6">Unveränderliche Adjektive und weitere Ausnahmen</p>

      <h3 className="text-base font-semibold text-brand-900 mb-3">1. Unveränderliche Farbadjektive</h3>
      <InfoBox typ="achtung">
        Einige Farbadjektive — meist aus anderen Sprachen entlehnt — werden <strong>nicht dekliniert</strong> und bleiben immer in der Grundform.
      </InfoBox>
      <div className="flex flex-wrap gap-2 mb-4">
        {["lila", "rosa", "orange", "beige", "creme", "bordeaux", "oliv", "ecru"].map((w) => (
          <span key={w} className="px-2 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono">{w}</span>
        ))}
      </div>
      <ul className="space-y-2 mb-6">
        <Beispiel kasus="NOM" text={<>Das ist ein <strong>lila</strong> Kleid. (nicht: lilaes oder lilanes)</>} />
        <Beispiel kasus="AKK" text={<>Sie kauft einen <strong>rosa</strong> Pullover. (nicht: rosanen)</>} />
        <Beispiel kasus="DAT" text={<>Er malt mit <strong>orange</strong> Farbe die Wand an.</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">2. Nach viel / wenig / einige / mehrere …</h3>
      <InfoBox typ="merke">
        Nach <strong>viel, wenig, etwas, mehr, manch, solch</strong> (Singular ohne Artikel) folgt die <em>starke</em> Deklination. Nach <strong>viele, einige, mehrere, andere, wenige, beide</strong> (Plural) ebenfalls.
      </InfoBox>
      <ul className="space-y-2 mb-6">
        <Beispiel kasus="—" text={<>viel <strong>kaltes</strong> Wasser (stark N, NOM)</>} />
        <Beispiel kasus="—" text={<>wenig <strong>freie</strong> Zeit (stark F, AKK)</>} />
        <Beispiel kasus="—" text={<>einige <strong>nette</strong> Leute (stark PL, NOM)</>} />
        <Beispiel kasus="—" text={<>mehrere <strong>gute</strong> Gründe (stark PL, NOM)</>} />
        <Beispiel kasus="—" text={<>beide <strong>alten</strong> Männer (stark PL, NOM)</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">3. Zwei aufeinanderfolgende Adjektive</h3>
      <InfoBox typ="merke">
        Folgen zwei Adjektive aufeinander, tragen <strong>beide die gleiche Endung</strong>, die durch den Artikel bestimmt wird.
      </InfoBox>
      <ul className="space-y-2 mb-6">
        <Beispiel kasus="Schw." text={<>der alt<strong>e</strong>, weis<strong>e</strong> Professor spricht langsam.</>} />
        <Beispiel kasus="Stark" text={<>mit frisch<strong>em</strong>, kalt<strong>em</strong> Quellwasser</>} />
        <Beispiel kasus="Gem." text={<>ein jung<strong>er</strong>, erfahr<strong>ener</strong> Arzt — das zweite Adj. wird schwach!</>} />
        <Beispiel kasus="Gem." text={<>eines jung<strong>en</strong>, erfahren<strong>en</strong> Arztes</>} />
      </ul>

      <h3 className="text-base font-semibold text-brand-900 mb-3">4. Adjektive nach all-, sämtlich-</h3>
      <InfoBox typ="tipp">
        Nach <strong>all-</strong> und <strong>sämtlich-</strong> folgt die <em>schwache</em> Deklination, da diese Wörter das Genus klar markieren:
      </InfoBox>
      <ul className="space-y-2 mb-4">
        <Beispiel kasus="—" text={<>alle <strong>alten</strong> Bücher · aller <strong>alten</strong> Bücher</>} />
        <Beispiel kasus="—" text={<>sämtliche <strong>neuen</strong> Mitglieder wurden begrüßt.</>} />
        <Beispiel kasus="—" text={<>mit allem <strong>guten</strong> Willen</>} />
      </ul>
    </div>
  );
}

function Chapter8() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Tipps & Tricks</h2>
      <p className="text-sm text-brand-400 mb-6">Lernstrategien, Eselsbrücken und Top-10-Liste</p>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Die wichtigsten Eselsbrücken</h3>

      <InfoBox typ="tipp">
        <strong>Tipp 1 — Der Artikel zeigt den Weg:</strong> Frag dich: <em>Zeigt der Artikel schon das Genus?</em> Wenn ja (der/die/das/dem/den/des) → schwach (-e/-en). Wenn nein (z. B. bare &quot;ein&quot; im NOM M) → stark.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 2 — 5-Felder-Regel für Schwach:</strong> Die Endung <em>-e</em> erscheint nur in 5 Feldern: NOM M/F/N und AKK F/N. Alles andere ist <em>-en</em>. Lerne diese 5 Felder auswendig.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 3 — 3 Felder für Gemischt:</strong> Nur NOM M (-er), NOM N (-es) und AKK N (-es) sind stark. Alle anderen 9 Felder der gemischten Deklination bekommen die schwache Endung.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 4 — Stark = Artikelkopie:</strong> Bei der starken Deklination kopiere einfach die Endung des bestimmten Artikels auf das Adjektiv: <em>der</em> → -er, <em>die</em> → -e, <em>das</em> → -es, <em>dem</em> → -em, <em>den</em> → -en. Genitiv M/N: -en (nicht -es).
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 5 — Sonderformen merken: hoch und dunkel:</strong> Zwei häufige Adjektive haben Stammalternationen: <em>hoch → hoh-</em> (verliert -c-) und <em>dunkel → dunkl-</em> (verliert inneres -e-). Diese auswendig lernen!
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 6 — Unveränderliche Farben:</strong> lila, rosa, orange, beige werden nie dekliniert. Wenn du unsicher bist, ob eine Farbe unveränderlich ist — hat sie keine deutschen Wurzeln? Dann ist sie wahrscheinlich unveränderlich.
      </InfoBox>

      <InfoBox typ="tipp">
        <strong>Tipp 7 — Prädikativ = Grundform:</strong> Adjektive nach sein / werden / bleiben / scheinen bekommen nie eine Endung: <em>Der Himmel ist blau. Das Essen war gut.</em> Daran gibt es keine Ausnahme.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-6">Top-10 häufigste attributive Adjektive im Deutschen</h3>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          ["1. gut", "gut-e / gut-en / gut-em …"],
          ["2. neu", "neu-e / neu-en / neu-em …"],
          ["3. groß", "groß-e / groß-en / groß-em …"],
          ["4. alt", "alt-e / alt-en / alt-em …"],
          ["5. deutsch", "deutsch-e / deutsch-en …"],
          ["6. klein", "klein-e / klein-en …"],
          ["7. jung", "jung-e / jung-en / jung-em …"],
          ["8. lang", "lang-e / lang-en …"],
          ["9. stark", "stark-e / stark-en …"],
          ["10. schön", "schön-e / schön-en …"],
        ].map(([adj, pattern]) => (
          <div key={adj} className="bg-white border border-brand-100 rounded-xl px-3 py-2">
            <p className="font-semibold text-sm text-brand-900">{adj}</p>
            <p className="text-[10px] text-brand-400 font-mono mt-0.5">{pattern}</p>
          </div>
        ))}
      </div>

      <InfoBox typ="merke">
        <strong>Kurzformel zum Einprägen:</strong><br />
        Schwach: nach DER-Wörtern → <strong>-e / -en</strong><br />
        Stark: ohne Artikel → <strong>Artikelendung übernehmen</strong><br />
        Gemischt: nach EIN-Wörtern → <strong>stark wo nötig, sonst schwach</strong>
      </InfoBox>
    </div>
  );
}

function Chapter9() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return KATEGORIEN;
    return KATEGORIEN.map((cat) => ({
      ...cat,
      words: cat.words.filter(
        (w) =>
          w.wort.toLowerCase().includes(q) ||
          w.bedeutung.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.words.length > 0);
  }, [query]);

  const totalCount = KATEGORIEN.reduce((acc, cat) => acc + cat.words.length, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Wortliste</h2>
      <p className="text-sm text-brand-400 mb-4">{totalCount} häufige Adjektive · kategorisiert</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
        <input
          type="text"
          placeholder="Adjektiv oder Bedeutung suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-200 text-sm text-brand-800 placeholder:text-brand-300 focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex gap-4 mb-5 text-[10px] text-brand-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-2 border-l-orange-400 bg-orange-50 inline-block" />
          Unveränderlich
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-2 border-l-red-400 bg-red-50 inline-block" />
          Besonderheit (Stamm)
        </span>
      </div>

      {filtered.map((cat) => (
        <div key={cat.name} className="mb-6">
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-2">{cat.name}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cat.words.map((w) => {
              const cardStyle =
                w.typ === "unveraenderlich" ? "border-l-4 border-l-orange-400 bg-orange-50" :
                w.typ === "besonderheit"    ? "border-l-4 border-l-red-400 bg-red-50"       :
                                             "bg-white border border-brand-100";
              return (
                <div key={w.wort} className={`rounded-xl px-3 py-2 ${cardStyle}`}>
                  <p className="font-semibold text-sm text-brand-900">{w.wort}</p>
                  <p className="text-xs text-brand-400 mt-0.5 leading-tight">{w.bedeutung}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Chapter10() {
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
      <p className="text-sm text-brand-400 mb-6">{QUIZ.length} Aufgaben zu allen drei Deklinationstypen</p>

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
              <p className="text-sm text-brand-800 mb-3 font-mono leading-relaxed">{q.frage}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
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
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${style}`}
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

// ─── Chapter 10: Zusammenfassung ─────────────────────────────────────────────

function ChapterZusammenfassung() {
  return (
    <div>
      <h2 className="text-xl font-bold text-brand-950 mb-1">Zusammenfassung</h2>
      <p className="text-sm text-brand-400 mb-6">Alle Endungen auf einen Blick mit Beispielen</p>

      <InfoBox typ="merke">
        Die Adjektivendung hängt von drei Faktoren ab: <strong>Artikeltyp</strong> (bestimmt/unbestimmt/kein),
        <strong> Kasus</strong> (NOM/AKK/DAT/GEN) und <strong>Genus</strong> (M/F/N/Pl).
        Schwach = nach bestimmtem Artikel · Stark = ohne Artikel · Gemischt = nach unbestimmtem Artikel / Possessivpronomen.
      </InfoBox>

      <h3 className="text-base font-semibold text-brand-900 mb-3">Schwache Deklination (nach bestimmtem Artikel)</h3>
      <AdjTable
        rows={[
          ["NOM", "der alt-e Mann", "die alt-e Frau", "das alt-e Kind", "die alt-en Kinder"],
          ["AKK", "den alt-en Mann", "die alt-e Frau", "das alt-e Kind", "die alt-en Kinder"],
          ["DAT", "dem alt-en Mann", "der alt-en Frau", "dem alt-en Kind", "den alt-en Kindern"],
          ["GEN", "des alt-en Mannes", "der alt-en Frau", "des alt-en Kindes", "der alt-en Kinder"],
        ]}
      />

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-6">Starke Deklination (ohne Artikel)</h3>
      <AdjTable
        rows={[
          ["NOM", "alt-er Wein", "frisch-e Luft", "kalt-es Wasser", "heiß-e Getränke"],
          ["AKK", "alt-en Wein", "frisch-e Luft", "kalt-es Wasser", "heiß-e Getränke"],
          ["DAT", "alt-em Wein", "frisch-er Luft", "kalt-em Wasser", "heiß-en Getränken"],
          ["GEN", "alt-en Weines", "frisch-er Luft", "kalt-en Wassers", "heiß-er Getränke"],
        ]}
      />

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-6">Gemischte Deklination (nach unbestimmtem Artikel / Possessivpronomen)</h3>
      <div className="text-xs text-brand-400 mb-2">★ = starke Endung (Artikelinformation fehlt)</div>
      <AdjTable
        rows={[
          ["NOM", "ein alt-er★ Mann", "eine alt-e Frau", "ein alt-es★ Kind", "meine alt-en Kinder"],
          ["AKK", "einen alt-en Mann", "eine alt-e Frau", "ein alt-es★ Kind", "meine alt-en Kinder"],
          ["DAT", "einem alt-en Mann", "einer alt-en Frau", "einem alt-en Kind", "meinen alt-en Kindern"],
          ["GEN", "eines alt-en Mannes", "einer alt-en Frau", "eines alt-en Kindes", "meiner alt-en Kinder"],
        ]}
      />

      <h3 className="text-base font-semibold text-brand-900 mb-3 mt-6">Schnellübersicht: Endungen im Vergleich</h3>
      <div className="overflow-x-auto rounded-lg border border-brand-100 mb-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-950 text-white">
              <th className="px-3 py-2 text-left font-medium text-xs">Kasus / Genus</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Schwach</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Stark</th>
              <th className="px-3 py-2 text-left font-medium text-xs">Gemischt</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["NOM Maskulin", "-e", "-er", "-er ★"],
              ["NOM Feminin",  "-e", "-e",  "-e"],
              ["NOM Neutrum",  "-e", "-es", "-es ★"],
              ["NOM Plural",   "-en","-e",  "-en"],
              ["AKK Maskulin", "-en","-en", "-en"],
              ["AKK Feminin",  "-e", "-e",  "-e"],
              ["AKK Neutrum",  "-e", "-es", "-es ★"],
              ["AKK Plural",   "-en","-e",  "-en"],
              ["DAT Maskulin", "-en","-em", "-en"],
              ["DAT Feminin",  "-en","-er", "-en"],
              ["DAT Neutrum",  "-en","-em", "-en"],
              ["DAT Plural",   "-en","-en", "-en"],
              ["GEN Maskulin", "-en","-en", "-en"],
              ["GEN Feminin",  "-en","-er", "-en"],
              ["GEN Neutrum",  "-en","-en", "-en"],
              ["GEN Plural",   "-en","-er", "-en"],
            ].map(([kasus, sw, st, gm], i) => (
              <tr key={kasus} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs whitespace-nowrap">{kasus}</td>
                <td className="px-3 py-2 text-brand-800">{sw}</td>
                <td className="px-3 py-2 text-brand-800">{st}</td>
                <td className="px-3 py-2 text-brand-800 font-medium">{gm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox typ="tipp">
        Faustregel: <strong>Nur 3 Positionen sind stark im Gemischt</strong> — NOM M, NOM N, AKK N.
        Überall sonst endet das Adjektiv auf <strong>-en</strong> oder folgt der schwachen Endung.
      </InfoBox>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const TABS = [
  "1. Einführung",
  "2. Schwach",
  "3. Stark",
  "4. Gemischt",
  "5. Tabellen",
  "6. Besonderheiten",
  "7. Sonderfälle",
  "8. Tipps & Tricks",
  "9. Wortliste",
  "10. Zusammenfassung",
  "11. Übungen",
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
  ChapterZusammenfassung,
  Chapter10,
];

export function AdjektivDeklinationClient() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveChapter = CHAPTERS[activeTab];

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-2">
        <h1 className="text-3xl font-bold text-brand-950 mb-1">Adjektivdeklination</h1>
        <p className="text-sm text-brand-400 mb-1">Schwache · Starke · Gemischte Deklination</p>
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
