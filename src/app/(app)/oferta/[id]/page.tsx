import Link from "next/link";
import { notFound } from "next/navigation";

import { tailorCv } from "@/applications/tailor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStore } from "@/db/store";
import { inboxJob } from "@/jobs/inbox";

export const instant = false;

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await inboxJob(id);
  if (!job) {
    notFound();
  }
  const profile = await getStore().getProfile();
  const stored = job.decision?.tailoredCv
    ? { ok: true as const, cv: job.decision.tailoredCv, letter: job.decision.coverLetter }
    : tailorCv(profile.cvText, job.title, job.body);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <Link href="/" className="text-sm text-muted-foreground">
        Volver a la bandeja
      </Link>
      <h1 className="font-heading text-2xl">{job.title}</h1>
      <p className="text-sm text-muted-foreground">{job.company}</p>
      <a href={job.url} target="_blank" rel="noreferrer">
        Abrir oferta
      </a>
      <Card>
        <CardHeader>
          <CardTitle>CV a medida</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 whitespace-pre-wrap">
          {stored.ok ? (
            <>
              <p>{stored.cv}</p>
              <h2 className="font-heading text-lg">Carta corta</h2>
              <p>{stored.letter}</p>
            </>
          ) : (
            <p>{stored.reason}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
