import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const [courseRes, imagesRes, flashcardsRes, grammarRes] = await Promise.all([
    admin.from("courses").select("*").eq("id", id).single(),
    admin.from("images").select("*").eq("course_id", id).order("captured_at"),
    admin.from("flashcards").select("*").eq("course_id", id).order("display_order"),
    admin.from("grammar_notes").select("*").eq("course_id", id).order("display_order"),
  ]);

  if (courseRes.error || !courseRes.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    course: courseRes.data,
    images: imagesRes.data ?? [],
    flashcards: flashcardsRes.data ?? [],
    grammarNotes: grammarRes.data ?? [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("courses")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Fetch storage paths before deleting so we can clean up files
  const { data: images } = await admin
    .from("images")
    .select("storage_path")
    .eq("course_id", id);

  if (images && images.length > 0) {
    await admin.storage
      .from("course-images")
      .remove(images.map((img) => img.storage_path));
  }

  const { error } = await admin.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
