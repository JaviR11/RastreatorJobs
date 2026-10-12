import { modalityFrom, stripHtml } from "@/sources/text";
import type { SourceDraft, SourceRead } from "@/sources/types";

type GetOnBoardJob = {
  id?: string;
  attributes?: {
    title?: string;
    description?: string;
    countries?: string[];
    remote_modality?: string;
  };
  links?: { public_url?: string };
};

export function parseGetOnBoard(payload: { data?: GetOnBoardJob[] }): SourceDraft[] {
  return (payload.data ?? []).flatMap((job) => {
    const attributes = job.attributes ?? {};
    const modalityName = attributes.remote_modality ?? "";
    if (modalityName !== "fully_remote" && modalityName !== "remote_local") {
      return [];
    }
    const url = job.links?.public_url ?? "";
    const title = attributes.title?.trim() ?? "";
    if (!url || !title) {
      return [];
    }
    return [
      {
        source: "getonbrd",
        externalId: job.id ?? url,
        url,
        title,
        company: "",
        location: (attributes.countries ?? []).join(", "),
        modality: modalityFrom(modalityName),
        body: stripHtml(attributes.description ?? ""),
        publishedAt: "",
      },
    ];
  });
}

export async function readGetOnBoard(): Promise<SourceRead> {
  try {
    const response = await fetch(
      "https://www.getonbrd.com/api/v0/categories/programming/jobs?per_page=5&page=1",
      {
        headers: { accept: "application/json", "user-agent": "job-inbox/1.0" },
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (!response.ok) {
      return {
        source: "getonbrd",
        jobs: [],
        error: `Get on Board respondió ${response.status}`,
      };
    }
    const payload = (await response.json()) as { data?: GetOnBoardJob[] };
    return { source: "getonbrd", jobs: parseGetOnBoard(payload), error: "" };
  } catch (error) {
    return {
      source: "getonbrd",
      jobs: [],
      error: error instanceof Error ? error.message : "Get on Board no respondió",
    };
  }
}
