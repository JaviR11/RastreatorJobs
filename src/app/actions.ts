"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { tailorCv } from "@/applications/tailor";
import { createSessionValue, expectedPassword } from "@/auth/token";
import { actionFromForm } from "@/jobs/inbox";
import { runFetch } from "@/jobs/fetch-run";
import { getStore } from "@/db/store";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = expectedPassword();
  if (!expected || password !== expected) {
    redirect("/login?error=1");
  }
  const jar = await cookies();
  jar.set("bandeja", await createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete("bandeja");
  redirect("/login");
}

export async function saveCv(formData: FormData) {
  const cvText = String(formData.get("cvText") ?? "");
  await getStore().saveProfile(cvText);
  redirect("/perfil?guardado=1");
}

export async function collectJobs() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  await runFetch({ notify: false, appUrl: `${proto}://${host}` });
  redirect("/");
}

export async function decideJob(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  const action = actionFromForm(formData.get("action"));
  if (!jobId || !action) {
    redirect("/");
  }
  const store = getStore();
  const job = await store.getJob(jobId);
  if (!job) {
    redirect("/");
  }
  const profile = await store.getProfile();
  const tailored =
    action === "apply" ? tailorCv(profile.cvText, job.title, job.body) : null;
  await store.saveDecision({
    jobId,
    action,
    cvSnapshot: profile.cvText,
    tailoredCv: tailored?.ok ? tailored.cv : "",
    coverLetter: tailored?.ok ? tailored.letter : "",
    decidedAt: new Date().toISOString(),
  });
  redirect(action === "apply" ? `/oferta/${jobId}` : "/");
}
