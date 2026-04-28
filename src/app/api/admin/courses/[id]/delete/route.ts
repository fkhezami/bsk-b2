import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch storage paths before deleting so we can clean up storage
  const { data: images } = await supabase
    .from("images")
    .select("storage_path")
    .eq("course_id", id);

  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remove storage files (best-effort)
  if (images?.length) {
    await supabase.storage
      .from("course-images")
      .remove(images.map((i) => i.storage_path));
  }

  return NextResponse.json({ ok: true });
}
