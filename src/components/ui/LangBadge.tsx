const FLAGS: Record<string, { src: string; alt: string }> = {
  de: { src: "https://flagcdn.com/de.svg", alt: "DE" },
  en: { src: "https://flagcdn.com/gb.svg", alt: "EN" },
  uk: { src: "https://flagcdn.com/ua.svg", alt: "UA" },
};

interface Props {
  lang: "de" | "en" | "uk";
  size?: number;
}

export function LangBadge({ lang, size = 20 }: Props) {
  const flag = FLAGS[lang];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flag.src}
      alt={flag.alt}
      width={size}
      height={Math.round(size * 0.67)}
      className="rounded-sm inline-block shrink-0"
      style={{ objectFit: "cover" }}
    />
  );
}
