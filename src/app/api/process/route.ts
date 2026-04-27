import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeImage } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  // Verify admin session via Authorization header bearing the service key
  const auth = req.headers.get("x-admin-secret");
  if (auth !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  // Fetch all unprocessed images for this course, ordered by captured_at
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

  let vocabOrder = 0;
  let grammarOrder = 0;
  const results: { imageId: string; type: string; count: number }[] = [];

  for (const image of images) {
    // Download image from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("course-images")
      .download(image.storage_path);

    if (downloadError || !fileData) {
      continue;
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = fileData.type || "image/jpeg";

    let geminiResult;
    try {
      geminiResult = await analyzeImage(base64, mimeType);
    } catch {
      // Mark as processed with unknown type so we don't retry endlessly
      await supabase.from("images").update({ processed: true }).eq("id", image.id);
      continue;
    }

    if (geminiResult.type === "vocab") {
      const rows = geminiResult.items.map((item, i) => ({
        course_id: courseId,
        image_id: image.id,
        word_de: item.word_de,
        translation_en: item.translation_en,
        translation_uk: item.translation_uk,
        example_de: item.example_de ?? null,
        display_order: vocabOrder + i,
      }));

      if (rows.length > 0) {
        await supabase.from("flashcards").insert(rows);
        vocabOrder += rows.length;
      }

      await supabase
        .from("images")
        .update({ processed: true, type: "vocab" })
        .eq("id", image.id);

      results.push({ imageId: image.id, type: "vocab", count: rows.length });
    } else if (geminiResult.type === "grammar") {
      await supabase.from("grammar_notes").insert({
        course_id: courseId,
        image_id: image.id,
        title: geminiResult.title,
        explanation: geminiResult.explanation,
        structure: geminiResult.structure ?? null,
        display_order: grammarOrder,
      });

      grammarOrder += 1;

      await supabase
        .from("images")
        .update({ processed: true, type: "grammar" })
        .eq("id", image.id);

      results.push({ imageId: image.id, type: "grammar", count: 1 });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
