import { fileStore } from "@/db/file-store";
import { postgresStore } from "@/db/postgres-store";
import type { JobStore } from "@/db/types";

export function getStore(): JobStore {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return postgresStore(databaseUrl);
  }
  return fileStore;
}
