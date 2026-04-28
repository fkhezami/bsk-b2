import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-100 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-300">
        <p>© {year} Deutsch B2 Klasse · All rights reserved</p>
        <div className="flex items-center gap-4">
          <Link href="/disclaimer" className="hover:text-brand-600 transition-colors">
            Disclaimer
          </Link>
          <p>
            Built with{" "}
            <span className="text-red-500" aria-label="love">♥</span>
            {" "}for German learners
          </p>
        </div>
      </div>
    </footer>
  );
}
