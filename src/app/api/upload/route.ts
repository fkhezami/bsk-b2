import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractDateFromFile } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getOrCreateCourse(supabase: ReturnType<typeof createAdminClient>, date: string) {
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("date", date)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("courses")
    .insert({ date, status: "draft" })
    .select("id")
    .single();

  if (error || !created) throw new Error(`Failed to create course for ${date}: ${error?.message}`);
  return created.id;
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const overrideDate = (formData.get("override_date") as string | null) ?? null;

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploaded: string[] = [];
  const failed: string[] = [];
  // Cache course ids so we don't hit the DB on every file
  const courseIdByDate: Record<string, string> = {};

  for (const file of files) {
    const lastModified = parseInt(formData.get(`last_modified_${file.name}`) as string || "0") || Date.now();
    const date = overrideDate ?? extractDateFromFile(file.name, lastModified);
    const capturedAt = new Date(date);

    let courseId: string;
    try {
      if (!courseIdByDate[date]) {
        courseIdByDate[date] = await getOrCreateCourse(supabase, date);
      }
      courseId = courseIdByDate[date];
    } catch {
      failed.push(file.name);
      continue;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());

    // Deterministic path based on file content — same image always maps to the same path
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 24);
    const storagePath = `${date}/${hash}.${ext}`;

    // Skip if this exact image was already uploaded (same hash = same file)
    const { data: existing } = await supabase
      .from("images")
      .select("id")
      .eq("storage_path", storagePath)
      .maybeSingle();

    if (existing) {
      uploaded.push(file.name); // treat as success — already there
      continue;
    }

    const { error: storageError } = await supabase.storage
      .from("course-images")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (storageError) {
      failed.push(file.name);
      continue;
    }

    const { error: dbError } = await supabase.from("images").insert({
      course_id: courseId,
      storage_path: storagePath,
      captured_at: capturedAt.toISOString(),
      processed: false,
      type: "unknown",
    });

    if (dbError) {
      failed.push(file.name);
    } else {
      uploaded.push(file.name);
    }
  }

  return NextResponse.json({
    courses: Object.keys(courseIdByDate).length,
    uploaded,
    failed,
  });
}
