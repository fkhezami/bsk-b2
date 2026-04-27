import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const [courseRes, flashcardsRes, grammarRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).eq("status", "published").single(),
    supabase.from("flashcards").select("*").eq("course_id", id).order("display_order"),
    supabase.from("grammar_notes").select("*").eq("course_id", id).order("display_order"),
  ]);

  if (courseRes.error || !courseRes.data) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({
    course: courseRes.data,
    flashcards: flashcardsRes.data ?? [],
    grammarNotes: grammarRes.data ?? [],
  });
}
