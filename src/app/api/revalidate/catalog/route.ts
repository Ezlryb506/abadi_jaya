import { NextRequest, NextResponse } from 'next/server';
import { revalidateCatalog } from '@/lib/revalidate';

// API to manually revalidate catalog caches when data changes are rare.
// Security: require secret via header `x-revalidate-token` or query `?secret=`
export const runtime = 'nodejs';

async function handle(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const headerSecret = request.headers.get('x-revalidate-token') || '';
    const querySecret = url.searchParams.get('secret') || '';
    const secret = headerSecret || querySecret;
    const expected = process.env.REVALIDATE_SECRET || '';

    if (!expected || secret !== expected) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    await revalidateCatalog();

    return NextResponse.json({ ok: true, tag: 'catalog', revalidatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[api/revalidate/catalog] error', err);
    return NextResponse.json({ ok: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handle(request);
}

// Optional GET for convenience (still requires secret)
export async function GET(request: NextRequest) {
  return handle(request);
}
