import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const COOKIE = 'salon_payment_unlock';

function signature() {
  const secret = process.env.LOCK_SECRET;
  if (!secret) throw new Error('LOCK_SECRET is not configured');
  return createHmac('sha256', secret).update('salon-workspace-unlocked-v1').digest('hex');
}
function validCookie(value?: string) {
  if (!value) return false;
  try {
    const expected = signature();
    const a = Buffer.from(value, 'hex');
    const b = Buffer.from(expected, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}
export async function GET(request: NextRequest) {
  const enabled = process.env.LOCK_ENABLED === 'true';
  if (!enabled) return NextResponse.json({ enabled: false, unlocked: true });
  return NextResponse.json({ enabled: true, unlocked: validCookie(request.cookies.get(COOKIE)?.value) });
}
export async function POST(request: NextRequest) {
  if (process.env.LOCK_ENABLED !== 'true') return NextResponse.json({ unlocked: true });
  const expectedCode = process.env.LOCK_CODE;
  if (!expectedCode || !process.env.LOCK_SECRET) return NextResponse.json({ error: 'Access lock is not configured. Contact the developer.' }, { status: 503 });
  let body: { code?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const supplied = typeof body.code === 'string' ? body.code : '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(expectedCode);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: 'Incorrect code. Please check with the developer.' }, { status: 401 });
  const response = NextResponse.json({ unlocked: true });
  response.cookies.set(COOKIE, signature(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return response;
}
