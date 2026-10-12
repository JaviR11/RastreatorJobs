import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { jobId } from "@/db/ids";
import { bootstrapSql, decisions, jobs, profile, runs } from "@/db/schema";
import type { DecisionAction, DecisionRecord, JobRecord, JobStore, RunRecord } from "@/db/types";
import type { CardKind, Modality } from "@/sources/types";

type ModalityValue = Modality;

function asModality(value: string): ModalityValue {
  switch (value) {
    case "":
    case "remoto":
    case "hibrido":
    case "presencial":
      return value;
    default:
      return "";
  }
}

function asCardKind(value: string): CardKind {
  switch (value) {
    case "full":
    case "partial":
      return value;
    default:
      return "partial";
  }
}

function asAction(value: string): DecisionAction {
  switch (value) {
    case "apply":
    case "later":
    case "discard":
      return value;
    default:
      return "later";
  }
}

function createPostgresStore(databaseUrl: string): JobStore {
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);
  let ready: Promise<void> | null = null;

  const ensure = () => {
    ready ??= sql.unsafe(bootstrapSql).then(() => undefined);
    return ready;
  };

  return {
    async getProfile() {
      await ensure();
      const rows = await db.select().from(profile).where(eq(profile.id, "default"));
      const row = rows[0];
      if (!row) {
        return { cvText: "", updatedAt: "" };
      }
      return { cvText: row.cvText, updatedAt: row.updatedAt.toISOString() };
    },
    async saveProfile(cvText) {
      await ensure();
      const updatedAt = new Date();
      await db
        .insert(profile)
        .values({ id: "default", cvText, updatedAt })
        .onConflictDoUpdate({
          target: profile.id,
          set: { cvText, updatedAt },
        });
      return { cvText, updatedAt: updatedAt.toISOString() };
    },
    async upsertJobs(incoming) {
      await ensure();
      let added = 0;
      for (const job of incoming) {
        const id = jobId(job.url);
        const inserted = await db
          .insert(jobs)
          .values({ ...job, id, fetchedAt: new Date() })
          .onConflictDoNothing()
          .returning({ id: jobs.id });
        added += inserted.length;
      }
      return added;
    },
    async listJobs() {
      await ensure();
      const rows = await db.select().from(jobs).orderBy(desc(jobs.fetchedAt));
      return rows.map(toJob);
    },
    async getJob(id) {
      await ensure();
      const rows = await db.select().from(jobs).where(eq(jobs.id, id));
      const row = rows[0];
      return row ? toJob(row) : null;
    },
    async getDecision(jobIdToFind) {
      await ensure();
      const rows = await db.select().from(decisions).where(eq(decisions.jobId, jobIdToFind));
      const row = rows[0];
      return row ? toDecision(row) : null;
    },
    async saveDecision(decision) {
      await ensure();
      await db
        .insert(decisions)
        .values({ ...decision, decidedAt: new Date(decision.decidedAt) })
        .onConflictDoUpdate({
          target: decisions.jobId,
          set: {
            action: decision.action,
            cvSnapshot: decision.cvSnapshot,
            tailoredCv: decision.tailoredCv,
            coverLetter: decision.coverLetter,
            decidedAt: new Date(decision.decidedAt),
          },
        });
    },
    async saveRun(run) {
      await ensure();
      await db.insert(runs).values({
        ranAt: new Date(run.ranAt),
        summary: run.summary,
        errors: run.errors.join("\n"),
        added: run.added,
        notified: run.notified,
      });
    },
    async latestRun() {
      await ensure();
      const rows = await db.select().from(runs).orderBy(desc(runs.ranAt)).limit(1);
      const row = rows[0];
      if (!row) {
        return null;
      }
      return {
        id: String(row.id),
        ranAt: row.ranAt.toISOString(),
        summary: row.summary,
        errors: row.errors ? row.errors.split("\n").filter(Boolean) : [],
        added: row.added,
        notified: row.notified,
      } satisfies RunRecord;
    },
  };
}

function toJob(row: typeof jobs.$inferSelect): JobRecord {
  return {
    id: row.id,
    source: row.source,
    externalId: row.externalId,
    url: row.url,
    title: row.title,
    company: row.company,
    location: row.location,
    modality: asModality(row.modality),
    body: row.body,
    cardKind: asCardKind(row.cardKind),
    publishedAt: row.publishedAt,
    fetchedAt: row.fetchedAt.toISOString(),
  };
}

function toDecision(row: typeof decisions.$inferSelect): DecisionRecord {
  return {
    jobId: row.jobId,
    action: asAction(row.action),
    cvSnapshot: row.cvSnapshot,
    tailoredCv: row.tailoredCv,
    coverLetter: row.coverLetter,
    decidedAt: row.decidedAt.toISOString(),
  };
}

let cached: { url: string; store: JobStore } | null = null;

export function postgresStore(databaseUrl: string): JobStore {
  if (cached?.url === databaseUrl) {
    return cached.store;
  }
  const store = createPostgresStore(databaseUrl);
  cached = { url: databaseUrl, store };
  return store;
}
