import { kindOf, readSources, selectDrafts } from "@/sources/collect";
import { getStore } from "@/db/store";
import { sendDigest } from "@/notify/resend";

export async function runFetch(options: { notify: boolean; appUrl: string }) {
  const reads = await readSources();
  const drafts = selectDrafts(reads);
  const store = getStore();
  const known = new Set((await store.listJobs()).map((job) => job.url));
  const added = await store.upsertJobs(
    drafts.map((job) => ({
      source: job.source,
      externalId: job.externalId,
      url: job.url,
      title: job.title,
      company: job.company,
      location: job.location,
      modality: job.modality,
      body: job.body,
      cardKind: kindOf(job),
      publishedAt: job.publishedAt,
    })),
  );

  const errors = reads.map((read) => read.error).filter(Boolean);
  const fresh = (await store.listJobs()).filter((job) => !known.has(job.url));
  const notified =
    options.notify && added > 0
      ? await sendDigest(
          fresh.map((job) => ({ title: job.title, company: job.company, url: job.url })),
          options.appUrl,
        )
      : false;

  const summary = `${added} ofertas nuevas de ${drafts.length} leídas`;
  await store.saveRun({
    ranAt: new Date().toISOString(),
    summary,
    errors,
    added,
    notified,
  });
  return { added, errors, summary, notified };
}
