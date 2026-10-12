import { infojobsSearches } from "@/sources/infojobs";

type DigestJob = {
  title: string;
  company: string;
  url: string;
};

export async function sendDigest(jobs: DigestJob[], appUrl: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to || jobs.length === 0) {
    return false;
  }

  const lines = [
    ...jobs.map((job) => {
      const company = job.company ? ` — ${job.company}` : "";
      return `${job.title}${company}\n${job.url}`;
    }),
    "",
    "InfoJobs, ábrelo en el navegador:",
    ...infojobsSearches.map((link) => `${link.label}: ${link.url}`),
    "",
    `Bandeja: ${appUrl}`,
  ];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: "Bandeja <onboarding@resend.dev>",
      to: [to],
      subject: `${jobs.length} ofertas nuevas`,
      text: lines.join("\n"),
    }),
  });
  return response.ok;
}
