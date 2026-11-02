import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  isCorrectAdminPasscode,
  isValidAdminSession,
  readSiteLock,
  updateSiteLock,
} from '../../../lib/site-lock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await readSiteLock();
    return NextResponse.json({ locked: state.locked, message: state.message, updated_at: state.updated_at });
  } catch {
    return NextResponse.json({ error: 'Site lock status is temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { action?: string; passcode?: string; reason?: string };
    if (body.action === 'login') {
      if (!body.passcode || !isCorrectAdminPasscode(body.passcode)) {
        return NextResponse.json({ error: 'Incorrect developer passcode.' }, { status: 401 });
      }
      const response = NextResponse.json({ ok: true });
      response.cookies.set(ADMIN_COOKIE_NAME, createAdminSession(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ADMIN_SESSION_MAX_AGE,
      });
      return response;
    }

    if (!isValidAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
      return NextResponse.json({ error: 'Developer session expired. Please sign in again.' }, { status: 401 });
    }

    if (body.action === 'lock') {
      const reason = (body.reason || '').trim().slice(0, 500);
      if (reason.length < 5) return NextResponse.json({ error: 'Please enter a reason (at least 5 characters).' }, { status: 400 });
      await updateSiteLock(true, reason);
      return NextResponse.json({ ok: true, message: 'Website locked.' });
    }

    if (body.action === 'unlock') {
      await updateSiteLock(false, null);
      return NextResponse.json({ ok: true, message: 'Website unlocked.' });
    }

    if (body.action === 'logout') {
      const response = NextResponse.json({ ok: true });
      response.cookies.set(ADMIN_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
      return response;
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
