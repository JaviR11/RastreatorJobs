import type { CardKind, Modality } from "@/sources/types";
import type { Recommendation } from "@/match/score";

export type DecisionAction = "apply" | "later" | "discard";

export type JobRecord = {
  id: string;
  source: string;
  externalId: string;
  url: string;
  title: string;
  company: string;
  location: string;
  modality: Modality;
  body: string;
  cardKind: CardKind;
  publishedAt: string;
  fetchedAt: string;
};

export type DecisionRecord = {
  jobId: string;
  action: DecisionAction;
  cvSnapshot: string;
  tailoredCv: string;
  coverLetter: string;
  decidedAt: string;
};

export type ProfileRecord = {
  cvText: string;
  updatedAt: string;
};

export type RunRecord = {
  id: string;
  ranAt: string;
  summary: string;
  errors: string[];
  added: number;
  notified: boolean;
};

export type InboxJob = JobRecord & {
  decision: DecisionRecord | null;
  match: {
    met: string[];
    gap: string[];
    recommendation: Recommendation | null;
    summary: string;
  };
};

export type JobStore = {
  getProfile(): Promise<ProfileRecord>;
  saveProfile(cvText: string): Promise<ProfileRecord>;
  upsertJobs(jobs: Omit<JobRecord, "id" | "fetchedAt">[]): Promise<number>;
  listJobs(): Promise<JobRecord[]>;
  getJob(id: string): Promise<JobRecord | null>;
  getDecision(jobId: string): Promise<DecisionRecord | null>;
  saveDecision(decision: DecisionRecord): Promise<void>;
  saveRun(run: Omit<RunRecord, "id">): Promise<void>;
  latestRun(): Promise<RunRecord | null>;
};
