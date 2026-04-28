import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeImage, enrichContent } from "@/lib/gemini";
import { blurFacesServerSide } from "@/lib/faceBlurServer";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Normalise a German word for duplicate comparison: lowercase, trim, collapse whitespace. */
function normaliseWord(w: string) {
  return w.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Normalise a grammar title the same way. */
function normaliseTitle(t: string) {
  return t.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  const auth = req.headers.get("x-admin-secret");
  if (auth !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  // Fetch unprocessed images
  const { data: images, error: imgError } = await supabase
    .from("images")
    .select("*")
    .eq("course_id", courseId)
    .eq("processed", false)
    .order("captured_at", { ascending: true });

  if (imgError) {
    return NextResponse.json({ error: imgError.message }, { status: 500 });
  }
  if (!images || images.length === 0) {
    return NextResponse.json({ message: "No unprocessed images found" });
  }

  // Load existing content once upfront for deduplication
  const [{ data: existingCards }, { data: existingNotes }, { data: maxVocab }, { data: maxGrammar }] =
    await Promise.all([
      supabase.from("flashcards").select("word_de").eq("course_id", courseId),
      supabase.from("grammar_notes").select("title").eq("course_id", courseId),
      supabase.from("flashcards").select("display_order").eq("course_id", courseId).order("display_order", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("grammar_notes").select("display_order").eq("course_id", courseId).order("display_order", { ascending: false }).limit(1).maybeSingle(),
    ]);

  // Live sets — updated as we insert so within-batch duplicates are also caught
  const existingWords = new Set((existingCards ?? []).map((c) => normaliseWord(c.word_de)));
  const existingTitles = new Set((existingNotes ?? []).map((n) => normaliseTitle(n.title)));

  let vocabOrder = maxVocab ? maxVocab.display_order + 1 : 0;
  let grammarOrder = maxGrammar ? maxGrammar.display_order + 1 : 0;

  const results: {
    imageId: string;
    type: string;
    inserted: number;
    skipped: number;
    error?: string;
  }[] = [];

  for (const image of images) {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("course-images")
      .download(image.storage_path);

    if (downloadError || !fileData) {
      continue;
    }

    const rawBuffer = Buffer.from(await fileData.arrayBuffer());
    const base64 = rawBuffer.toString("base64");
    const mimeType = fileData.type || "image/jpeg";

    // Blur faces on the stored image now that AI has the original
    const blurredBuffer = await blurFacesServerSide(base64, mimeType);
    if (blurredBuffer !== rawBuffer) {
      await supabase.storage
        .from("course-images")
        .upload(image.storage_path, blurredBuffer, { upsert: true, contentType: mimeType });
    }

    let geminiResult;
    try {
      const extracted = await analyzeImage(base64, mimeType);
      geminiResult = await enrichContent(extracted);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[process] AI failed for image", image.id, ":", message);
      results.push({ imageId: image.id, type: "error", inserted: 0, skipped: 0, error: message });
      await supabase.from("images").update({ processed: true }).eq("id", image.id);
      continue;
    }

    const vocabItems =
      geminiResult.type === "vocab" ? geminiResult.items :
      geminiResult.type === "mixed" ? geminiResult.items : null;

    const grammarData =
      geminiResult.type === "grammar" ? geminiResult :
      geminiResult.type === "mixed" ? geminiResult.grammar : null;

    let inserted = 0;
    let skipped = 0;

    // --- Vocabulary deduplication ---
    if (vocabItems && vocabItems.length > 0) {
      const newRows = [];
      for (const item of vocabItems) {
        const key = normaliseWord(item.word_de);
        if (existingWords.has(key)) {
          console.log(`[process] skipping duplicate word: "${item.word_de}"`);
          skipped++;
        } else {
          existingWords.add(key); // prevent within-batch duplicates
          newRows.push({
            course_id: courseId,
            image_id: image.id,
            word_de: item.word_de,
            translation_en: item.translation_en,
            translation_uk: item.translation_uk,
            example_de: item.example_de ?? null,
            display_order: vocabOrder + newRows.length,
          });
        }
      }
      if (newRows.length > 0) {
        await supabase.from("flashcards").insert(newRows);
        vocabOrder += newRows.length;
        inserted += newRows.length;
      }
    }

    // --- Grammar deduplication ---
    if (grammarData) {
      const key = normaliseTitle(grammarData.title);
      if (existingTitles.has(key)) {
        console.log(`[process] skipping duplicate grammar: "${grammarData.title}"`);
        skipped++;
      } else {
        existingTitles.add(key);
        await supabase.from("grammar_notes").insert({
          course_id: courseId,
          image_id: image.id,
          title: grammarData.title,
          explanation: grammarData.explanation,
          structure: grammarData.structure ?? null,
          display_order: grammarOrder,
        });
        grammarOrder += 1;
        inserted++;
      }
    }

    const imageType =
      geminiResult.type === "mixed" ? "vocab" : geminiResult.type;

    await supabase
      .from("images")
      .update({ processed: true, type: imageType })
      .eq("id", image.id);

    results.push({ imageId: image.id, type: geminiResult.type, inserted, skipped });
  }

  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);

  return NextResponse.json({ processed: results.length, inserted: totalInserted, skipped: totalSkipped, results });
}
