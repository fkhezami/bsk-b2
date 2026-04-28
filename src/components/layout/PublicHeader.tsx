"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, Upload, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/upload", label: "Upload Notes", icon: Upload },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header style={{ background: "#0f0e2e" }} className="border-b border-brand-900 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo → home */}
        <Link href="/" className="relative h-10 w-32 sm:w-44 shrink-0">
          <Image
            src="/logo.svg"
            alt="Deutsch B2 Klasse"
            fill
            style={{ objectFit: "contain", objectPosition: "left" }}
            priority
          />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-brand-700/80 text-white"
                    : "text-brand-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-gold-400" : "text-brand-400")} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {/* Admin link */}
          <Link
            href="/admin/queue"
            className={cn(
              "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ml-1 border border-brand-700",
              pathname.startsWith("/admin")
                ? "bg-brand-700/80 text-white border-brand-500"
                : "text-brand-400 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutGrid className={cn("w-4 h-4 shrink-0", pathname.startsWith("/admin") ? "text-gold-400" : "text-brand-500")} />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
