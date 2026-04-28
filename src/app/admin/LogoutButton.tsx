"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-brand-400 hover:bg-white/5 hover:text-red-400 transition-all group"
    >
      <LogOut className="w-4 h-4 shrink-0 group-hover:text-red-400 transition-colors" />
      Sign out
    </button>
  );
}
