import type { Metadata } from 'next';
import ImageZoomLightbox from '@/components/ui/ImageZoomLightbox';
import Link from 'next/link';
import Script from 'next/script';
import ShareButtons from '@/components/ui/ShareButtons';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import ProductDetailActions from '@/components/sections/ProductDetailActions';
import { supabaseServer } from '@/lib/supabaseServer';
import { formatRupiah } from '@/lib/format';
import { areaAll } from '@/lib/areaLayanan';
import { slugify } from '@/lib/slug';

type RouteParams = { id?: string; slug?: string } & Record<string, string | undefined>;
type Props = { params: Promise<RouteParams>; searchParams?: Promise<{ page?: string; category?: string; q?: string }>; };
type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  product_categories: { name?: string } | { name?: string }[] | null;
  tags?: string[] | null;
};

async function getProduct(id: number) {
  const { data, error } = await supabaseServer
    .from('products')
    .select('id,name,description,price,image_url,tags,product_categories(name)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  const row = data as ProductRow;
  const pc = row.product_categories;
  const catName = Array.isArray(pc)
    ? (pc[0]?.name || 'Lainnya')
    : (pc?.name || 'Lainnya');
  return {
    id: Number(data.id),
    name: String(data.name),
    description: data.description || '',
    price: typeof data.price === 'number' ? data.price : null,
    image: data.image_url as string | null,
    category: catName as string,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

function parseIdSlug(params: RouteParams): { idNum: number | null; slug: string | null } {
  const rawId = params?.id;
  const rawSlug = params?.slug;
  if (rawId && rawSlug) {
    const idNum = Number(String(rawId).split('-')[0]);
    return { idNum: Number.isFinite(idNum) ? idNum : null, slug: String(rawSlug) };
  }
  const combined = rawId || (params && (params['id-slug'] || params['slug-id'] || params?.slug)) || undefined;
  if (combined) {
    const [a, ...rest] = String(combined).split('-');
    const idNum = Number(a);
    const slug = rest.length ? rest.join('-') : null;
    return { idNum: Number.isFinite(idNum) ? idNum : null, slug };
  }
  return { idNum: null, slug: null };
}

// Sanitize and truncate description for meta tags
function sanitizeMetaDesc(input?: string | null, maxLen = 180): string | undefined {
  if (!input) return undefined;
  try {
    // strip HTML tags
    const stripped = input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!stripped) return undefined;
    return stripped.length > maxLen ? stripped.slice(0, maxLen - 1).trimEnd() + '…' : stripped;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const awaited = await params;
  const { idNum, slug } = parseIdSlug(awaited);
  const safeId = Number.isFinite(idNum as number) ? String(idNum) : '';
  const safeSlug = slug || 'produk';
  const relativeUrl = `/catalog/${safeId ? `${safeId}-` : ''}${safeSlug}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  let canonicalAbs: string | undefined;
  try { canonicalAbs = site ? new URL(relativeUrl, site).toString() : undefined; } catch { canonicalAbs = undefined; }
  // Default OG/Twitter image fallback
  let ogImageAbs: string | undefined;
  try { ogImageAbs = site ? new URL('/apple-touch-icon.png', site).toString() : undefined; } catch { ogImageAbs = undefined; }
  let metaDesc: string | undefined;
  let metaName: string | undefined;
  let metaPrice: number | undefined;
  let metaCategory: string | undefined;
  let metaTagsLocal: string[] = [];

  // Try to use product image if valid and host matches Supabase; also derive meta description, price, and tags
  try {
    if (Number.isFinite(idNum as number) && (idNum as number) > 0) {
      const { data, error } = await supabaseServer
        .from('products')
        .select('image_url,name,description,price,tags,product_categories(name)')
        .eq('id', idNum as number)
        .single();
      type ProductMetaRow = { image_url: string | null; name: string | null; description: string | null; price: number | null; tags?: string[] | null; product_categories?: { name?: string } | { name?: string }[] | null };
      const row = (data || null) as ProductMetaRow | null;
      if (!error && row && row.image_url) {
        const imgUrl = String(row.image_url);
        const isHttp = /^https?:\/\//i.test(imgUrl);
        if (isHttp) {
          const supa = process.env.NEXT_PUBLIC_SUPABASE_URL;
          let supaHost: string | undefined;
          let imgHost: string | undefined;
          try { supaHost = supa ? new URL(supa).hostname : undefined; } catch { supaHost = undefined; }
          try { imgHost = new URL(imgUrl).hostname; } catch { imgHost = undefined; }
          if (supaHost && imgHost && supaHost === imgHost) {
            ogImageAbs = imgUrl;
          }
        }
      }
      metaDesc = sanitizeMetaDesc(row?.description ?? undefined) || undefined;
      metaName = typeof row?.name === 'string' ? (row?.name as string) : undefined;
      // capture price if numeric
      metaPrice = typeof row?.price === 'number' ? (row.price as number) : undefined;
      // derive category name (first if array)
      try {
        const pc = row?.product_categories as ProductRow['product_categories'] | undefined;
        metaCategory = Array.isArray(pc) ? (pc[0]?.name || undefined) : (pc?.name || undefined);
      } catch {}
      // collect tags locally to be merged into keywords
      if (Array.isArray(row?.tags)) {
        try {
          const tset = new Set<string>(row!.tags!.map(t => String(t).toLowerCase().trim()).filter(Boolean));
          metaTagsLocal = Array.from(tset);
        } catch {}
      }
    }
  } catch {
    // swallow errors and keep fallback
  }

  // Build keywords from product name + slug + brand hints
  let metaKeywords: string[] | undefined;
  try {
    const tokens = new Set<string>();
    if (metaName) metaName.split(/\s+/g).forEach(w => { const t = w.trim().toLowerCase(); if (t.length > 2) tokens.add(t); });
    if (safeSlug) safeSlug.split(/[-\s]+/g).forEach(w => { const t = w.trim().toLowerCase(); if (t.length > 2) tokens.add(t); });
    ['abadi', 'jaya', 'produk', 'katalog'].forEach(w => tokens.add(w));
    metaTagsLocal.forEach(t => { if (t && t.length > 1) tokens.add(t); });
    areaAll.forEach(a => tokens.add(a));
    metaKeywords = Array.from(tokens);
  } catch { metaKeywords = undefined; }

  const effectiveTitle = `${(metaName || safeSlug.replace(/-/g, ' '))} | Abadi Jaya`;
  // Build dynamic OG image URL (absolute if possible) using variant=product and enrich params
  let ogDynamicUrl: string | undefined;
  try {
    const params: string[] = [
      `variant=product`,
      `title=${encodeURIComponent(effectiveTitle)}`,
    ];
    if (metaCategory) params.push(`category=${encodeURIComponent(metaCategory)}`);
    if (typeof metaPrice === 'number') params.push(`price=${encodeURIComponent(formatRupiah(metaPrice))}`);
    params.push(`badge=${encodeURIComponent('Bisa Kustom')}`);
    const path = `/api/og?${params.join('&')}`;
    ogDynamicUrl = site ? new URL(path, site).toString() : path;
  } catch {
    const params: string[] = [
      `variant=product`,
      `title=${encodeURIComponent(effectiveTitle)}`,
    ];
    if (metaCategory) params.push(`category=${encodeURIComponent(metaCategory)}`);
    if (typeof metaPrice === 'number') params.push(`price=${encodeURIComponent(formatRupiah(metaPrice))}`);
    params.push(`badge=${encodeURIComponent('Bisa Kustom')}`);
    ogDynamicUrl = `/api/og?${params.join('&')}`;
  }
  return {
    title: effectiveTitle,
    description: metaDesc || 'Jelajahi katalog produk las dan fabrikasi besi Abadi Jaya. Kualitas tinggi, harga transparan, layanan profesional.',
    keywords: metaKeywords,
    alternates: { canonical: canonicalAbs || relativeUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: effectiveTitle,
      type: 'website',
      url: canonicalAbs || relativeUrl,
      images: (ogImageAbs ? [{ url: ogImageAbs }] : (ogDynamicUrl ? [{ url: ogDynamicUrl }] : undefined)),
      description: metaDesc,
    },
    other: (typeof metaPrice === 'number') ? {
      'product:price:amount': String(metaPrice),
      'product:price:currency': 'IDR',
    } : undefined,
    twitter: {
      card: 'summary_large_image',
      title: effectiveTitle,
      images: ogImageAbs ? [ogImageAbs] : (ogDynamicUrl ? [ogDynamicUrl] : undefined),
      description: metaDesc,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const awaited = await params;
  const qs = searchParams ? await searchParams : undefined;
  // Build back href preserving catalog filters and page
  const category = qs?.category && qs.category !== 'Semua' ? `&category=${encodeURIComponent(qs.category)}` : '';
  const q = qs?.q ? `&q=${encodeURIComponent(qs.q)}` : '';
  const pageNum = Math.max(1, Number(qs?.page || '1') || 1);
  const pagePart = pageNum > 1 ? `?page=${pageNum}` : (category || q ? '?' : '');
  const joiner = pagePart ? '&' : '?';
  const tail = `${pagePart}${(category || q) ? `${joiner}${[category.replace(/^&/, ''), q.replace(/^&/, '')].filter(Boolean).join('&')}` : ''}`.replace(/\?$|&$/, '');
  const backHref = `/catalog${tail}`;
  const { idNum, slug } = parseIdSlug(awaited);
  const product = await getProduct(Number(idNum));

  if (!product) {
    return notFound();
  }

  // Enforce canonical slug: if URL slug mismatch, redirect permanently to the correct one
  try {
    const expectedSlug = slugify(product.name || 'produk');
    const givenSlug = (slug || '').toString();
    // Redirect juga saat slug kosong agar URL selalu kanonik {id}-{slug}
    if (expectedSlug && expectedSlug !== givenSlug) {
      // Preserve query params if exist
      const category = qs?.category && qs.category !== 'Semua' ? `&category=${encodeURIComponent(qs.category)}` : '';
      const q = qs?.q ? `&q=${encodeURIComponent(qs.q)}` : '';
      const pageNum = Math.max(1, Number(qs?.page || '1') || 1);
      const pagePart = pageNum > 1 ? `?page=${pageNum}` : (category || q ? '?' : '');
      const joiner = pagePart ? '&' : '?';
      const tail = `${pagePart}${(category || q) ? `${joiner}${[category.replace(/^&/, ''), q.replace(/^&/, '')].filter(Boolean).join('&')}` : ''}`.replace(/\?$|&$/, '');
      redirect(`/catalog/${product.id}-${expectedSlug}${tail}`);
    }
  } catch { /* noop */ }

  const isHttpUrl = (u?: string | null) => !!u && /^https?:\/\//i.test(u);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: isHttpUrl(product.image) ? product.image : undefined,
    category: product.category,
    keywords: Array.isArray(product.tags) && product.tags.length ? product.tags.join(', ') : undefined,
    brand: {
      '@type': 'Organization',
      name: 'Abadi Jaya',
      areaServed: areaAll,
    },
    seller: {
      '@type': 'Organization',
      name: 'Abadi Jaya',
      areaServed: areaAll,
    },
    offers: product.price ? {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: product.price,
      availability: 'https://schema.org/InStock',
    } : undefined,
  };

  // Prepare unique tags for UI rendering
  const uniqueTags = Array.from(
    new Set(
      Array.isArray(product.tags)
        ? product.tags.map((t) => String(t || '').trim()).filter(Boolean)
        : []
    )
  );

  // BreadcrumbList JSON-LD
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const currentRelative = `/catalog/${Number.isFinite(idNum as number) && idNum !== null ? `${idNum}-` : ''}${slug || 'produk'}`;
  let currentAbs: string | undefined;
  try { currentAbs = site ? new URL(currentRelative, site).toString() : undefined; } catch { currentAbs = undefined; }
  let catalogAbs: string | undefined;
  try { catalogAbs = site ? new URL('/catalog', site).toString() : undefined; } catch { catalogAbs = undefined; }
  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: site || '/' },
      { '@type': 'ListItem', position: 2, name: 'Katalog', item: catalogAbs || '/catalog' },
      { '@type': 'ListItem', position: 3, name: product.name, item: currentAbs || currentRelative },
    ],
  };

  // Determine if Next/Image should use unoptimized based on host allowlist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let allowHost: string | undefined;
  try { allowHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined; } catch { allowHost = undefined; }
  let imgHost: string | undefined;
  try { imgHost = isHttpUrl(product.image) ? new URL(product.image!).hostname : undefined; } catch { imgHost = undefined; }
  const useUnoptimized = Boolean(isHttpUrl(product.image) && allowHost && imgHost && imgHost !== allowHost);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="ld-product" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
      <Script id="ld-breadcrumbs" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(breadcrumbsLd)}
      </Script>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            <Link href="/" className="hover:underline">Beranda</Link> <span>/</span> <Link href={backHref} className="hover:underline">Katalog</Link> <span>/</span> <span className="opacity-90">{product.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-orange-100 mt-2">Kategori: {product.category}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="space-y-8">
          {/* Image Block - no colored background */}
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            {product.image ? (
              <ImageZoomLightbox
                src={product.image}
                alt={product.name}
                sizes="(min-width: 1280px) 100vw, (min-width: 1024px) 100vw, 100vw"
                priority
                unoptimized={useUnoptimized}
                quality={95}
                containerClassName="w-full max-h-[75vh]"
                imageClassName="object-contain"
              />
            ) : (
              <div className="relative rounded-xl overflow-hidden aspect-[3/2] max-h-[75vh] flex items-center justify-center text-8xl">🧰</div>
            )}
          </div>

          {/* Detail Block */}
          <div>
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <div className="text-3xl font-bold text-orange-600 mb-3">
                {product.price ? formatRupiah(product.price) : 'Hubungi Kami'}
              </div>
              {/* Important Notices / Badges */}
              <div className="mb-5">
                <div className="flex flex-wrap gap-2" aria-label="Informasi penting">
                  <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 select-none">
                    <span aria-hidden>✔️</span>
                    <span>Bisa Kustom</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 select-none">
                    <span aria-hidden>💱</span>
                    <span>Harga Dapat Berubah</span>
                  </span>
                </div>
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-900 p-3 text-sm leading-relaxed" role="note">
                  Harga yang ditampilkan di katalog bersifat estimasi bisa lebih murah bisa juga lebih mahal dan tidak diperbarui harian karena fluktuasi bahan-bahan. <br></br>Kami akan mengonfirmasi estimasi terbaru setelah anda berkonsultasi atau sebelum produksi dimulai.
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{product.description || 'Deskripsi belum tersedia.'}</p>
              {uniqueTags.length > 0 && (
                <div className="mt-5" aria-label="Tag produk">
                  <div className="text-sm text-gray-500 mb-2">Tag:</div>
                  <ul className="flex flex-wrap gap-2" role="list">
                    {uniqueTags.map((tag) => (
                      <li key={tag} role="listitem">
                        <Link
                          href={`/catalog?q=${encodeURIComponent(tag)}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-sm hover:bg-orange-100 hover:border-orange-300 transition-colors"
                          prefetch={false}
                        >
                          <span className="text-orange-500">#</span>
                          <span>{tag}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6">
                <ProductDetailActions
                  name={product.name}
                  backHref={backHref}
                />
              </div>
              {/* Share buttons */}
              <ShareButtons
                url={currentAbs || currentRelative}
                title={product.name}
                className="mt-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
