import { scoreJob } from "@/match/score";

export type TailorResult =
  | { ok: true; cv: string; letter: string }
  | { ok: false; reason: string };

function sentences(cv: string): string[] {
  return cv
    .split(/\n+|(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 20);
}

export function tailorCv(cvText: string, jobTitle: string, jobBody: string): TailorResult {
  if (jobBody.trim().length < 80) {
    return {
      ok: false,
      reason: "Esta oferta solo tiene título y enlace. El CV a medida espera a que haya texto del anuncio.",
    };
  }
  if (cvText.trim().length < 40) {
    return { ok: false, reason: "Escribe el CV en Perfil antes de generar una versión." };
  }

  const match = scoreJob(cvText, `${jobTitle}\n${jobBody}`, "full");
  const needles = [...match.met, ...jobTitle.toLowerCase().split(/\W+/).filter((word) => word.length > 4)];
  const picked = sentences(cvText).filter((sentence) => {
    const folded = sentence.toLowerCase();
    return needles.some((needle) => folded.includes(needle));
  });

  if (picked.length === 0) {
    return {
      ok: false,
      reason: "Ninguna frase del CV cubre lo que pide este anuncio. Puedes ampliar el CV en Perfil y volver a aplicar.",
    };
  }

  const cv = picked.slice(0, 8).join("\n");
  const letter = ["Hola,", "", ...picked.slice(0, 4), ""].join("\n");
  return { ok: true, cv, letter };
}
