import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { jobId } from "@/db/ids";
import type {
  DecisionRecord,
  JobRecord,
  JobStore,
  ProfileRecord,
  RunRecord,
} from "@/db/types";

type FileData = {
  profile: ProfileRecord;
  jobs: JobRecord[];
  decisions: DecisionRecord[];
  runs: RunRecord[];
};

const empty = (): FileData => ({
  profile: { cvText: "", updatedAt: "" },
  jobs: [],
  decisions: [],
  runs: [],
});

let chain: Promise<unknown> = Promise.resolve();

function filePath(): string {
  return path.join(process.cwd(), ".data", "store.json");
}

async function readData(): Promise<FileData> {
  try {
    const raw = await readFile(filePath(), "utf8");
    return { ...empty(), ...JSON.parse(raw) } as FileData;
  } catch {
    return empty();
  }
}

async function writeData(data: FileData): Promise<void> {
  const target = filePath();
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(data, null, 2));
}

function locked<T>(work: () => Promise<T>): Promise<T> {
  const run = chain.then(work, work);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export const fileStore: JobStore = {
  getProfile() {
    return locked(async () => (await readData()).profile);
  },
  saveProfile(cvText) {
    return locked(async () => {
      const data = await readData();
      data.profile = { cvText, updatedAt: new Date().toISOString() };
      await writeData(data);
      return data.profile;
    });
  },
  upsertJobs(incoming) {
    return locked(async () => {
      const data = await readData();
      const known = new Set(data.jobs.map((job) => job.url));
      let added = 0;
      for (const job of incoming) {
        if (known.has(job.url)) {
          continue;
        }
        data.jobs.push({
          ...job,
          id: jobId(job.url),
          fetchedAt: new Date().toISOString(),
        });
        known.add(job.url);
        added += 1;
      }
      await writeData(data);
      return added;
    });
  },
  listJobs() {
    return locked(async () => (await readData()).jobs);
  },
  getJob(id) {
    return locked(async () => (await readData()).jobs.find((job) => job.id === id) ?? null);
  },
  getDecision(jobIdToFind) {
    return locked(
      async () =>
        (await readData()).decisions.find((decision) => decision.jobId === jobIdToFind) ?? null,
    );
  },
  saveDecision(decision) {
    return locked(async () => {
      const data = await readData();
      data.decisions = data.decisions.filter((item) => item.jobId !== decision.jobId);
      data.decisions.push(decision);
      await writeData(data);
    });
  },
  saveRun(run) {
    return locked(async () => {
      const data = await readData();
      data.runs.unshift({ ...run, id: `${Date.now()}` });
      data.runs = data.runs.slice(0, 20);
      await writeData(data);
    });
  },
  latestRun() {
    return locked(async () => (await readData()).runs[0] ?? null);
  },
};
