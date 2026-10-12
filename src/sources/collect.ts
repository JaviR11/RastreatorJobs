import { readGetOnBoard } from "@/sources/getonbrd";
import { readLinkedin } from "@/sources/linkedin";
import { readTecnoempleo } from "@/sources/tecnoempleo";
import { canonicalUrl, cardKindFor, fitsPlace } from "@/sources/text";
import type { SourceDraft, SourceRead } from "@/sources/types";

export async function readSources(): Promise<SourceRead[]> {
  return Promise.all([readTecnoempleo(), readLinkedin(), readGetOnBoard()]);
}

export function selectDrafts(reads: SourceRead[]): SourceDraft[] {
  const seen = new Set<string>();
  const selected: SourceDraft[] = [];
  for (const read of reads) {
    for (const job of read.jobs) {
      const url = canonicalUrl(job.url);
      if (!url || seen.has(url) || !fitsPlace(job)) {
        continue;
      }
      seen.add(url);
      selected.push({ ...job, url });
    }
  }
  return selected;
}

export function kindOf(job: SourceDraft) {
  return cardKindFor(job.body);
}
