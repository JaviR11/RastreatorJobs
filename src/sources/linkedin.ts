import { modalityFrom, stripHtml } from "@/sources/text";
import type { SourceDraft, SourceRead } from "@/sources/types";

export const LINKEDIN_SPAIN_URL =
  "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=desarrollador&location=Spain&geoId=105646813&start=0";

function field(block: string, className: string): string {
  const pattern = new RegExp(`${className}[^>]*>([\\s\\S]*?)</`, "i");
  return stripHtml(block.match(pattern)?.[1] ?? "");
}

export function parseLinkedin(html: string): SourceDraft[] {
  return html
    .split("urn:li:jobPosting:")
    .slice(1)
    .flatMap((block) => {
      const id = block.match(/^(\d+)/)?.[1] ?? "";
      const title = field(block, "base-search-card__title");
      if (!id || !title) {
        return [];
      }
      const location = field(block, "job-search-card__location");
      return [
        {
          source: "linkedin",
          externalId: id,
          url: `https://www.linkedin.com/jobs/view/${id}`,
          title,
          company: field(block, "base-search-card__subtitle"),
          location,
          modality: modalityFrom(`${title} ${location}`),
          body: "",
          publishedAt: "",
        },
      ];
    });
}

export async function readLinkedin(): Promise<SourceRead> {
  try {
    const response = await fetch(LINKEDIN_SPAIN_URL, {
      headers: { "user-agent": "job-inbox/1.0" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      return {
        source: "linkedin",
        jobs: [],
        error: `LinkedIn respondió ${response.status}`,
      };
    }
    const jobs = parseLinkedin(await response.text());
    if (jobs.length === 0) {
      return { source: "linkedin", jobs: [], error: "LinkedIn no devolvió fichas" };
    }
    return { source: "linkedin", jobs, error: "" };
  } catch (error) {
    return {
      source: "linkedin",
      jobs: [],
      error: error instanceof Error ? error.message : "LinkedIn no respondió",
    };
  }
}
