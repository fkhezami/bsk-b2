"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, RotateCcw } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WordEntry {
  artikel: string;
  wort: string;
  genitiv: string;
  plural: string;
  typ?: "gemischt" | "sonderfall" | "neutrum";
}

interface WordCategory {
  name: string;
  words: WordEntry[];
}

interface QuizQuestion {
  frage: string;
  optionen: string[];
  richtig: number;
  erklaerung: string;
}

// ─── Word List Data (~177 Nomen) ───────────────────────────────────────────────

const CATEGORIES: WordCategory[] = [
  {
    name: "Menschen & soziale Rollen",
    words: [
      { artikel: "der", wort: "Mensch", genitiv: "des Menschen", plural: "die Menschen", typ: "sonderfall" },
      { artikel: "der", wort: "Junge", genitiv: "des Jungen", plural: "die Jungen" },
      { artikel: "der", wort: "Knabe", genitiv: "des Knaben", plural: "die Knaben" },
      { artikel: "der", wort: "Herr", genitiv: "des Herrn", plural: "die Herren", typ: "sonderfall" },
      { artikel: "der", wort: "Bote", genitiv: "des Boten", plural: "die Boten" },
      { artikel: "der", wort: "Erbe", genitiv: "des Erben", plural: "die Erben" },
      { artikel: "der", wort: "Zeuge", genitiv: "des Zeugen", plural: "die Zeugen" },
      { artikel: "der", wort: "Genosse", genitiv: "des Genossen", plural: "die Genossen" },
      { artikel: "der", wort: "Kollege", genitiv: "des Kollegen", plural: "die Kollegen" },
      { artikel: "der", wort: "Experte", genitiv: "des Experten", plural: "die Experten" },
      { artikel: "der", wort: "Laie", genitiv: "des Laien", plural: "die Laien" },
      { artikel: "der", wort: "Rivale", genitiv: "des Rivalen", plural: "die Rivalen" },
      { artikel: "der", wort: "Sklave", genitiv: "des Sklaven", plural: "die Sklaven" },
      { artikel: "der", wort: "Kamerad", genitiv: "des Kameraden", plural: "die Kameraden" },
      { artikel: "der", wort: "Pate", genitiv: "des Paten", plural: "die Paten" },
      { artikel: "der", wort: "Gefährte", genitiv: "des Gefährten", plural: "die Gefährten" },
      { artikel: "der", wort: "Komplize", genitiv: "des Komplizen", plural: "die Komplizen" },
      { artikel: "der", wort: "Vorfahre", genitiv: "des Vorfahren", plural: "die Vorfahren" },
      { artikel: "der", wort: "Insasse", genitiv: "des Insassen", plural: "die Insassen" },
      { artikel: "der", wort: "Lotse", genitiv: "des Lotsen", plural: "die Lotsen" },
      { artikel: "der", wort: "Matrose", genitiv: "des Matrosen", plural: "die Matrosen" },
      { artikel: "der", wort: "Riese", genitiv: "des Riesen", plural: "die Riesen" },
      { artikel: "der", wort: "Bürge", genitiv: "des Bürgen", plural: "die Bürgen" },
      { artikel: "der", wort: "Nachbar", genitiv: "des Nachbarn", plural: "die Nachbarn", typ: "sonderfall" },
      { artikel: "der", wort: "Bauer", genitiv: "des Bauern", plural: "die Bauern", typ: "sonderfall" },
    ],
  },
  {
    name: "Adel, Helden & Antagonisten",
    words: [
      { artikel: "der", wort: "Held", genitiv: "des Helden", plural: "die Helden" },
      { artikel: "der", wort: "Fürst", genitiv: "des Fürsten", plural: "die Fürsten" },
      { artikel: "der", wort: "Graf", genitiv: "des Grafen", plural: "die Grafen" },
      { artikel: "der", wort: "Prinz", genitiv: "des Prinzen", plural: "die Prinzen" },
      { artikel: "der", wort: "Narr", genitiv: "des Narren", plural: "die Narren" },
      { artikel: "der", wort: "Barde", genitiv: "des Barden", plural: "die Barden" },
      { artikel: "der", wort: "Tyrann", genitiv: "des Tyrannen", plural: "die Tyrannen" },
      { artikel: "der", wort: "Monarch", genitiv: "des Monarchen", plural: "die Monarchen" },
      { artikel: "der", wort: "Barbar", genitiv: "des Barbaren", plural: "die Barbaren" },
      { artikel: "der", wort: "Vagabund", genitiv: "des Vagabunden", plural: "die Vagabunden" },
      { artikel: "der", wort: "Rebell", genitiv: "des Rebellen", plural: "die Rebellen" },
      { artikel: "der", wort: "Bandit", genitiv: "des Banditen", plural: "die Banditen" },
      { artikel: "der", wort: "Patriot", genitiv: "des Patrioten", plural: "die Patrioten" },
    ],
  },
  {
    name: "Berufe & Akademiker (-ent / -ant / -at / -and)",
    words: [
      { artikel: "der", wort: "Student", genitiv: "des Studenten", plural: "die Studenten" },
      { artikel: "der", wort: "Präsident", genitiv: "des Präsidenten", plural: "die Präsidenten" },
      { artikel: "der", wort: "Patient", genitiv: "des Patienten", plural: "die Patienten" },
      { artikel: "der", wort: "Assistent", genitiv: "des Assistenten", plural: "die Assistenten" },
      { artikel: "der", wort: "Dozent", genitiv: "des Dozenten", plural: "die Dozenten" },
      { artikel: "der", wort: "Dirigent", genitiv: "des Dirigenten", plural: "die Dirigenten" },
      { artikel: "der", wort: "Absolvent", genitiv: "des Absolventen", plural: "die Absolventen" },
      { artikel: "der", wort: "Referent", genitiv: "des Referenten", plural: "die Referenten" },
      { artikel: "der", wort: "Produzent", genitiv: "des Produzenten", plural: "die Produzenten" },
      { artikel: "der", wort: "Konsument", genitiv: "des Konsumenten", plural: "die Konsumenten" },
      { artikel: "der", wort: "Agent", genitiv: "des Agenten", plural: "die Agenten" },
      { artikel: "der", wort: "Praktikant", genitiv: "des Praktikanten", plural: "die Praktikanten" },
      { artikel: "der", wort: "Demonstrant", genitiv: "des Demonstranten", plural: "die Demonstranten" },
      { artikel: "der", wort: "Lieferant", genitiv: "des Lieferanten", plural: "die Lieferanten" },
      { artikel: "der", wort: "Fabrikant", genitiv: "des Fabrikanten", plural: "die Fabrikanten" },
      { artikel: "der", wort: "Musikant", genitiv: "des Musikanten", plural: "die Musikanten" },
      { artikel: "der", wort: "Doktorand", genitiv: "des Doktoranden", plural: "die Doktoranden" },
      { artikel: "der", wort: "Kandidat", genitiv: "des Kandidaten", plural: "die Kandidaten" },
      { artikel: "der", wort: "Soldat", genitiv: "des Soldaten", plural: "die Soldaten" },
      { artikel: "der", wort: "Diplomat", genitiv: "des Diplomaten", plural: "die Diplomaten" },
      { artikel: "der", wort: "Bürokrat", genitiv: "des Bürokraten", plural: "die Bürokraten" },
      { artikel: "der", wort: "Demokrat", genitiv: "des Demokraten", plural: "die Demokraten" },
      { artikel: "der", wort: "Aristokrat", genitiv: "des Aristokraten", plural: "die Aristokraten" },
      { artikel: "der", wort: "Pirat", genitiv: "des Piraten", plural: "die Piraten" },
      { artikel: "der", wort: "Akrobat", genitiv: "des Akrobaten", plural: "die Akrobaten" },
      { artikel: "der", wort: "Astronaut", genitiv: "des Astronauten", plural: "die Astronauten" },
      { artikel: "der", wort: "Kosmonaut", genitiv: "des Kosmonauten", plural: "die Kosmonauten" },
      { artikel: "der", wort: "Architekt", genitiv: "des Architekten", plural: "die Architekten" },
      { artikel: "der", wort: "Ökonom", genitiv: "des Ökonomen", plural: "die Ökonomen" },
      { artikel: "der", wort: "Korrespondent", genitiv: "des Korrespondenten", plural: "die Korrespondenten" },
      { artikel: "der", wort: "Regent", genitiv: "des Regenten", plural: "die Regenten" },
      { artikel: "der", wort: "Delegat", genitiv: "des Delegaten", plural: "die Delegaten" },
      { artikel: "der", wort: "Kommandant", genitiv: "des Kommandanten", plural: "die Kommandanten" },
      { artikel: "der", wort: "Stipendiat", genitiv: "des Stipendiaten", plural: "die Stipendiaten" },
      { artikel: "der", wort: "Klient", genitiv: "des Klienten", plural: "die Klienten" },
      { artikel: "der", wort: "Konkurrent", genitiv: "des Konkurrenten", plural: "die Konkurrenten" },
      { artikel: "der", wort: "Intrigant", genitiv: "des Intriganten", plural: "die Intriganten" },
      { artikel: "der", wort: "Komödiant", genitiv: "des Komödianten", plural: "die Komödianten" },
    ],
  },
  {
    name: "Gesinnungen & Weltanschauungen (-ist)",
    words: [
      { artikel: "der", wort: "Tourist", genitiv: "des Touristen", plural: "die Touristen" },
      { artikel: "der", wort: "Polizist", genitiv: "des Polizisten", plural: "die Polizisten" },
      { artikel: "der", wort: "Journalist", genitiv: "des Journalisten", plural: "die Journalisten" },
      { artikel: "der", wort: "Pianist", genitiv: "des Pianisten", plural: "die Pianisten" },
      { artikel: "der", wort: "Optimist", genitiv: "des Optimisten", plural: "die Optimisten" },
      { artikel: "der", wort: "Pessimist", genitiv: "des Pessimisten", plural: "die Pessimisten" },
      { artikel: "der", wort: "Kommunist", genitiv: "des Kommunisten", plural: "die Kommunisten" },
      { artikel: "der", wort: "Anarchist", genitiv: "des Anarchisten", plural: "die Anarchisten" },
      { artikel: "der", wort: "Realist", genitiv: "des Realisten", plural: "die Realisten" },
      { artikel: "der", wort: "Idealist", genitiv: "des Idealisten", plural: "die Idealisten" },
      { artikel: "der", wort: "Spezialist", genitiv: "des Spezialisten", plural: "die Spezialisten" },
      { artikel: "der", wort: "Linguist", genitiv: "des Linguisten", plural: "die Linguisten" },
      { artikel: "der", wort: "Kapitalist", genitiv: "des Kapitalisten", plural: "die Kapitalisten" },
      { artikel: "der", wort: "Sozialist", genitiv: "des Sozialisten", plural: "die Sozialisten" },
      { artikel: "der", wort: "Nationalist", genitiv: "des Nationalisten", plural: "die Nationalisten" },
      { artikel: "der", wort: "Humanist", genitiv: "des Humanisten", plural: "die Humanisten" },
      { artikel: "der", wort: "Terrorist", genitiv: "des Terroristen", plural: "die Terroristen" },
      { artikel: "der", wort: "Extremist", genitiv: "des Extremisten", plural: "die Extremisten" },
      { artikel: "der", wort: "Protagonist", genitiv: "des Protagonisten", plural: "die Protagonisten" },
      { artikel: "der", wort: "Aktivist", genitiv: "des Aktivisten", plural: "die Aktivisten" },
      { artikel: "der", wort: "Pazifist", genitiv: "des Pazifisten", plural: "die Pazifisten" },
      { artikel: "der", wort: "Bassist", genitiv: "des Bassisten", plural: "die Bassisten" },
    ],
  },
  {
    name: "Wissenschaftler (-ologe / -ograph)",
    words: [
      { artikel: "der", wort: "Psychologe", genitiv: "des Psychologen", plural: "die Psychologen" },
      { artikel: "der", wort: "Soziologe", genitiv: "des Soziologen", plural: "die Soziologen" },
      { artikel: "der", wort: "Biologe", genitiv: "des Biologen", plural: "die Biologen" },
      { artikel: "der", wort: "Theologe", genitiv: "des Theologen", plural: "die Theologen" },
      { artikel: "der", wort: "Astrologe", genitiv: "des Astrologen", plural: "die Astrologen" },
      { artikel: "der", wort: "Archäologe", genitiv: "des Archäologen", plural: "die Archäologen" },
      { artikel: "der", wort: "Pädagoge", genitiv: "des Pädagogen", plural: "die Pädagogen" },
      { artikel: "der", wort: "Kardiologe", genitiv: "des Kardiologen", plural: "die Kardiologen" },
      { artikel: "der", wort: "Geologe", genitiv: "des Geologen", plural: "die Geologen" },
      { artikel: "der", wort: "Philologe", genitiv: "des Philologen", plural: "die Philologen" },
      { artikel: "der", wort: "Ethnologe", genitiv: "des Ethnologen", plural: "die Ethnologen" },
      { artikel: "der", wort: "Meteorologe", genitiv: "des Meteorologen", plural: "die Meteorologen" },
      { artikel: "der", wort: "Zoologe", genitiv: "des Zoologen", plural: "die Zoologen" },
      { artikel: "der", wort: "Neurologe", genitiv: "des Neurologen", plural: "die Neurologen" },
      { artikel: "der", wort: "Dermatologe", genitiv: "des Dermatologen", plural: "die Dermatologen" },
    ],
  },
  {
    name: "Tiere",
    words: [
      { artikel: "der", wort: "Affe", genitiv: "des Affen", plural: "die Affen" },
      { artikel: "der", wort: "Löwe", genitiv: "des Löwen", plural: "die Löwen" },
      { artikel: "der", wort: "Bär", genitiv: "des Bären", plural: "die Bären" },
      { artikel: "der", wort: "Hase", genitiv: "des Hasen", plural: "die Hasen" },
      { artikel: "der", wort: "Rabe", genitiv: "des Raben", plural: "die Raben" },
      { artikel: "der", wort: "Bulle", genitiv: "des Bullen", plural: "die Bullen" },
      { artikel: "der", wort: "Ochse", genitiv: "des Ochsen", plural: "die Ochsen" },
      { artikel: "der", wort: "Falke", genitiv: "des Falken", plural: "die Falken" },
      { artikel: "der", wort: "Spatz", genitiv: "des Spatzen", plural: "die Spatzen" },
      { artikel: "der", wort: "Fink", genitiv: "des Finken", plural: "die Finken" },
      { artikel: "der", wort: "Rüde", genitiv: "des Rüden", plural: "die Rüden" },
      { artikel: "der", wort: "Drache", genitiv: "des Drachen", plural: "die Drachen" },
      { artikel: "der", wort: "Schimpanse", genitiv: "des Schimpansen", plural: "die Schimpansen" },
      { artikel: "der", wort: "Parasit", genitiv: "des Parasiten", plural: "die Parasiten" },
    ],
  },
  {
    name: "Nationalitäten (N-Deklination)",
    words: [
      { artikel: "der", wort: "Franzose", genitiv: "des Franzosen", plural: "die Franzosen" },
      { artikel: "der", wort: "Chinese", genitiv: "des Chinesen", plural: "die Chinesen" },
      { artikel: "der", wort: "Türke", genitiv: "des Türken", plural: "die Türken" },
      { artikel: "der", wort: "Grieche", genitiv: "des Griechen", plural: "die Griechen" },
      { artikel: "der", wort: "Pole", genitiv: "des Polen", plural: "die Polen" },
      { artikel: "der", wort: "Russe", genitiv: "des Russen", plural: "die Russen" },
      { artikel: "der", wort: "Finne", genitiv: "des Finnen", plural: "die Finnen" },
      { artikel: "der", wort: "Schwede", genitiv: "des Schweden", plural: "die Schweden" },
      { artikel: "der", wort: "Tscheche", genitiv: "des Tschechen", plural: "die Tschechen" },
      { artikel: "der", wort: "Rumäne", genitiv: "des Rumänen", plural: "die Rumänen" },
      { artikel: "der", wort: "Slowake", genitiv: "des Slowaken", plural: "die Slowaken" },
      { artikel: "der", wort: "Kroate", genitiv: "des Kroaten", plural: "die Kroaten" },
      { artikel: "der", wort: "Serbe", genitiv: "des Serben", plural: "die Serben" },
      { artikel: "der", wort: "Kurde", genitiv: "des Kurden", plural: "die Kurden" },
      { artikel: "der", wort: "Ire", genitiv: "des Iren", plural: "die Iren" },
      { artikel: "der", wort: "Afghane", genitiv: "des Afghanen", plural: "die Afghanen" },
      { artikel: "der", wort: "Bulgare", genitiv: "des Bulgaren", plural: "die Bulgaren" },
      { artikel: "der", wort: "Brite", genitiv: "des Briten", plural: "die Briten" },
      { artikel: "der", wort: "Däne", genitiv: "des Dänen", plural: "die Dänen" },
      { artikel: "der", wort: "Schotte", genitiv: "des Schotten", plural: "die Schotten" },
      { artikel: "der", wort: "Portugiese", genitiv: "des Portugiesen", plural: "die Portugiesen" },
      { artikel: "der", wort: "Libanese", genitiv: "des Libanesen", plural: "die Libanesen" },
      { artikel: "der", wort: "Este", genitiv: "des Esten", plural: "die Esten" },
      { artikel: "der", wort: "Lette", genitiv: "des Letten", plural: "die Letten" },
    ],
  },
  {
    name: "Religion & Philosophie",
    words: [
      { artikel: "der", wort: "Prophet", genitiv: "des Propheten", plural: "die Propheten" },
      { artikel: "der", wort: "Heide", genitiv: "des Heiden", plural: "die Heiden" },
      { artikel: "der", wort: "Eremit", genitiv: "des Eremiten", plural: "die Eremiten" },
      { artikel: "der", wort: "Philosoph", genitiv: "des Philosophen", plural: "die Philosophen" },
      { artikel: "der", wort: "Apostat", genitiv: "des Apostaten", plural: "die Apostaten" },
    ],
  },
  {
    name: "Astronomie, Technik & Natur",
    words: [
      { artikel: "der", wort: "Planet", genitiv: "des Planeten", plural: "die Planeten" },
      { artikel: "der", wort: "Komet", genitiv: "des Kometen", plural: "die Kometen" },
      { artikel: "der", wort: "Satellit", genitiv: "des Satelliten", plural: "die Satelliten" },
      { artikel: "der", wort: "Asteroid", genitiv: "des Asteroiden", plural: "die Asteroiden" },
      { artikel: "der", wort: "Meteorit", genitiv: "des Meteoriten", plural: "die Meteoriten" },
      { artikel: "der", wort: "Automat", genitiv: "des Automaten", plural: "die Automaten" },
      { artikel: "der", wort: "Magnet", genitiv: "des Magneten", plural: "die Magneten" },
      { artikel: "der", wort: "Diamant", genitiv: "des Diamanten", plural: "die Diamanten" },
      { artikel: "der", wort: "Elefant", genitiv: "des Elefanten", plural: "die Elefanten" },
    ],
  },
  {
    name: "Gemischte N-Deklination (Genitiv auf -ns)",
    words: [
      { artikel: "der", wort: "Name", genitiv: "des Namens", plural: "die Namen", typ: "gemischt" },
      { artikel: "der", wort: "Gedanke", genitiv: "des Gedankens", plural: "die Gedanken", typ: "gemischt" },
      { artikel: "der", wort: "Wille", genitiv: "des Willens", plural: "die Willen", typ: "gemischt" },
      { artikel: "der", wort: "Glaube", genitiv: "des Glaubens", plural: "die Glauben", typ: "gemischt" },
      { artikel: "der", wort: "Friede", genitiv: "des Friedens", plural: "die Frieden", typ: "gemischt" },
      { artikel: "der", wort: "Funke", genitiv: "des Funkens", plural: "die Funken", typ: "gemischt" },
      { artikel: "der", wort: "Buchstabe", genitiv: "des Buchstabens", plural: "die Buchstaben", typ: "gemischt" },
      { artikel: "der", wort: "Haufe", genitiv: "des Haufens", plural: "die Haufen", typ: "gemischt" },
      { artikel: "der", wort: "Same", genitiv: "des Samens", plural: "die Samen", typ: "gemischt" },
      { artikel: "der", wort: "Fels", genitiv: "des Felsens", plural: "die Felsen", typ: "gemischt" },
    ],
  },
  {
    name: "Neutrum-Ausnahme",
    words: [
      { artikel: "das", wort: "Herz", genitiv: "des Herzens", plural: "die Herzen", typ: "neutrum" },
    ],
  },
];

