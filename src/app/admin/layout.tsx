import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, LayoutGrid } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware handles redirect for unauthenticated users on /admin/* except /admin/login
  // Show bare layout for login page (no sidebar)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col py-6 px-4 shrink-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <BookOpen className="w-5 h-5 text-slate-700" />
          <span className="font-semibold text-slate-900 text-sm">Deutsch B2</span>
        </div>
        <nav className="flex-1 space-y-1">
          <Link
            href="/admin/queue"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            Upload Queue
          </Link>
          <Link
            href="/courses"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            View Courses
          </Link>
        </nav>
        <LogoutButton />
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
