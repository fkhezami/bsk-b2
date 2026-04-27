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
          "bg-amber-100 text-amber-800": variant === "draft",
          "bg-emerald-100 text-emerald-800": variant === "published",
          "bg-slate-100 text-slate-700": variant === "neutral",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
