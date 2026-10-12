import { runFetch } from "@/jobs/fetch-run";

export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const origin = new URL(request.url).origin;
  const result = await runFetch({ notify: true, appUrl: origin });
  return Response.json({ ok: true, ...result });
}
