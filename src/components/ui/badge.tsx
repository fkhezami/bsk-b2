import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "draft" | "published" | "neutral";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-gold-300/30 text-gold-600 border border-gold-400/40": variant === "draft",
          "bg-emerald-100 text-emerald-700 border border-emerald-200": variant === "published",
          "bg-brand-100 text-brand-700 border border-brand-200": variant === "neutral",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
