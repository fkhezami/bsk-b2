import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Swaps display_order between two flashcards
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { idA, orderA, idB, orderB } = await req.json();
  const admin = createAdminClient();

  await Promise.all([
    admin.from("flashcards").update({ display_order: orderB }).eq("id", idA),
    admin.from("flashcards").update({ display_order: orderA }).eq("id", idB),
  ]);

  return NextResponse.json({ ok: true });
}
