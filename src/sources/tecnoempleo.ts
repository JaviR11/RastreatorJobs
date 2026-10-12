import { modalityFrom, stripHtml, tagValue } from "@/sources/text";
import type { SourceDraft, SourceRead } from "@/sources/types";

export const TECNOEMPLEO_URL =
  "https://www.tecnoempleo.com/alertas-empleo-rss.php?pr=279";

export function parseTecnoempleo(xml: string): SourceDraft[] {
  return xml
    .split("<item>")
    .slice(1)
    .map((item) => {
      const rawDescription = tagValue(item, "description");
      const body = stripHtml(rawDescription);
      const plain = stripHtml(rawDescription);
      const company = plain.match(/Empresa:\s*([^\n]+)/i)?.[1]?.trim() ?? "";
      const province = plain.match(/Provincia:\s*([^\n]+)/i)?.[1]?.trim() ?? "";
      const title = stripHtml(tagValue(item, "title"));
      const url = stripHtml(tagValue(item, "link"));
      return {
        source: "tecnoempleo",
        externalId: url,
        url,
        title,
        company: stripHtml(company),
        location: stripHtml(province),
        modality: modalityFrom(`${province} ${title} ${body}`),
        body,
        publishedAt: tagValue(item, "pubDate"),
      };
    })
    .filter((job) => job.title && job.url);
}

export async function readTecnoempleo(): Promise<SourceRead> {
  try {
    const response = await fetch(TECNOEMPLEO_URL, {
      headers: { "user-agent": "job-inbox/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      return {
        source: "tecnoempleo",
        jobs: [],
        error: `Tecnoempleo respondió ${response.status}`,
      };
    }
    const xml = await response.text();
    if (!xml.includes("<item>")) {
      return {
        source: "tecnoempleo",
        jobs: [],
        error: "Tecnoempleo no devolvió ofertas",
      };
    }
    return {
      source: "tecnoempleo",
      jobs: parseTecnoempleo(xml).slice(0, 40),
      error: "",
    };
  } catch (error) {
    return {
      source: "tecnoempleo",
      jobs: [],
      error: error instanceof Error ? error.message : "Tecnoempleo no respondió",
    };
  }
}
