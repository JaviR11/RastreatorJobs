import { scoreJob } from "@/match/score";
import { getStore } from "@/db/store";
import type { DecisionAction, InboxJob, JobRecord } from "@/db/types";

export async function inboxJobs(action: DecisionAction | "new"): Promise<InboxJob[]> {
  const store = getStore();
  const [jobs, profile] = await Promise.all([store.listJobs(), store.getProfile()]);
  const withDecisions = await Promise.all(
    jobs.map(async (job) => ({
      job,
      decision: await store.getDecision(job.id),
    })),
  );

  return withDecisions
    .filter(({ decision }) => (action === "new" ? !decision : decision?.action === action))
    .map(({ job, decision }) => toInbox(job, decision, profile.cvText))
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt));
}

export async function inboxJob(id: string): Promise<InboxJob | null> {
  const store = getStore();
  const job = await store.getJob(id);
  if (!job) {
    return null;
  }
  const [decision, profile] = await Promise.all([store.getDecision(id), store.getProfile()]);
  return toInbox(job, decision, profile.cvText);
}

function toInbox(
  job: JobRecord,
  decision: InboxJob["decision"],
  cvText: string,
): InboxJob {
  const textForScore = decision?.cvSnapshot || cvText;
  const match = scoreJob(textForScore, `${job.title}\n${job.body}`, job.cardKind);
  return { ...job, decision, match };
}

export function actionFromForm(value: FormDataEntryValue | null): DecisionAction | null {
  switch (value) {
    case "apply":
    case "later":
    case "discard":
      return value;
    default:
      return null;
  }
}
