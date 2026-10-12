export function stripHtml(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function tagValue(block: string, tag: string): string {
  const pattern = new RegExp(
    `<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`,
    "i",
  );
  const match = block.match(pattern);
  return match?.[1]?.trim() ?? "";
}

export function canonicalUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "ref" || key === "tracking") {
        parsed.searchParams.delete(key);
      }
    }
    const path = parsed.pathname.replace(/\/$/, "") || "/";
    const query = parsed.searchParams.toString();
    return `${parsed.origin}${path}${query ? `?${query}` : ""}`;
  } catch {
    return url.trim();
  }
}

const VALENCIA = [
  "valencia",
  "valencian",
  "catarroja",
  "paterna",
  "almussafes",
  "albalat",
  "burjassot",
  "torrent",
  "sagunt",
  "manises",
  "quart de poblet",
  "mislata",
  "alaquas",
  "xirivella",
];

export function modalityFrom(text: string): "remoto" | "hibrido" | "presencial" | "" {
  const value = text.toLowerCase();
  if (/remoto|remote|teletrabajo|fully_remote|100\s*%/.test(value)) {
    return "remoto";
  }
  if (/h[ií]brid|hybrid/.test(value)) {
    return "hibrido";
  }
  if (value.trim()) {
    return "presencial";
  }
  return "";
}

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function fitsPlace(input: {
  location: string;
  title: string;
  body: string;
  modality: string;
}): boolean {
  const blob = fold(`${input.location} ${input.title} ${input.body} ${input.modality}`);
  if (input.modality === "remoto" || /remoto|remote|teletrabajo|100\s*%/.test(blob)) {
    return true;
  }
  return VALENCIA.some((place) => blob.includes(fold(place)));
}

export function cardKindFor(body: string): "full" | "partial" {
  return body.trim().length >= 80 ? "full" : "partial";
}