// ─── Quiz Data ─────────────────────────────────────────────────────────────────

const QUIZ: QuizQuestion[] = [
  {
    frage: "Der Arzt behandelt ___ (Patient, Akkusativ Singular).",
    optionen: ["den Patient", "den Patienten", "dem Patienten", "des Patienten"],
    richtig: 1,
    erklaerung:
      `„Patient" endet auf -ent → N-Deklination. Im Akkusativ Singular lautet die Endung -(e)n: den Patienten.`,
  },
  {
    frage: "Ich danke ___ (Student, Dativ Singular).",
    optionen: ["dem Student", "den Studenten", "dem Studenten", "des Studenten"],
    richtig: 2,
    erklaerung:
      "Im Dativ Singular erhält das Nomen der N-Deklination die Endung -en: dem Studenten.",
  },
  {
    frage: "Das ist das neue Buch ___ (Journalist, Genitiv Singular).",
    optionen: ["des Journalists", "des Journalisten", "dem Journalisten", "den Journalisten"],
    richtig: 1,
    erklaerung:
      "Im Genitiv Singular lautet die Endung -(e)n: des Journalisten. Kein -s wie bei der starken Deklination!",
  },
  {
    frage: "Alle ___ (Kollege, Nominativ Plural) kommen zur Besprechung.",
    optionen: ["Kolleges", "Kolleger", "Kollegens", "Kollegen"],
    richtig: 3,
    erklaerung:
      "Im Nominativ Plural haben alle N-Deklinationsnomen die Endung -en: die Kollegen.",
  },
  {
    frage: "Sehr geehrter ___ Schneider, … (Briefanrede)",
    optionen: ["Herr", "Herrn", "Herren", "Herrens"],
    richtig: 1,
    erklaerung:
      `In Briefanreden steht „Herrn" (implizierter Akkusativ). Sonderfall: Singular -n, Plural -en.`,
  },
  {
    frage: "Er hat kein ___ (Herz, Akkusativ Singular).",
    optionen: ["Herzen", "Herzens", "Herze", "Herz"],
    richtig: 3,
    erklaerung:
      "Das Herz ist das einzige Neutrum mit N-Deklination – hat aber im Akkusativ Singular KEINE Endung: kein Herz.",
  },
  {
    frage: "Die Kraft ___ (Wille, Genitiv Singular – gemischte N-Deklination).",
    optionen: ["des Willens", "des Willen", "des Willes", "dem Willen"],
    richtig: 0,
    erklaerung:
      `„Wille" gehört zur gemischten N-Deklination: Genitiv auf -ns → des Willens. Alle anderen Kasus: -n.`,
  },
  {
    frage: "Welches Nomen gehört zur N-Deklination?",
    optionen: ["der Tisch", "der Hund", "der Tourist", "der Garten"],
    richtig: 2,
    erklaerung:
      `„Tourist" endet auf -ist → Fremdwort-Suffix, typisches Merkmal der N-Deklination. Die anderen drei sind stark dekliniert.`,
  },
  {
    frage: "Er schreibt an ___ (Herr Müller, Akkusativ).",
    optionen: ["Herr Müller", "Herren Müller", "Herrn Müller", "Herrns Müller"],
    richtig: 2,
    erklaerung:
      `Nach Präpositionen mit Akkusativ steht „Herrn": Er schreibt an Herrn Müller.`,
  },
  {
    frage: "Welcher Satz enthält einen Fehler?",
    optionen: [
      "Der Student kommt heute.",
      "Ich kenne den Studenten.",
      "Das Buch des Students liegt hier.",
      "Er hilft dem Studenten gerne.",
    ],
    richtig: 2,
    erklaerung:
      `„des Students" ist falsch. Der Genitiv von „der Student" lautet „des Studenten" (N-Deklination, nicht stark).`,
  },
  {
    frage: "Die ___ (Soldat, Nominativ Plural) marschieren.",
    optionen: ["Soldats", "Soldate", "Soldater", "Soldaten"],
    richtig: 3,
    erklaerung: "N-Deklination Plural → -en: die Soldaten.",
  },
  {
    frage: "Der ___ (Löwe, Akkusativ Singular) jagt seine Beute.",
    optionen: ["Löwens", "Löwe", "Löwes", "Löwen"],
    richtig: 3,
    erklaerung:
      `„Löwe" endet auf -e → N-Deklination. Akkusativ Singular: den Löwen.`,
  },
  {
    frage: "Er ist bekannt unter diesem ___ (Name, Dativ Singular).",
    optionen: ["Namens", "Namen", "Name", "Nament"],
    richtig: 1,
    erklaerung:
      "Gemischte N-Deklination: Nur der Genitiv hat -ns (des Namens). Im Dativ: dem Namen.",
  },
  {
    frage: "Welches Wort folgt NICHT der N-Deklination, sondern der Adjektivdeklination?",
    optionen: ["der Tourist", "der Held", "der Beamte", "der Student"],
    richtig: 2,
    erklaerung:
      `„der Beamte" ist ein substantiviertes Adjektiv (← beamtet) und folgt der Adjektivdeklination: ein Beamter, des Beamten – nicht N-Deklination!`,
  },
  {
    frage: "Der Befehl ___ (Herr General, Genitiv) muss befolgt werden.",
    optionen: ["des Herrens General", "des Herrn Generals", "des Herr Generals", "des Herren Generals"],
    richtig: 1,
    erklaerung:
      `„der Herr" hat im Genitiv Singular die Endung -n: Herrn. Der Titel „General" bekommt ebenfalls den Genitiv-s: des Herrn Generals.`,
  },
];

