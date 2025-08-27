import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Runtime: Node.js (default). Avoid Edge since SDK may use Node features.

type ReqBody = {
  hintName?: string;
  hintDescription?: string;
  categoryOptions?: string[]; // list of category names for mapping
  hintImageName?: string; // optional: selected image filename to improve context
  model?: string; // optional model selection
};

type AiResult = {
  name: string;
  categoryName: string; // one of categoryOptions when possible
  description: string;
  tags?: string[];
};

// Simple in-memory rate limiter (suitable for single-instance dev/prod with low traffic)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window per IP
const rateStore = new Map<string, { count: number; windowStart: number }>();

function getClientIp(req: NextRequest): string {
  const xfwd = req.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'local';
}

function rateLimit(ip: string) {
  const now = Date.now();
  const rec = rateStore.get(ip);
  if (!rec) {
    rateStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, retryAfter: 0 };
  }
  const { windowStart, count } = rec;
  if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
    rateStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, retryAfter: 0 };
  }
  if (count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  const nextCount = count + 1;
  rateStore.set(ip, { count: nextCount, windowStart });
  return { allowed: true, remaining: Math.max(0, RATE_LIMIT_MAX - nextCount), retryAfter: 0 };
}

function truncate(str: string, max: number) {
  const s = (str || '').trim();
  return s.length > max ? s.slice(0, max).trim() : s;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY; // server-only, jangan gunakan NEXT_PUBLIC_*
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi (harap set di .env.local, server-only)' }, { status: 500 });
    }

    // Apply rate limit per client IP
    const ip = getClientIp(req);
    const rl = rateLimit(ip);
    if (!rl.allowed) {
      return new NextResponse(JSON.stringify({ error: 'Terlalu banyak permintaan, coba lagi beberapa saat.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      });
    }

    const body = (await req.json()) as ReqBody;
    const { hintName = '', hintDescription = '', categoryOptions = [], hintImageName = '', model } = body || {};

    // Allowlist models to prevent misuse
    const allowedModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    const chosenModel = allowedModels.includes(String(model)) ? String(model) : 'gemini-1.5-flash';

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelHandle = genAI.getGenerativeModel({ model: chosenModel });

    const sys = `Anda adalah asisten produk untuk bengkel las dan fabrikasi besi.
- Beri saran nama produk singkat (<= 60 karakter), natural dan menarik.
- Pilih satu kategori paling relevan dari daftar yang diberikan (jika ada). Jika tak ada yang cocok, pilih yang paling mendekati.
- Tulis deskripsi singkat (1-2 kalimat, maks 160 karakter), jelas dan tanpa kata berlebihan.
- Beri juga daftar tags (maksimal 8) yang relevan untuk SEO. Tag harus ringkas (1-3 kata), huruf kecil, gunakan '-' sebagai pemisah spasi, tidak mengandung simbol aneh.
- Kembalikan output dalam JSON murni dengan properti: name, categoryName, description, tags (array string).`;

    const categoriesStr = categoryOptions.length
      ? `Kategori tersedia: ${categoryOptions.join(', ')}`
      : 'Kategori tersedia: (tidak ada daftar eksplisit)';

    const imageStr = hintImageName ? `Nama file gambar: ${hintImageName}` : 'Nama file gambar: (tidak ada)';

    const user = `Data saat ini:\nNama: ${hintName || '-'}\nDeskripsi: ${hintDescription || '-'}\n${categoriesStr}\n${imageStr}`;

    const prompt = `${sys}\n\n${user}\n\nHanya jawab JSON valid.`;

    const result = await modelHandle.generateContent(prompt);
    const text = result.response.text();

    let parsed: AiResult | null = null;
    try {
      parsed = JSON.parse(text) as AiResult;
    } catch {
      // Coba ekstrak blok JSON jika ada teks tambahan
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]) as AiResult;
      }
    }

    if (!parsed || !parsed.name || !parsed.description) {
      return NextResponse.json({ error: 'Gagal mem-parsing hasil AI', raw: text }, { status: 502 });
    }

    // Normalisasi kategori ke salah satu opsi jika memungkinkan (server-side best-effort)
    if (parsed.categoryName && categoryOptions.length > 0) {
      const idx = categoryOptions.findIndex(
        (c) => c.toLowerCase().trim() === parsed!.categoryName.toLowerCase().trim()
      );
      if (idx === -1) {
        // pilih paling mirip berdasarkan prefix sederhana
        const lower = parsed.categoryName.toLowerCase();
        const found = categoryOptions.find((c) => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower));
        if (found) parsed.categoryName = found;
      }
    }

    // Validasi & normalisasi tags (server-side hardening)
    const normalizeTag = (raw: unknown): string => {
      const s = String(raw ?? '').toLowerCase().trim().replace(/\s+/g, '-');
      return s.slice(0, 20);
    };
    const validTags = Array.isArray(parsed.tags)
      ? Array.from(new Set(parsed.tags.map(normalizeTag).filter(t => !!t))).slice(0, 8)
      : [];

    // Server-side constraints: auto-truncate for UX/SEO consistency
    const NAME_MAX = 60;
    const DESC_MAX = 160;

    const safeName = truncate(parsed.name, NAME_MAX);
    const safeDesc = truncate(parsed.description, DESC_MAX);

    return new NextResponse(
      JSON.stringify({
        name: safeName,
        categoryName: truncate(parsed.categoryName || '', NAME_MAX),
        description: safeDesc,
        tags: validTags,
      } satisfies AiResult),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-AI-Model': chosenModel,
        },
      }
    );
  } catch (e) {
    console.error('[AI product-suggest] Error', e);
    return NextResponse.json({ error: 'Terjadi kesalahan pada layanan AI' }, { status: 500 });
  }
}
