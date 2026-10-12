import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { sessionIsValid } from "@/auth/token";

export async function proxy(request: NextRequest) {
  const valid = await sessionIsValid(request.cookies.get("bandeja")?.value);
  if (!valid) {
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/cron).*)"],
};