// ─── UI Primitives ─────────────────────────────────────────────────────────────

type InfoTyp = "merke" | "tipp" | "achtung" | "richtig" | "falsch";

const INFO_STYLES: Record<InfoTyp, string> = {
  merke:   "bg-brand-50 border-brand-500 text-brand-900",
  tipp:    "bg-yellow-50 border-gold-500 text-yellow-900",
  achtung: "bg-orange-50 border-orange-500 text-orange-900",
  richtig: "bg-emerald-50 border-emerald-600 text-emerald-900",
  falsch:  "bg-red-50 border-red-500 text-red-900",
};

const INFO_LABELS: Record<InfoTyp, string> = {
  merke:   "Merke",
  tipp:    "Tipp",
  achtung: "Achtung",
  richtig: "Korrekt",
  falsch:  "Fehler",
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

type DeklRow = [string, string, string];

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
            {rows.map(([kasus, sg, pl], i) => (
              <tr key={kasus} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                <td className="px-3 py-2 font-semibold text-brand-600 text-xs whitespace-nowrap">{kasus}</td>
                <td className="px-3 py-2">{sg}</td>
                <td className="px-3 py-2">{pl}</td>
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
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-400 w-8">{kasus}</span>
      <span className="text-sm text-brand-800">{text}</span>
    </li>
  );
}

// ─── Chapter 1: Einführung ─────────────────────────────────────────────────────

function Chapter1() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-brand-950 mb-3">Was ist die N-Deklination?</h2>
        <p className="text-sm text-brand-800 leading-relaxed mb-4">
          Die <strong>N-Deklination</strong> (auch <em>schwache Deklination</em>) ist eine besondere
          Flexionsklasse für eine Gruppe maskuliner Substantive. Sie heißt „schwach", weil das
          Substantiv selbst nur eine einzige Endung trägt – der Artikel übernimmt die Hauptlast
          der Kasusmarkierung.
        </p>
        <InfoBox typ="merke">
          <p className="font-semibold mb-1">Grundregel der N-Deklination:</p>
          <ul className="space-y-1">
            <li>
              <span className="inline-block w-36 text-brand-400">Nominativ Singular</span>
              <strong>keine Endung</strong> → <em>der Mensch</em>
            </li>
            <li>
              <span className="inline-block w-36 text-brand-400">Alle anderen Formen</span>
              <strong>-(e)n</strong> → <em>den / dem / des Menschen</em>
            </li>
          </ul>
        </InfoBox>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">
          Vollständige Formentabelle: <em>der Mensch</em>
        </h3>
        <DeklTable
          rows={[
            ["Nominativ", "der Mensch", "die Menschen"],
            ["Akkusativ", "den Menschen", "die Menschen"],
            ["Dativ", "dem Menschen", "den Menschen"],
            ["Genitiv", "des Menschen", "der Menschen"],
          ]}
        />
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">
          Welche Formen haben die Endung -(e)n?
        </h3>
        <div className="overflow-x-auto rounded-lg border border-brand-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-950 text-white">
                <th className="px-3 py-2 text-left font-medium text-xs">Kasus</th>
                <th className="px-3 py-2 text-center font-medium text-xs">Singular</th>
                <th className="px-3 py-2 text-center font-medium text-xs">Plural</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Nominativ", "–", "✓"],
                ["Akkusativ", "✓", "✓"],
                ["Dativ", "✓", "✓"],
                ["Genitiv", "✓", "✓"],
              ].map(([k, sg, pl], i) => (
                <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                  <td className="px-3 py-2 font-semibold text-brand-600 text-xs">{k}</td>
                  <td className={`px-3 py-2 text-center font-bold ${sg === "✓" ? "text-brand-600" : "text-brand-300"}`}>{sg}</td>
                  <td className={`px-3 py-2 text-center font-bold ${pl === "✓" ? "text-brand-600" : "text-brand-300"}`}>{pl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-brand-400 mt-2">
          Nur Nominativ Singular hat keine Endung. Alle anderen 7 Formen enden auf -(e)n.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Historischer Hintergrund</h3>
        <p className="text-sm text-brand-800 leading-relaxed">
          Im Althochdeutschen (ca. 750–1050) gab es zwei große Deklinationsklassen: die{" "}
          <strong>starke</strong> (vokalische) und die <strong>schwache</strong> (n-haltige). Heute
          ist die schwache Deklination auf bestimmte Wortgruppen beschränkt, erkennbar an
          typischen Suffixen lateinischen, griechischen oder germanischen Ursprungs.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Häufige Fehler</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { falsch: "Ich sehe den Tourist.", richtig: "Ich sehe den Touristen." },
            { falsch: "Das Buch des Students.", richtig: "Das Buch des Studenten." },
            { falsch: "Ich helfe dem Held.", richtig: "Ich helfe dem Helden." },
            { falsch: "Der Präsident besuch …", richtig: "Der Präsident besucht … (Nom. → kein -en!)" },
          ].map(({ falsch, richtig }) => (
            <div key={falsch} className="space-y-1">
              <InfoBox typ="falsch"><span>{falsch}</span></InfoBox>
              <InfoBox typ="richtig"><span>{richtig}</span></InfoBox>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Beispielsätze durch alle Kasus</h3>
        <ul className="space-y-2">
          <Beispiel kasus="NOM" text={<>Der <strong>Mensch</strong> ist ein soziales Wesen.</>} />
          <Beispiel kasus="AKK" text={<>Ich sehe den <strong>Menschen</strong> auf der Straße.</>} />
          <Beispiel kasus="DAT" text={<>Sie hilft dem <strong>Menschen</strong> in Not.</>} />
          <Beispiel kasus="GEN" text={<>Das Leben des <strong>Menschen</strong> ist vergänglich.</>} />
          <Beispiel kasus="PLU" text={<>Die <strong>Menschen</strong> kommen aus vielen Ländern.</>} />
        </ul>
      </section>
    </div>
  );
}

// ─── Chapter 2: Erkennung ─────────────────────────────────────────────────────

function Chapter2() {
  const gruppen = [
    {
      title: "Gruppe 1 — Maskulina auf -e",
      beispiele: "der Junge, der Affe, der Löwe, der Kollege, der Franzose, der Zeuge",
      erklaerung: "Die häufigste Gruppe. Fast alle maskulinen Nomen auf -e gehören zur N-Deklination.",
    },
    {
      title: "Gruppe 2 — Fremdwörter auf -ist",
      beispiele: "der Tourist, der Polizist, der Journalist, der Optimist, der Pianist",
      erklaerung: "Lateinisches Suffix -ista (Agent, Berufsbezeichnung). Immer maskulin, immer N-Deklination.",
    },
    {
      title: "Gruppe 3 — Fremdwörter auf -ent / -ant",
      beispiele: "der Student, der Präsident, der Patient, der Lieferant, der Praktikant",
      erklaerung: "Lateinische Partizipien (ens, antis). Bezeichnen aktiv Handelnde – immer N-Deklination.",
    },
    {
      title: "Gruppe 4 — Fremdwörter auf -at / -it / -ot",
      beispiele: "der Kandidat, der Soldat, der Satellit, der Planet, der Komet",
      erklaerung: "Lateinische und griechische Entlehnungen auf diese Suffixe sind meistens N-Deklination.",
    },
    {
      title: "Gruppe 5 — Fremdwörter auf -oge / -oph / -olog",
      beispiele: "der Psychologe, der Biologe, der Pädagoge, der Philosoph",
      erklaerung: "Griechische Fachbegriffe auf -logos oder -sophos. Immer maskulin, immer N-Deklination.",
    },
    {
      title: "Gruppe 6 — Einsilbige Maskulina",
      beispiele: "der Mensch, der Held, der Bär, der Graf, der Prinz, der Fürst",
      erklaerung: "Eine gemischte Gruppe einsilbiger maskuliner Nomen. Muss einzeln gelernt werden.",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-brand-950 mb-3">Wie erkenne ich die N-Deklination?</h2>
        <p className="text-sm text-brand-800 leading-relaxed">
          Es gibt <strong>6 Hauptgruppen</strong>. Lernt man die Gruppen, kann man die meisten
          N-Deklinationsnomen sicher identifizieren – ohne jedes Wort einzeln auswendig zu lernen.
        </p>
      </section>

      <section className="space-y-4">
        {gruppen.map((g) => (
          <div key={g.title} className="bg-white rounded-xl border border-brand-100 p-4">
            <h3 className="font-semibold text-brand-800 mb-1">{g.title}</h3>
            <p className="text-xs text-brand-400 mb-2">{g.erklaerung}</p>
            <p className="text-sm font-mono text-brand-700 bg-brand-50 rounded px-3 py-2">
              {g.beispiele}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-4">Schnelltest-Schema</h3>
        <InfoBox typ="tipp">
          <p className="font-semibold mb-2">4 Fragen zur Selbstprüfung:</p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Ist das Nomen maskulin (der)? → Sonst keine N-Deklination (außer das Herz)</li>
            <li>Endet es auf -e, -ist, -ent, -ant, -at, -it, -ot, -oge, -oph? → Sehr wahrscheinlich N-Deklination</li>
            <li>Ist es einsilbig und maskulin (Held, Graf, Prinz…)? → Muss einzeln gelernt werden</li>
            <li>Lautet der Akkusativ auf -(e)n? → Bestätigt N-Deklination</li>
          </ol>
        </InfoBox>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Beispielsätze – eine Nomen aus jeder Gruppe</h3>
        <ul className="space-y-2">
          <Beispiel kasus="Gr.1" text={<>Der <strong>Kollege</strong> kennt den <strong>Kollegen</strong> aus München.</>} />
          <Beispiel kasus="Gr.2" text={<>Der <strong>Tourist</strong> fragt den <strong>Polizisten</strong> nach dem Weg.</>} />
          <Beispiel kasus="Gr.3" text={<>Der <strong>Student</strong> gibt dem <strong>Assistenten</strong> seine Hausarbeit.</>} />
          <Beispiel kasus="Gr.4" text={<>Der <strong>Satellit</strong> umkreist den <strong>Planeten</strong> zweimal täglich.</>} />
          <Beispiel kasus="Gr.5" text={<>Der <strong>Psychologe</strong> arbeitet mit dem <strong>Pädagogen</strong> zusammen.</>} />
          <Beispiel kasus="Gr.6" text={<>Der <strong>Held</strong> rettet den <strong>Prinzen</strong> vor dem <strong>Tyrannen</strong>.</>} />
        </ul>
      </section>
    </div>
  );
}

// ─── Chapter 3: Suffixe im Detail ─────────────────────────────────────────────

function Chapter3() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-brand-950 mb-3">Suffixe der N-Deklination</h2>
        <div className="overflow-x-auto rounded-lg border border-brand-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-950 text-white">
                <th className="px-3 py-2 text-left font-medium text-xs">Suffix</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Häufigkeit</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Herkunft</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Beispiele</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["-e", "sehr häufig", "germanisch", "Junge, Löwe, Kollege, Zeuge"],
                ["-ist", "häufig", "lat. -ista", "Tourist, Polizist, Pianist"],
                ["-ent", "häufig", "lat. Partizip", "Student, Präsident, Patient"],
                ["-ant", "häufig", "lat. Partizip", "Praktikant, Lieferant, Demonstrant"],
                ["-at", "mittel", "lat. -atus", "Soldat, Kandidat, Diplomat"],
                ["-oge", "mittel", "gr. -logos", "Psychologe, Biologe, Pädagoge"],
                ["-oph", "selten", "gr. -sophos", "Philosoph, Paragraph (hist.)"],
                ["-it", "selten", "lat./gr. -ita", "Satellit, Eremit, Meteorit"],
                ["-ot / -et", "selten", "gr.", "Planet, Komet, Prophet"],
                ["einsilbig", "variabel", "germanisch", "Mensch, Held, Bär, Graf"],
              ].map(([suffix, haeufigkeit, herkunft, beispiele], i) => (
                <tr key={suffix} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                  <td className="px-3 py-2 font-mono font-bold text-brand-600">{suffix}</td>
                  <td className="px-3 py-2 text-xs">{haeufigkeit}</td>
                  <td className="px-3 py-2 text-xs text-brand-500">{herkunft}</td>
                  <td className="px-3 py-2 text-xs">{beispiele}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Etymologie: -ent und -ant</h3>
        <InfoBox typ="merke">
          <p>
            Die Suffixe <strong>-ent</strong> und <strong>-ant</strong> gehen auf lateinische
            Partizipien zurück:{" "}
            <em>stud-ens, stud-entis</em> (der Studierende) und{" "}
            <em>demonstr-ans, demonstr-antis</em> (der Demonstrierende).
            Der Genitiv auf <em>-entis</em> / <em>-antis</em> ist der historische Ursprung der
            deutschen Endung -(e)n.
          </p>
        </InfoBox>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">
          Nationalitäten: N-Deklination vs. stark
        </h3>
        <div className="overflow-x-auto rounded-lg border border-brand-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-950 text-white">
                <th className="px-3 py-2 text-left text-xs font-medium">N-Deklination (auf -e)</th>
                <th className="px-3 py-2 text-left text-xs font-medium">Stark (auf -er, -aner…)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["der Franzose, des Franzosen", "der Engländer, des Engländers"],
                ["der Chinese, des Chinesen", "der Japaner, des Japaners"],
                ["der Grieche, des Griechen", "der Österreicher, des Österreichers"],
                ["der Schwede, des Schweden", "der Norweger, des Norwegers"],
                ["der Pole, des Polen", "der Litauer, des Litauers"],
              ].map(([ndekl, stark], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                  <td className="px-3 py-2 text-brand-700">{ndekl}</td>
                  <td className="px-3 py-2 text-brand-500">{stark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-brand-400 mt-2">
          Nationalitäten auf <strong>-e</strong> → N-Deklination. Nationalitäten auf{" "}
          <strong>-er / -aner / -ier</strong> → starke Deklination.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">
          Achtung: Lateinische -us / -or Wörter
        </h3>
        <InfoBox typ="achtung">
          <p>
            Viele Fremdwörter auf <strong>-us</strong> oder <strong>-or</strong> klingen nach
            N-Deklination, sind aber <strong>stark dekliniert</strong>:
          </p>
          <ul className="mt-2 space-y-1">
            <li>der <strong>Doktor</strong> → des <strong>Doktors</strong> (nicht: Doktoren im Sing.!)</li>
            <li>der <strong>Professor</strong> → des <strong>Professors</strong></li>
            <li>der <strong>Direktor</strong> → des <strong>Direktors</strong></li>
            <li>der <strong>Katalog</strong> → des <strong>Katalogs</strong> (unbelebt!)</li>
          </ul>
          <p className="mt-2 text-xs opacity-70">
            Faustregel: Wenn das Wort auf -or im Plural -en hat (Doktoren, Professoren), ist es im
            Singular trotzdem stark.
          </p>
        </InfoBox>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Beispielsätze</h3>
        <ul className="space-y-2">
          <Beispiel kasus="NOM" text={<>Der <strong>Biologe</strong> untersucht die Zelle.</>} />
          <Beispiel kasus="AKK" text={<>Sie befragt den <strong>Psychologen</strong> nach seiner Meinung.</>} />
          <Beispiel kasus="DAT" text={<>Das Labor gehört dem <strong>Geologen</strong> der Universität.</>} />
          <Beispiel kasus="GEN" text={<>Das Buch des <strong>Philosophen</strong> ist vergriffen.</>} />
          <Beispiel kasus="NOM" text={<>Der <strong>Schwede</strong> spricht besser Deutsch als der <strong>Engländer</strong>.</>} />
        </ul>
      </section>
    </div>
  );
}

// ─── Chapter 4: Deklinationstabellen ──────────────────────────────────────────

function Chapter4() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-brand-950 mb-4">Alle 4 Deklinationstypen</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <DeklTable
            title="Typ A — Nomen auf -e: der Junge"
            rows={[
              ["Nominativ", "der Junge", "die Jungen"],
              ["Akkusativ", "den Jungen", "die Jungen"],
              ["Dativ", "dem Jungen", "den Jungen"],
              ["Genitiv", "des Jungen", "der Jungen"],
            ]}
          />
          <DeklTable
            title="Typ B — Nomen auf -ist: der Tourist"
            rows={[
              ["Nominativ", "der Tourist", "die Touristen"],
              ["Akkusativ", "den Touristen", "die Touristen"],
              ["Dativ", "dem Touristen", "den Touristen"],
              ["Genitiv", "des Touristen", "der Touristen"],
            ]}
          />
          <DeklTable
            title="Typ C — Nomen auf -ent: der Student"
            rows={[
              ["Nominativ", "der Student", "die Studenten"],
              ["Akkusativ", "den Studenten", "die Studenten"],
              ["Dativ", "dem Studenten", "den Studenten"],
              ["Genitiv", "des Studenten", "der Studenten"],
            ]}
          />
          <DeklTable
            title="Typ D — Einsilbig: der Mensch"
            rows={[
              ["Nominativ", "der Mensch", "die Menschen"],
              ["Akkusativ", "den Menschen", "die Menschen"],
              ["Dativ", "dem Menschen", "den Menschen"],
              ["Genitiv", "des Menschen", "der Menschen"],
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-4">
          Vollständig dekliniert: <em>der Präsident</em>
        </h3>
        <DeklTable
          rows={[
            ["Nominativ", "der Präsident", "die Präsidenten"],
            ["Akkusativ", "den Präsidenten", "die Präsidenten"],
            ["Dativ", "dem Präsidenten", "den Präsidenten"],
            ["Genitiv", "des Präsidenten", "der Präsidenten"],
          ]}
        />
        <ul className="space-y-2 mt-3">
          <Beispiel kasus="NOM" text={<>Der <strong>Präsident</strong> hält eine Rede.</>} />
          <Beispiel kasus="AKK" text={<>Das Volk wählt den <strong>Präsidenten</strong>.</>} />
          <Beispiel kasus="DAT" text={<>Man gratuliert dem neuen <strong>Präsidenten</strong>.</>} />
          <Beispiel kasus="GEN" text={<>Die Rede des <strong>Präsidenten</strong> dauerte eine Stunde.</>} />
          <Beispiel kasus="PLU" text={<>Die <strong>Präsidenten</strong> trafen sich in Genf.</>} />
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-4">
          Vollständig dekliniert: <em>der Kollege</em>
        </h3>
        <DeklTable
          rows={[
            ["Nominativ", "der Kollege", "die Kollegen"],
            ["Akkusativ", "den Kollegen", "die Kollegen"],
            ["Dativ", "dem Kollegen", "den Kollegen"],
            ["Genitiv", "des Kollegen", "der Kollegen"],
          ]}
        />
        <ul className="space-y-2 mt-3">
          <Beispiel kasus="NOM" text={<>Mein <strong>Kollege</strong> kommt aus Hamburg.</>} />
          <Beispiel kasus="AKK" text={<>Ich rufe den <strong>Kollegen</strong> morgen an.</>} />
          <Beispiel kasus="DAT" text={<>Ich erkläre es dem <strong>Kollegen</strong> noch einmal.</>} />
          <Beispiel kasus="GEN" text={<>Das ist das Büro meines <strong>Kollegen</strong>.</>} />
          <Beispiel kasus="PLU" text={<>Alle <strong>Kollegen</strong> sind zur Feier eingeladen.</>} />
        </ul>
      </section>
    </div>
  );
}

// ─── Chapter 5: Gemischte N-Deklination ───────────────────────────────────────

function Chapter5() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-brand-950 mb-3">Gemischte N-Deklination</h2>
        <p className="text-sm text-brand-800 leading-relaxed mb-4">
          Eine kleine, aber wichtige Untergruppe bildet die <strong>gemischte N-Deklination</strong>.
          Diese Nomen verhalten sich wie normale N-Deklinationsnomen – mit einer Ausnahme:
          Im <strong>Genitiv Singular</strong> endet das Wort auf <strong>-ns</strong> statt auf -en.
        </p>
        <InfoBox typ="merke">
          <p>
            <strong>Schema:</strong> Nominativ Singular ohne Endung → Akkusativ / Dativ Singular auf{" "}
            <strong>-n</strong> → Genitiv Singular auf <strong>-ns</strong> → Plural auf <strong>-n</strong>
          </p>
          <p className="mt-1">
            Beispiel <em>der Name</em>: der Name / den Namen / dem Namen /{" "}
            <strong>des Namens</strong> / die Namen
          </p>
        </InfoBox>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Vollständige Liste</h3>
        <div className="overflow-x-auto rounded-lg border border-orange-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-950 text-white">
                <th className="px-3 py-2 text-left text-xs font-medium">Nominativ</th>
                <th className="px-3 py-2 text-left text-xs font-medium">Akkusativ</th>
                <th className="px-3 py-2 text-left text-xs font-medium">Dativ</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-orange-300">Genitiv (-ns!)</th>
                <th className="px-3 py-2 text-left text-xs font-medium">Plural</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["der Name", "den Namen", "dem Namen", "des Namens", "die Namen"],
                ["der Gedanke", "den Gedanken", "dem Gedanken", "des Gedankens", "die Gedanken"],
                ["der Wille", "den Willen", "dem Willen", "des Willens", "die Willen"],
                ["der Glaube", "den Glauben", "dem Glauben", "des Glaubens", "die Glauben"],
                ["der Friede", "den Frieden", "dem Frieden", "des Friedens", "die Frieden"],
                ["der Funke", "den Funken", "dem Funken", "des Funkens", "die Funken"],
                ["der Buchstabe", "den Buchstaben", "dem Buchstaben", "des Buchstabens", "die Buchstaben"],
                ["der Haufe", "den Haufen", "dem Haufen", "des Haufens", "die Haufen"],
                ["der Same", "den Samen", "dem Samen", "des Samens", "die Samen"],
                ["der Fels", "den Felsen", "dem Felsen", "des Felsens", "die Felsen"],
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-orange-50"}>
                  <td className="px-3 py-2 font-semibold text-brand-700">{row[0]}</td>
                  <td className="px-3 py-2">{row[1]}</td>
                  <td className="px-3 py-2">{row[2]}</td>
                  <td className="px-3 py-2 font-bold text-orange-700">{row[3]}</td>
                  <td className="px-3 py-2">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Eselsbrücke</h3>
        <InfoBox typ="tipp">
          <p className="font-semibold mb-1">NGW-FGF-BS-HF</p>
          <p>
            <strong>N</strong>ame · <strong>G</strong>edanke · <strong>W</strong>ille ·{" "}
            <strong>F</strong>riede · <strong>G</strong>laube · <strong>F</strong>unke ·{" "}
            <strong>B</strong>uchstabe · <strong>S</strong>ame · <strong>H</strong>aufe ·{" "}
            <strong>F</strong>els
          </p>
        </InfoBox>
      </section>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Beispielsätze</h3>
        <ul className="space-y-2">
          <Beispiel kasus="NOM" text={<>Der <strong>Name</strong> des Kindes ist ungewöhnlich.</>} />
          <Beispiel kasus="AKK" text={<>Sie schreibt den <strong>Buchstaben</strong> sorgfältig.</>} />
          <Beispiel kasus="DAT" text={<>Er handelt nach seinem <strong>Glauben</strong>.</>} />
          <Beispiel kasus="GEN" text={<>Die Kraft des <strong>Willens</strong> ist enorm.</>} />
          <Beispiel kasus="GEN" text={<>Der Vertrag des <strong>Friedens</strong> wurde unterzeichnet.</>} />
          <Beispiel kasus="PLU" text={<>Die <strong>Gedanken</strong> sind frei.</>} />
        </ul>
      </section>
    </div>
  );
}

// ─── Chapter 6: Sonderfälle ───────────────────────────────────────────────────

function Chapter6() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-brand-950 mb-4">Sonderfälle der N-Deklination</h2>
      </section>

      <section>
        <h3 className="text-base font-semibold text-red-700 mb-3">1. der Herr — Sonderfall</h3>
        <InfoBox typ="achtung">
          <p>
            <em>Der Herr</em> hat im <strong>Singular die Endung -n</strong> (nicht -en!),
            im Plural dagegen <strong>-en</strong>.
          </p>
        </InfoBox>
        <DeklTable
          rows={[
            ["Nominativ", "der Herr", "die Herren"],
            ["Akkusativ", "den Herrn", "die Herren"],
            ["Dativ", "dem Herrn", "den Herren"],
            ["Genitiv", "des Herrn", "der Herren"],
          ]}
        />
        <p className="text-sm text-brand-700 font-semibold mb-1">Briefumschlag-Regel:</p>
        <ul className="space-y-1 text-sm text-brand-800">
          <li>→ <em>Sehr geehrter <strong>Herr</strong> Müller</em> (Nominativ nach „geehrter")</li>
          <li>→ <em>An <strong>Herrn</strong> Klaus Müller</em> (Akkusativ nach „An")</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-red-700 mb-3">2. das Herz — einziges Neutrum</h3>
        <InfoBox typ="achtung">
          <p>
            <em>Das Herz</em> ist das <strong>einzige neutrale Substantiv</strong> mit N-Deklination.
            Im <strong>Akkusativ Singular</strong> hat es wie alle Neutra <strong>keine Endung</strong>.
          </p>
        </InfoBox>
        <DeklTable
          rows={[
            ["Nominativ", "das Herz ✓", "die Herzen"],
            ["Akkusativ", "das Herz ✓ (kein -en!)", "die Herzen"],
            ["Dativ", "dem Herzen", "den Herzen"],
            ["Genitiv", "des Herzens", "der Herzen"],
          ]}
        />
        <ul className="space-y-2 mt-2">
          <Beispiel kasus="AKK" text={<>Er hat kein <strong>Herz</strong>. (nicht: *Herzen)</>} />
          <Beispiel kasus="DAT" text={<>Das kam von <strong>Herzen</strong>.</>} />
          <Beispiel kasus="GEN" text={<>Ein Wunsch des <strong>Herzens</strong>.</>} />
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-red-700 mb-3">3. Doppelformen</h3>
        <p className="text-sm text-brand-800 mb-3">
          Einige Nomen haben sowohl eine schwache als auch eine starke Form.
          Beide sind im Duden als korrekt verzeichnet.
        </p>
        <div className="overflow-x-auto rounded-lg border border-brand-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-950 text-white">
                <th className="px-3 py-2 text-left text-xs">Nomen</th>
                <th className="px-3 py-2 text-left text-xs">Schwach (N-Deklination)</th>
                <th className="px-3 py-2 text-left text-xs">Stark</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["der Bauer", "des Bauern", "des Bauers"],
                ["der Nachbar", "des Nachbarn", "des Nachbars"],
                ["der Typ", "des Typen", "des Typs"],
              ].map(([n, sw, st], i) => (
                <tr key={n} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                  <td className="px-3 py-2 font-semibold text-brand-700">{n}</td>
                  <td className="px-3 py-2 text-emerald-700">{sw} ✓</td>
                  <td className="px-3 py-2 text-brand-500">{st} ✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-red-700 mb-3">4. Nominativ mit oder ohne -n</h3>
        <p className="text-sm text-brand-800 mb-2">
          Folgende Wörter existieren im Nominativ Singular in zwei Varianten:
        </p>
        <ul className="text-sm text-brand-800 space-y-1">
          {[
            ["der Fels / der Felsen", "des Felsens"],
            ["der Friede / der Frieden", "des Friedens"],
            ["der Funke / der Funken", "des Funkens"],
            ["der Haufe / der Haufen", "des Haufens"],
            ["der Same / der Samen", "des Samens"],
          ].map(([nom, gen]) => (
            <li key={nom} className="flex gap-3">
              <span className="font-semibold text-brand-700 min-w-[200px]">{nom}</span>
              <span className="text-brand-500">{gen}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-red-700 mb-3">5. Titel + Eigenname</h3>
        <InfoBox typ="merke">
          <p>
            Bei <em>Herr</em> als Titel vor einem Eigennamen wird <em>Herrn</em> dekliniert,
            der Eigenname bleibt undekliniert:
          </p>
          <ul className="mt-1 space-y-1">
            <li>Nominativ: <em>Herr Müller</em></li>
            <li>Akkusativ: <em>Herrn Müller</em></li>
            <li>Dativ: <em>Herrn Müller</em></li>
            <li>Genitiv: <em>Herrn Müllers</em> (oder: <em>Herrn Müller</em>)</li>
          </ul>
        </InfoBox>
      </section>

      <section>
        <h3 className="text-base font-semibold text-red-700 mb-3">6. Substantivierte Adjektive ≠ N-Deklination</h3>
        <InfoBox typ="achtung">
          <p>
            Wörter wie <em>der Beamte</em>, <em>der Verwandte</em>, <em>der Bekannte</em>
            sind <strong>substantivierte Adjektive</strong> und folgen der{" "}
            <strong>Adjektivdeklination</strong> – nicht der N-Deklination!
          </p>
          <ul className="mt-2 space-y-1">
            <li>ein <strong>Beamter</strong> · der <strong>Beamte</strong> · des <strong>Beamten</strong></li>
            <li>ein <strong>Verwandter</strong> · der <strong>Verwandte</strong> · des <strong>Verwandten</strong></li>
          </ul>
          <p className="mt-1 text-xs opacity-70">
            Erkennbar daran: mit unbestimmtem Artikel enden diese Wörter auf -er (ein Beamter),
            bei echter N-Deklination nicht (ein Held, ein Tourist).
          </p>
        </InfoBox>
      </section>
    </div>
  );
}

// ─── Chapter 7: Tipps & Tricks ────────────────────────────────────────────────

function Chapter7() {
  const tipps = [
    {
      nr: "1",
      titel: "Der »den/dem/des«-Test",
      text: `Setzt man das Nomen in den Akkusativ, Dativ oder Genitiv und es endet auf -(e)n → N-Deklination bestätigt. Test: „Ich sehe den ___." → „Touristen" → N-Deklination. „Tisch" → N-Deklination? Nein: „den Tisch".`,
    },
    {
      nr: "2",
      titel: "Gruppen lernen, nicht Einzelwörter",
      text: "Wer weiß, dass alle maskulinen Fremdwörter auf -ist, -ent, -ant, -at, -oge zur N-Deklination gehören, kann hunderte Wörter automatisch korrekt deklinieren.",
    },
    {
      nr: "3",
      titel: "Eselsbrücken für Sonderfälle",
      text: "das Herz (einziges Neutrum) · der Herr/Herrn (Singular -n, Plural -en) · Gemischte Gruppe (NGW-FGF-BF-HS): Name, Gedanke, Wille – Friede, Glaube, Funke – Buchstabe, Fels – Haufe, Same.",
    },
    {
      nr: "4",
      titel: "Präpositionen als Kasushilfe",
      text: "",
      table: [
        ["Akkusativ", "durch, für, gegen, ohne, um, bis, entlang"],
        ["Dativ", "aus, bei, mit, nach, seit, von, zu, gegenüber"],
        ["Genitiv", "wegen, trotz, während, aufgrund, innerhalb"],
        ["Akk./Dat.", "an, auf, hinter, in, neben, über, unter, vor, zwischen"],
      ],
    },
    {
      nr: "5",
      titel: "N-Deklination in Komposita",
      text: "In Komposita taucht das Fugen-n auf, das oft auf die N-Deklination hinweist: Löwen-anteil, Herzens-wunsch, Bären-dienst, Hasen-fuß, Affenhaus.",
    },
    {
      nr: "6",
      titel: "Artikel als erste Kontrolle",
      text: `Fast alle N-Deklinationsnomen sind maskulin (Artikel: der). Das einzige neutrale Wort ist das Herz. Steht das Nomen nicht mit „der" → wahrscheinlich keine N-Deklination.`,
    },
    {
      nr: "7",
      titel: "Artikelwörter und Pronomen",
      text: "Nach Possessivpronomen und Artikelwörtern bleibt die N-Deklination erhalten: mein Kollege (Nom.) – meinen Kollegen (Akk.) – meinem Kollegen (Dat.) – meines Kollegen (Gen.).",
    },
  ];

  const top10 = [
    "der Mensch",
    "der Kollege",
    "der Student",
    "der Herr",
    "der Patient",
    "der Präsident",
    "der Tourist",
    "der Held",
    "der Soldat",
    "der Junge",
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-brand-950">7 Tipps & Tricks</h2>

      <div className="space-y-4">
        {tipps.map((t) => (
          <div key={t.nr} className="bg-yellow-50 border-l-4 border-gold-500 rounded-r-lg px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold-600 mb-1">
              Tipp {t.nr}
            </p>
            <p className="font-semibold text-brand-900 mb-1">{t.titel}</p>
            {t.text && <p className="text-sm text-brand-800 leading-relaxed">{t.text}</p>}
            {t.table && (
              <div className="mt-2 overflow-x-auto">
                <table className="text-xs border-collapse">
                  <tbody>
                    {t.table.map(([kasus, praep]) => (
                      <tr key={kasus}>
                        <td className="pr-3 py-1 font-semibold text-brand-600 whitespace-nowrap">{kasus}</td>
                        <td className="py-1 text-brand-700">{praep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <section>
        <h3 className="text-base font-semibold text-brand-900 mb-3">
          Top 10 der häufigsten N-Deklinationsnomen im Alltag
        </h3>
        <ol className="grid grid-cols-2 gap-2">
          {top10.map((w, i) => (
            <li key={w} className="flex items-center gap-2 bg-white rounded-lg border border-brand-100 px-3 py-2">
              <span className="text-xs font-bold text-brand-300 w-4">{i + 1}</span>
              <span className="text-sm font-medium text-brand-800">{w}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

// ─── Chapter 8: Wortliste ─────────────────────────────────────────────────────

function Chapter8() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      words: cat.words.filter(
        (w) =>
          w.wort.toLowerCase().includes(q) ||
          w.genitiv.toLowerCase().includes(q) ||
          w.plural.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.words.length > 0);
  }, [query]);

  const totalHits = filtered.reduce((acc, cat) => acc + cat.words.length, 0);
  const totalAll = CATEGORIES.reduce((acc, cat) => acc + cat.words.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-brand-950">Vollständige Wortliste</h2>
        <p className="text-xs text-brand-400">
          {query ? `${totalHits} von ${totalAll}` : totalAll} Nomen
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
        <input
          type="text"
          placeholder="Suchen … (z. B. Tourist, Löwe, Planet)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white border border-brand-200 inline-block" />
          Standard
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-50 border-l-2 border-orange-400 inline-block" />
          Gemischte N-Deklination
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-50 border-l-2 border-red-400 inline-block" />
          Sonderfall
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-brand-50 border-l-2 border-brand-500 inline-block" />
          Neutrum
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-brand-300 py-12 text-sm">Keine Treffer für „{query}"</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((cat) => (
            <div key={cat.name}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">
                {cat.name} ({cat.words.length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cat.words.map((w) => {
                  const cardStyle =
                    w.typ === "gemischt"
                      ? "border-l-4 border-l-orange-400 bg-orange-50"
                      : w.typ === "sonderfall"
                      ? "border-l-4 border-l-red-400 bg-red-50"
                      : w.typ === "neutrum"
                      ? "border-l-4 border-l-brand-500 bg-brand-50"
                      : "bg-white border border-brand-100";
                  return (
                    <div key={w.wort} className={`rounded-xl px-3 py-2.5 ${cardStyle}`}>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-brand-400">{w.artikel}</span>
                        <span className="font-bold text-brand-950">{w.wort}</span>
                      </div>
                      <p className="text-xs text-brand-500">Gen.: {w.genitiv}</p>
                      <p className="text-xs text-brand-500">Pl.: {w.plural}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chapter 9: Übungen ───────────────────────────────────────────────────────

function Chapter9() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (qIdx: number, aIdx: number) => {
    if (submitted || answers[qIdx] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: aIdx }));
  };

  const score = QUIZ.reduce(
    (acc, q, i) => acc + (answers[i] === q.richtig ? 1 : 0),
    0
  );

  const allAnswered = Object.keys(answers).length === QUIZ.length;

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const getBewertung = (s: number, total: number) => {
    const pct = s / total;
    if (pct === 1) return "Ausgezeichnet! 🎉 Perfektes Ergebnis.";
    if (pct >= 0.8) return "Sehr gut! Fast fehlerlos.";
    if (pct >= 0.6) return "Gut! Noch ein paar Lücken zu schließen.";
    if (pct >= 0.4) return "Befriedigend. Bitte die Kapitel 1–4 wiederholen.";
    return "Noch Übungsbedarf. Lies die Einführung noch einmal durch.";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-950">15 Übungsaufgaben</h2>
        {(submitted || allAnswered) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Neu starten
          </button>
        )}
      </div>

      {(submitted || allAnswered) && (
        <div className="bg-brand-50 rounded-xl border border-brand-200 px-5 py-4">
          <p className="text-lg font-bold text-brand-950 mb-1">
            Ergebnis: {score} / {QUIZ.length} Punkte
          </p>
          <p className="text-sm text-brand-700">{getBewertung(score, QUIZ.length)}</p>
        </div>
      )}

      <div className="space-y-5">
        {QUIZ.map((q, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== undefined;

          return (
            <div
              key={qi}
              className="bg-white rounded-xl border border-brand-100 p-4"
            >
              <p className="text-sm font-semibold text-brand-900 mb-3">
                <span className="text-brand-400 mr-1.5 font-bold">{qi + 1}.</span>
                {q.frage}
              </p>
              <div className="space-y-2">
                {q.optionen.map((opt, ai) => {
                  let style = "border border-brand-100 text-brand-700 hover:border-brand-300";
                  if (answered) {
                    if (ai === q.richtig) {
                      style = "border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                    } else if (ai === chosen) {
                      style = "border-2 border-red-400 bg-red-50 text-red-700";
                    } else {
                      style = "border border-brand-100 text-brand-400 opacity-60";
                    }
                  }
                  return (
                    <button
                      key={ai}
                      onClick={() => handleAnswer(qi, ai)}
                      disabled={answered}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all ${style} ${!answered ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <span className="mr-2 text-xs font-bold opacity-50">
                        {["A", "B", "C", "D"][ai]}.
                      </span>
                      {opt}
                      {answered && ai === q.richtig && (
                        <CheckCircle className="inline-block w-4 h-4 ml-2 text-emerald-500" />
                      )}
                      {answered && ai === chosen && ai !== q.richtig && (
                        <XCircle className="inline-block w-4 h-4 ml-2 text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className="mt-3 text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2 leading-relaxed">
                  <strong>Erklärung:</strong> {q.erklaerung}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const TABS = [
  "1. Einführung",
  "2. Erkennung",
  "3. Suffixe",
  "4. Tabellen",
  "5. Gemischt",
  "6. Sonderfälle",
  "7. Tipps",
  "8. Wortliste",
  "9. Übungen",
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
];

export function NDeklinationClient() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveChapter = CHAPTERS[activeTab];

  return (
    <div className="flex-1">
      {/* Page header */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-2">
        <h1 className="text-3xl font-bold text-brand-950 mb-1">N-Deklination</h1>
        <p className="text-sm text-brand-400 mb-1">Schwache Deklination im Deutschen</p>
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

      {/* Chapter content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ActiveChapter />
      </div>
    </div>
  );
}
