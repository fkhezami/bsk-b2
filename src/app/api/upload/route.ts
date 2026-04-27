import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayISO } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const dateParam = (formData.get("date") as string | null) ?? todayISO();

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Ensure a draft course exists for this date
  const { data: existingCourse } = await supabase
    .from("courses")
    .select("id")
    .eq("date", dateParam)
    .single();

  let courseId: string;

  if (existingCourse) {
    courseId = existingCourse.id;
  } else {
    const { data: newCourse, error: courseError } = await supabase
      .from("courses")
      .insert({ date: dateParam, status: "draft" })
      .select("id")
      .single();

    if (courseError || !newCourse) {
      return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
    courseId = newCourse.id;
  }

  const uploaded: string[] = [];
  const failed: string[] = [];

  for (const file of files) {
    const capturedAt = (formData.get(`captured_at_${file.name}`) as string | null)
      ?? new Date(file.lastModified || Date.now()).toISOString();

    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `${dateParam}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: storageError } = await supabase.storage
      .from("course-images")
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (storageError) {
      failed.push(file.name);
      continue;
    }

    const { error: dbError } = await supabase.from("images").insert({
      course_id: courseId,
      storage_path: storagePath,
      captured_at: capturedAt,
      processed: false,
      type: "unknown",
    });

    if (dbError) {
      failed.push(file.name);
    } else {
      uploaded.push(file.name);
    }
  }

  return NextResponse.json({ courseId, uploaded, failed });
}
