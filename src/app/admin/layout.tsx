import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { LogoutButton } from "./LogoutButton";
import { Footer } from "@/components/layout/Footer";

function SummaryRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-xs text-brand-300">{label}</span>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{count}</span>
    </div>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const adminSupabase = createAdminClient();
  const [{ count: toGenerate }, { data: draftCourses }, { count: published }, { data: pendingImages }] = await Promise.all([
    adminSupabase.from("images").select("id", { count: "exact", head: true }).eq("processed", false),
    adminSupabase.from("courses").select("id").eq("status", "draft"),
    adminSupabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
    adminSupabase.from("images").select("course_id").eq("processed", false),
  ]);

  const draftTotal = draftCourses?.length ?? 0;
  const courseIdsWithPending = new Set((pendingImages ?? []).map((r) => r.course_id));
  const toReview = (draftCourses ?? []).filter((c) => !courseIdsWithPending.has(c.id)).length;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-surface)" }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col shrink-0 py-5" style={{ background: "#0f0e2e" }}>

        {/* Logo → home */}
        <div className="px-4 mb-8">
          <Link href="/" className="relative block h-12 w-44">
            <Image src="/logo.svg" alt="Deutsch B2 Klasse" fill style={{ objectFit: "contain", objectPosition: "left" }} priority />
          </Link>
          <div className="mt-2 mx-1 h-px" style={{ background: "rgba(165,180,252,0.12)" }} />
        </div>

        {/* Summary stats */}
        <div className="px-4 mb-6 space-y-1.5">
          <SummaryRow color="#f59e0b" label="To generate" count={toGenerate ?? 0} />
          <SummaryRow color="#94a3b8" label="Draft"       count={draftTotal} />
          <SummaryRow color="#818cf8" label="To review"   count={toReview} />
          <SummaryRow color="#34d399" label="Published"   count={published  ?? 0} />
        </div>

        {/* Nav */}
        <NavLinks toGenerate={toGenerate ?? 0} toReview={toReview} />

        {/* Footer */}
        <div className="mt-auto px-3 pt-4" style={{ borderTop: "1px solid rgba(165,180,252,0.1)" }}>
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-brand-400 truncate">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
