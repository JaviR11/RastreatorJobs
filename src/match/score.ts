import type { CardKind } from "@/sources/types";

export type Recommendation = "aplicar" | "dudar" | "saltar";

export type MatchResult = {
  cardKind: CardKind;
  met: string[];
  gap: string[];
  recommendation: Recommendation | null;
  summary: string;
};

const TERMS = [
  "python",
  "postgresql",
  "sql",
  "etl",
  "power bi",
  "dax",
  "aws",
  "docker",
  "typescript",
  "react",
  "vue",
  "next.js",
  "django",
  "spark",
  "pyspark",
  "n8n",
  "databricks",
  "snowflake",
  "kafka",
  "kubernetes",
  "java",
  "scala",
  "terraform",
  "azure",
  "gcp",
  "tableau",
  "airflow",
  "dbt",
  "angular",
  "php",
  "golang",
] as const;

const HARD_GAPS = new Set(["databricks", "snowflake", "kafka"]);

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/nextjs|next js/g, "next.js")
    .replace(/powerbi/g, "power bi")
    .replace(/postgres\b/g, "postgresql");
}

function includesTerm(text: string, term: string): boolean {
  if (term === "sql") {
    return /\bsql\b/.test(text);
  }
  return text.includes(term);
}

export function scoreJob(cvText: string, jobText: string, cardKind: CardKind): MatchResult {
  if (cardKind === "partial" || jobText.trim().length < 80) {
    return {
      cardKind: "partial",
      met: [],
      gap: [],
      recommendation: null,
      summary: "Hay título y enlace. El texto del anuncio no ha llegado, así que no hay encaje que calcular.",
    };
  }
  if (cvText.trim().length < 40) {
    return {
      cardKind: "full",
      met: [],
      gap: [],
      recommendation: null,
      summary: "Pega tu CV en Perfil para ver qué cumples y qué falta.",
    };
  }

  const cv = fold(cvText);
  const job = fold(jobText);
  const met = TERMS.filter((term) => includesTerm(job, term) && includesTerm(cv, term));
  const gap = TERMS.filter((term) => includesTerm(job, term) && !includesTerm(cv, term));
  const years = job.match(/(\d+)\s*(?:\+|o mas|o más)?\s*anos/);
  const askedYears = years ? Number(years[1]) : 0;
  const yearGap =
    askedYears >= 6 && !new RegExp(`${askedYears}\\s*anos`).test(cv)
      ? [`el anuncio pide ${askedYears} años y el CV no lo dice`]
      : [];
  const gaps = [...gap, ...yearGap];
  const hard = gap.some((term) => HARD_GAPS.has(term)) || yearGap.length > 0;
  const ratio = met.length / Math.max(1, met.length + gaps.length);

  let recommendation: Recommendation = "saltar";
  if (met.length >= 2 && ratio >= 0.5 && !hard) {
    recommendation = "aplicar";
  } else if (met.length >= 1) {
    recommendation = "dudar";
  }

  const summary = recommendationLabel(recommendation);
  return { cardKind: "full", met, gap: gaps, recommendation, summary };
}

export function recommendationLabel(recommendation: Recommendation): string {
  switch (recommendation) {
    case "aplicar":
      return "El anuncio coincide con varias frases del CV.";
    case "dudar":
      return "Hay algo en común y también huecos. Conviene leerlo antes de aplicar.";
    case "saltar":
      return "El anuncio pide poco de lo que el CV cuenta ahora.";
    default: {
      const exhaustive: never = recommendation;
      return exhaustive;
    }
  }
}
