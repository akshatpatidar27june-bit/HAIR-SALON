import { createHmac, timingSafeEqual } from 'node:crypto';

export type SiteLockState = {
  locked: boolean;
  message: string | null;
  updated_at?: string;
};

const supabaseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireDatabaseConfig() {
  const url = supabaseUrl();
  const key = serviceKey();
  if (!url || !key) throw new Error('Site lock is not configured. Add SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL).');
  return { url: url.replace(/\/$/, ''), key };
}

export async function readSiteLock(): Promise<SiteLockState> {
  const { url, key } = requireDatabaseConfig();
  const response = await fetch(`${url}/rest/v1/site_lock?id=eq.1&select=locked,message,updated_at`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Unable to read the site lock status.');
  const rows = await response.json() as SiteLockState[];
  if (!rows[0]) throw new Error('Site lock row is missing. Run the site-lock SQL migration.');
  return rows[0];
}

export async function updateSiteLock(locked: boolean, message: string | null) {
  const { url, key } = requireDatabaseConfig();
  const response = await fetch(`${url}/rest/v1/site_lock?id=eq.1`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ locked, message, updated_at: new Date().toISOString() }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Unable to update the site lock.');
}

const COOKIE_NAME = 'akshat_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function sessionSecret() {
  const secret = process.env.AKSHAT_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('AKSHAT_SESSION_SECRET must contain at least 32 characters.');
  return secret;
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex');
}

export function createAdminSession() {
  const value = String(Date.now());
  return `${value}.${sign(value)}`;
}

export function isValidAdminSession(value?: string) {
  if (!value) return false;
  const [timestamp, signature] = value.split('.');
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return false;
  const age = Date.now() - Number(timestamp);
  if (age < 0 || age > SESSION_MAX_AGE_SECONDS * 1000) return false;
  try {
    const expected = Buffer.from(sign(timestamp), 'hex');
    const supplied = Buffer.from(signature, 'hex');
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  } catch {
    return false;
  }
}

export function isCorrectAdminPasscode(passcode: string) {
  const expected = process.env.AKSHAT_ADMIN_PASSWORD;
  if (!expected) throw new Error('AKSHAT_ADMIN_PASSWORD is not configured in Vercel.');
  const a = Buffer.from(passcode);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
