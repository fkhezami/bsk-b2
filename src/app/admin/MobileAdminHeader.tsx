"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./NavLinks";

interface Props {
  email: string;
  toGenerate: number;
  toReview: number;
}

export function MobileAdminHeader({ email, toGenerate, toReview }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-50 border-b border-brand-900" style={{ background: "#0f0e2e" }}>
        <Link href="/" className="relative h-9 w-32">
          <Image src="/logo.svg" alt="Deutsch B2" fill style={{ objectFit: "contain", objectPosition: "left" }} priority />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-brand-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col py-5 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#0f0e2e" }}
      >
        <div className="flex items-center justify-between px-4 mb-8">
          <Link href="/" className="relative h-10 w-36">
            <Image src="/logo.svg" alt="Deutsch B2" fill style={{ objectFit: "contain", objectPosition: "left" }} priority />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div onClick={() => setOpen(false)} className="flex-1 overflow-y-auto">
          <NavLinks toGenerate={toGenerate} toReview={toReview} />
        </div>

        <div className="px-4 pt-4 border-t border-brand-800">
          <p className="text-xs text-brand-400 truncate px-3 py-2">{email}</p>
        </div>
      </div>
    </>
  );
}
