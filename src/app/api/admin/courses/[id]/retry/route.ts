import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Reset images that failed (processed=true but type='unknown') back to unprocessed
  const { data, error } = await admin
    .from("images")
    .update({ processed: false, type: "unknown" })
    .eq("course_id", id)
    .eq("processed", true)
    .eq("type", "unknown")
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reset: data?.length ?? 0 });
}
