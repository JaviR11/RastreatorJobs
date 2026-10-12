import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  cvText: text("cv_text").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  externalId: text("external_id").notNull(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  company: text("company").notNull().default(""),
  location: text("location").notNull().default(""),
  modality: text("modality").notNull().default(""),
  body: text("body").notNull().default(""),
  cardKind: text("card_kind").notNull(),
  publishedAt: text("published_at").notNull().default(""),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
});

export const decisions = pgTable("decisions", {
  jobId: text("job_id").primaryKey(),
  action: text("action").notNull(),
  cvSnapshot: text("cv_snapshot").notNull().default(""),
  tailoredCv: text("tailored_cv").notNull().default(""),
  coverLetter: text("cover_letter").notNull().default(""),
  decidedAt: timestamp("decided_at", { withTimezone: true }).notNull(),
});

export const runs = pgTable("runs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull(),
  summary: text("summary").notNull(),
  errors: text("errors").notNull().default(""),
  added: integer("added").notNull().default(0),
  notified: boolean("notified").notNull().default(false),
});

export const bootstrapSql = `
create table if not exists profile (
  id text primary key,
  cv_text text not null default '',
  updated_at timestamptz not null
);
create table if not exists jobs (
  id text primary key,
  source text not null,
  external_id text not null,
  url text not null unique,
  title text not null,
  company text not null default '',
  location text not null default '',
  modality text not null default '',
  body text not null default '',
  card_kind text not null,
  published_at text not null default '',
  fetched_at timestamptz not null
);
create table if not exists decisions (
  job_id text primary key,
  action text not null,
  cv_snapshot text not null default '',
  tailored_cv text not null default '',
  cover_letter text not null default '',
  decided_at timestamptz not null
);
create table if not exists runs (
  id integer generated always as identity primary key,
  ran_at timestamptz not null,
  summary text not null,
  errors text not null default '',
  added integer not null default 0,
  notified boolean not null default false
);
`;
