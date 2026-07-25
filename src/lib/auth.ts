import { cookies } from "next/headers";

const SESSION_COOKIE = "swim_session";
const DEFAULT_PASSWORD = "admin123";

/** Simple obfuscation — NOT secure, just prevents casual reading of cookie value. */
function encode(s: string): string {
  return Buffer.from(s).toString("base64");
}

function decode(s: string): string {
  try {
    return Buffer.from(s, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export function getAdminPassword(): string {
  return process.env.LOGIN_PASSWORD || DEFAULT_PASSWORD;
}

export async function createSession(password: string): Promise<boolean> {
  const adminPassword = getAdminPassword();
  if (password !== adminPassword) return false;

  const store = await cookies();
  // Store a token + timestamp; valid for 7 days
  const token = encode(`ok:${Date.now()}`);
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return true;
}

export async function verifySession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const decoded = decode(token);
  if (!decoded.startsWith("ok:")) return false;
  const timestamp = parseInt(decoded.slice(3));
  if (isNaN(timestamp)) return false;
  // Check 7-day expiry
  const age = Date.now() - timestamp;
  if (age > 7 * 24 * 60 * 60 * 1000) return false;
  return true;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
