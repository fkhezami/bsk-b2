/**
 * Renders grammar explanation lines stored as "[type|color] text".
 *
 * Types:  title · bullet · numbered · example · special · extra
 * Colors: red · blue · green · orange · purple · teal · pink · black · indigo
 *
 * Falls back gracefully for legacy lines without tags.
 */

interface Line {
  type: string;
  color: string | null;
  text: string;
}

function parseLine(raw: string): Line {
  // Match [type] or [type|color] — allow spaces around the pipe, any non-bracket chars
  const m = raw.match(/^\[\s*([^\]|]+?)\s*(?:\|\s*([^\]]+?)\s*)?\]\s*/);
  if (m) {
    return {
      type:  m[1].toLowerCase(),
      color: m[2]?.toLowerCase() ?? null,
      text:  raw.slice(m[0].length),
    };
  }
  // Legacy prefixes without color
  if (/^\[rule\]/i.test(raw))    return { type: "bullet",  color: null, text: raw.replace(/^\[rule\]\s*/i, "") };
  if (/^\[special\]/i.test(raw)) return { type: "special", color: null, text: raw.replace(/^\[special\]\s*/i, "") };
  if (/^\[example\]/i.test(raw)) return { type: "example", color: null, text: raw.replace(/^\[example\]\s*/i, "") };
  if (/^\[extra\]/i.test(raw))   return { type: "extra",   color: null, text: raw.replace(/^\[extra\]\s*/i, "") };
  // Plain line — strip leading dash or bullet if present
  return { type: "bullet", color: null, text: raw.replace(/^[-•]\s*/, "") };
}

const PALETTE: Record<string, { text: string; marker: string; bg: string; border: string }> = {
  red:     { text: "text-red-900",     marker: "text-red-400",     bg: "bg-red-50",     border: "border-red-100" },
  blue:    { text: "text-blue-900",    marker: "text-blue-400",    bg: "bg-blue-50",    border: "border-blue-100" },
  green:   { text: "text-emerald-900", marker: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
  orange:  { text: "text-orange-900",  marker: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-100" },
  purple:  { text: "text-purple-900",  marker: "text-purple-400",  bg: "bg-purple-50",  border: "border-purple-100" },
  teal:    { text: "text-teal-900",    marker: "text-teal-500",    bg: "bg-teal-50",    border: "border-teal-100" },
  pink:    { text: "text-pink-900",    marker: "text-pink-400",    bg: "bg-pink-50",    border: "border-pink-100" },
  black:   { text: "text-slate-800",   marker: "text-slate-400",   bg: "bg-slate-50",   border: "border-slate-200" },
  indigo:  { text: "text-indigo-900",  marker: "text-indigo-400",  bg: "bg-indigo-50",  border: "border-indigo-100" },
  default: { text: "text-slate-800",   marker: "text-slate-400",   bg: "bg-slate-50",   border: "border-slate-200" },
};

function c(color: string | null) {
  return PALETTE[color ?? "default"] ?? PALETTE.default;
}

interface Props {
  explanation: string;
  /** Show "Zusatzinformation" section for [extra] lines (default true) */
  showExtras?: boolean;
}

export function GrammarLines({ explanation, showExtras = true }: Props) {
  const lines = explanation
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseLine);

  const main   = lines.filter((l) => l.type !== "extra");
  const extras = lines.filter((l) => l.type === "extra");

  let numCounter = 0;

  const renderLine = (line: Line, i: number) => {
    const col = c(line.color);

    if (line.type === "title") {
      return (
        <li key={i} className={`flex items-start gap-2 text-sm font-bold ${col.text}`}>
          <span className={`${col.marker} mt-0.5 shrink-0`}>•</span>
          <span>{line.text}</span>
        </li>
      );
    }

    return (
      <li key={i} className={`flex items-start gap-2 text-sm ${col.text}`}>
        <span className={`${col.marker} mt-0.5 shrink-0`}>•</span>
        <span>{line.text}</span>
      </li>
    );
  };

  return (
    <div>
      <ul className="space-y-1.5">{main.map(renderLine)}</ul>

      {showExtras && extras.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Zusatzinformation</p>
          <ul className="space-y-1.5">
            {extras.map((line, i) => {
              const ic = PALETTE.indigo;
              return (
                <li key={i} className={`flex items-start gap-2 text-sm ${ic.text} ${ic.bg} rounded px-2 py-1`}>
                  <span className={`${ic.marker} mt-0.5 shrink-0`}>•</span>
                  <span>{line.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
