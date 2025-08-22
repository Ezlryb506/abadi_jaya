import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

// HIBP k-anonymity API: https://api.pwnedpasswords.com/range/{first5}
async function checkHIBP(password: string): Promise<number> {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: {
      'Add-Padding': 'true', // mitigasi timing/size attacks
      'User-Agent': 'abadi-jaya/hibp-check'
    },
    // 10s timeout via AbortController
  });

  if (!resp.ok) {
    throw new Error(`HIBP request failed: ${resp.status}`);
  }
  const text = await resp.text();
  // Response berisi banyak baris: <SUFFIX>:<COUNT>\r\n
  const lines = text.split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    const [suf, cnt] = line.split(':');
    if (suf && suf.trim() === suffix) {
      const n = parseInt((cnt || '0').trim(), 10);
      if (!Number.isNaN(n)) count = n;
      break;
    }
  }
  return count;
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Batasi panjang untuk keamanan dasar
    if (password.length > 1024) {
      return NextResponse.json({ error: 'Password too long' }, { status: 400 });
    }

    const count = await checkHIBP(password);
    return NextResponse.json({ breachedCount: count });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown HIBP error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
