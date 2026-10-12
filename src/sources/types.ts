export type Modality = "" | "remoto" | "hibrido" | "presencial";

export type CardKind = "full" | "partial";

export type SourceDraft = {
  source: string;
  externalId: string;
  url: string;
  title: string;
  company: string;
  location: string;
  modality: Modality;
  body: string;
  publishedAt: string;
};

export type SourceRead = {
  source: string;
  jobs: SourceDraft[];
  error: string;
};

export type SearchLink = {
  label: string;
  url: string;
};
