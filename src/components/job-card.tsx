import { decideJob } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InboxJob } from "@/db/types";

const sourceLabel: Record<string, string> = {
  tecnoempleo: "Tecnoempleo",
  linkedin: "LinkedIn",
  getonbrd: "Get on Board",
};

function recommendationBadge(job: InboxJob) {
  switch (job.match.recommendation) {
    case "aplicar":
      return <Badge>Aplicar</Badge>;
    case "dudar":
      return <Badge variant="secondary">Dudar</Badge>;
    case "saltar":
      return <Badge variant="outline">Saltar</Badge>;
    case null:
      return <Badge variant="outline">{job.cardKind === "partial" ? "Parcial" : "Sin CV"}</Badge>;
    default: {
      const exhaustive: never = job.match.recommendation;
      return exhaustive;
    }
  }
}

export function JobCard({ job }: { job: InboxJob }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
        <CardDescription>
          {[sourceLabel[job.source] ?? job.source, job.company, job.location, job.modality]
            .filter(Boolean)
            .join(" · ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">{recommendationBadge(job)}</div>
        <p>{job.match.summary}</p>
        {job.match.met.length > 0 ? <p>Cumples: {job.match.met.join(", ")}</p> : null}
        {job.match.gap.length > 0 ? <p>Falta: {job.match.gap.join(", ")}</p> : null}
        <a href={job.url} target="_blank" rel="noreferrer">
          Abrir oferta
        </a>
      </CardContent>
      {job.decision ? null : (
        <CardFooter className="flex flex-wrap gap-2">
          <form action={decideJob} className="flex flex-wrap gap-2">
            <input type="hidden" name="jobId" value={job.id} />
            <Button type="submit" name="action" value="apply">
              Aplicar
            </Button>
            <Button type="submit" name="action" value="later" variant="secondary">
              Luego
            </Button>
            <Button type="submit" name="action" value="discard" variant="outline">
              Descartar
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  );
}
