import { NextRequest, NextResponse } from 'next/server';
import { guardAllow } from '@/lib/rateLimit';

function getClientIp(req: NextRequest): string {
  // Next.js on Vercel exposes req.ip; fallback to XFF for other setups
  const direct = (req as unknown as { ip?: string }).ip;
  if (direct) return direct;
  const xff = req.headers.get('x-forwarded-for');
  if (!xff) return '0.0.0.0';
  const first = xff.split(',')[0]?.trim();
  return first || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const email: string = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
    const purpose: string = typeof body?.purpose === 'string' ? body.purpose : 'login';

    const emailKey = email ? email : 'no-email';
    const key = `ip:${ip}|purpose:${purpose}|email:${emailKey}`;

    const res = await guardAllow(key);
    const waitMs = Math.max(0, res.reset - Date.now());

    return NextResponse.json(
      {
        ok: res.ok,
        remaining: res.remaining,
        reset: res.reset,
        waitMs,
      },
      { status: 200 }
    );
  } catch (e) {
    // Log detail untuk developer, respons tetap aman untuk user
    console.error('[API][auth/guard][POST] Unexpected error:', e);
    return NextResponse.json({ ok: true, remaining: 1, reset: Date.now() + 1000, waitMs: 0 }, { status: 200 });
  }
}
