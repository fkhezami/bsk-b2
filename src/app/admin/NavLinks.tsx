"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, BookOpen, GraduationCap, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Manage",
    links: [
      { href: "/admin/queue", label: "Upload Queue", icon: UploadCloud, queue: true },
      { href: "/admin/courses", label: "All Courses", icon: LayoutGrid, queue: false },
    ],
  },
  {
    label: "Student",
    links: [
      { href: "/courses", label: "Course Library", icon: GraduationCap, queue: false },
      { href: "/upload", label: "Upload Notes", icon: BookOpen, queue: false },
    ],
  },
];

export function NavLinks({ toGenerate = 0, toReview = 0 }: { toGenerate?: number; toReview?: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-400 select-none">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.links.map(({ href, label, icon: Icon, queue }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              const hasQueue = queue && (toGenerate > 0 || toReview > 0);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    active
                      ? "bg-brand-700/80 text-white shadow-sm"
                      : "text-brand-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      active ? "text-gold-400" : "text-brand-400 group-hover:text-brand-200"
                    )}
                  />
                  {label}
                  {hasQueue ? (
                    <span className="ml-auto flex items-center gap-1">
                      {toGenerate > 0 && (
                        <span className="text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full px-1.5 py-0.5 leading-none">
                          {toGenerate}
                        </span>
                      )}
                      {toReview > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-400 text-white rounded-full px-1.5 py-0.5 leading-none">
                          {toReview}
                        </span>
                      )}
                    </span>
                  ) : active ? (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
