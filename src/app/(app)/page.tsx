import { collectJobs } from "@/app/actions";
import { JobCard } from "@/components/job-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getStore } from "@/db/store";
import type { DecisionAction } from "@/db/types";
import { inboxJobs } from "@/jobs/inbox";
import { infojobsSearches } from "@/sources/infojobs";

export const instant = false;

function parseEstado(value: string | undefined): DecisionAction | "new" {
  switch (value) {
    case "later":
    case "apply":
    case "discard":
      return value;
    default:
      return "new";
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const params = await searchParams;
  const estado = parseEstado(params.estado);
  const [jobs, profile, run] = await Promise.all([
    inboxJobs(estado),
    getStore().getProfile(),
    getStore().latestRun(),
  ]);

  const title =
    estado === "new"
      ? "Ofertas nuevas"
      : estado === "later"
        ? "Para luego"
        : estado === "apply"
          ? "Aplicadas"
          : "Descartadas";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl">{title}</h1>
        {estado === "new" ? (
          <form action={collectJobs}>
            <Button type="submit">Recoger ofertas</Button>
          </form>
        ) : null}
      </div>

      {profile.cvText.trim().length < 40 ? (
        <Alert>
          <AlertTitle>El CV está vacío</AlertTitle>
          <AlertDescription>
            Escribe tu experiencia en Perfil. Las ofertas nuevas se puntúan con ese texto.
          </AlertDescription>
        </Alert>
      ) : null}

      {run?.errors.length ? (
        <Alert variant="destructive">
          <AlertTitle>Alguna fuente falló en la última recogida</AlertTitle>
          <AlertDescription>{run.errors.join(" ")}</AlertDescription>
        </Alert>
      ) : null}

      {jobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {estado === "new" ? "Todavía no hay ofertas nuevas" : "No hay ofertas en esta lista"}
            </EmptyTitle>
            <EmptyDescription>
              Recoger lee Tecnoempleo, LinkedIn España y las remotas de Get on Board.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <section className="flex flex-col gap-2 rounded-xl border p-4">
        <h2 className="font-heading text-lg">InfoJobs</h2>
        <p className="text-sm text-muted-foreground">
          El servidor recibe un captcha, así que aquí van las búsquedas para abrirlas en el
          navegador y decidir allí.
        </p>
        <ul className="flex flex-col gap-1">
          {infojobsSearches.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
