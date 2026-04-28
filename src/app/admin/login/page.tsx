"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid credentials.");
      setLoading(false);
      return;
    }

    router.push("/admin/queue");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#0f0e2e" }}>

      {/* Top logo bar */}
      <div className="flex justify-center pt-16 pb-10">
        <div className="relative h-12 w-52">
          <Image src="/logo.svg" alt="Deutsch B2 Klasse" fill style={{ objectFit: "contain" }} priority />
        </div>
      </div>

      {/* Card */}
      <div className="flex justify-center px-4">
        <div className="bg-white rounded-2xl border border-brand-100 shadow-xl p-8 w-full max-w-sm">
          <h1 className="text-lg font-bold text-brand-950 mb-1">Admin sign in</h1>
          <p className="text-brand-400 text-sm mb-6">Access the teacher dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-700 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-950 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-700 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-950 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="flex justify-center mt-8 gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-700" />
        <div className="w-2 h-2 rounded-full bg-red-700" />
        <div className="w-2 h-2 rounded-full bg-gold-500" />
      </div>
    </main>
  );
}
