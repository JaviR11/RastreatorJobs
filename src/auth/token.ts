const encoder = new TextEncoder();

export function authSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.APP_PASSWORD;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV !== "production") {
    return "dev-bandeja-local";
  }
  return "";
}

export function expectedPassword(): string {
  if (process.env.APP_PASSWORD) {
    return process.env.APP_PASSWORD;
  }
  if (process.env.NODE_ENV !== "production") {
    return "bandeja-local";
  }
  return "";
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const text = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(text).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(signature);
}

export async function createSessionValue(now = Date.now()): Promise<string> {
  const secret = authSecret();
  const expires = String(now + 1000 * 60 * 60 * 24 * 30);
  const signature = await hmac(expires, secret);
  return `${expires}.${signature}`;
}

export async function sessionIsValid(value: string | undefined, now = Date.now()): Promise<boolean> {
  const secret = authSecret();
  if (!value || !secret) {
    return false;
  }
  const [expires, signature] = value.split(".");
  if (!expires || !signature) {
    return false;
  }
  if (Number(expires) < now) {
    return false;
  }
  const expected = await hmac(expires, secret);
  return expected === signature;
}
