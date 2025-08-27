"use server";

import { revalidateCatalog } from '@/lib/revalidate';

/**
 * Server Action: Revalidate cache katalog secara manual dari UI admin.
 * Menggunakan revalidateTag + revalidatePath langsung (tanpa expose secret ke client).
 */
export async function revalidateCatalogAction() {
  try {
    await revalidateCatalog();

    // Warmup pages to avoid cold-start latency on Vercel after revalidate
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const targets = [
      '/',
      '/catalog',
      '/catalog?page=2',
    ];

    // Note: Using sequential warmup to avoid overwhelming serverless
    for (const path of targets) {
      const url = new URL(path, siteUrl).toString();
      try {
        // Add a short timeout and a descriptive UA for observability
        console.log(`[warmup] fetching`, url);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'user-agent': 'abadi-jaya-warmup-bot/1.0 (+catalog-cache)'
          },
          signal: controller.signal,
        });
        clearTimeout(timer);
        console.log(`[warmup] status`, url, res.status);
      } catch (e) {
        console.error(`[warmup] failed`, path, e);
      }
    }

    return { ok: true } as const;
  } catch (err) {
    console.error('[revalidateCatalogAction] failed', err);
    return { ok: false, error: 'Gagal revalidate katalog' } as const;
  }
}
