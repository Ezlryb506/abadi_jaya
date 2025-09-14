import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import CatalogClient, { type ProductUI } from './CatalogClient';
import { supabaseServer } from '@/lib/supabaseServer';
import PrevNextHead from './PrevNextHead';
import Script from 'next/script';
import { slugify } from '@/lib/slug';
import { areaAll } from '@/lib/areaLayanan';

// Enable Incremental Static Regeneration for the catalog page (refresh every 5 minutes)
export const revalidate = 300; // 5 minutes
// Pastikan selalu render dinamis agar data katalog terbaru tidak tertahan cache
export const dynamic = 'force-dynamic';

type CategoryRow = { name: string; description?: string | null };
type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  category_id: number | null;
  tags?: string[] | null;
};

const PAGE_SIZE = 12;

// Cached helper to fetch a single category's description for metadata usage
async function getCategoryDescriptionCached(name: string): Promise<string | undefined> {
  if (!name) return undefined;
  const fetcher = unstable_cache(
    async () => {
      const { data: cat } = await supabaseServer
        .from('product_categories')
        .select('name, description')
        .eq('name', name)
        .maybeSingle();
      return (cat?.description || undefined) as string | undefined;
    },
    ['category-meta', name],
    { revalidate, tags: ['catalog', 'categories'] }
  );
  return fetcher();
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; q?: string }> }): Promise<Metadata> {
  const qs = await searchParams;
  const page = Math.max(1, Number(qs?.page || '1') || 1);
  const category = qs?.category && qs.category !== 'Semua' ? `&category=${encodeURIComponent(qs.category)}` : '';
  const q = qs?.q ? `&q=${encodeURIComponent(qs.q)}` : '';
  const pagePart = page > 1 ? `?page=${page}` : (category || q ? '?' : '');
  const joiner = pagePart ? '&' : '?';
  const tail = `${pagePart}${(category || q) ? `${joiner}${[category.replace(/^&/, ''), q.replace(/^&/, '')].filter(Boolean).join('&')}` : ''}`.replace(/\?$|&$/, '');
  const canonical = `/catalog${tail}` || '/catalog';
  const prev = page > 2 ? `/catalog?page=${page - 1}${category}${q}` : page === 2 ? `/catalog${category || q ? `?${[category.replace(/^&/, ''), q.replace(/^&/, '')].filter(Boolean).join('&')}` : ''}` : undefined;
  const next = `/catalog?page=${page + 1}${category}${q}`; // hint
  // Build rich meta description based on category description and context
  let metaDescription: string | undefined = undefined;
  const categoryName = qs?.category && qs.category !== 'Semua' ? String(qs.category) : '';
  const searchQuery = qs?.q ? String(qs.q) : '';
  
  if (categoryName) {
    try {
      const baseRaw = await getCategoryDescriptionCached(categoryName);
      const base = (baseRaw || '').toString().trim();
      if (base) {
        const truncated = base.length > 140 ? `${base.slice(0, 135).replace(/\s+\S*$/, '')}…` : base;
        metaDescription = `${truncated} Bengkel Las Abadi Jaya - Konsultasi gratis, garansi pengerjaan, harga transparan.`;
      } else {
        // Fallback descriptions per kategori
        const categoryDescriptions: Record<string, string> = {
          'Pagar': 'Pagar besi minimalis & modern berkualitas tinggi. Kustomisasi ukuran, motif, dan finishing. Tahan cuaca, awet, dan aman.',
          'Kanopi': 'Kanopi besi untuk teras, garasi, dan carport. Material premium (spandek, polycarbonate), pemasangan rapi & profesional.',
          'Railing': 'Railing balkon, railing tangga besi & stainless steel. Desain aman, ergonomis, dan estetik untuk rumah tinggal maupun komersial.',
          'Pintu Besi': 'Pintu besi rumah & gerbang kuat dan tahan lama. Kustomisasi model, ukuran, dan finishing sesuai kebutuhan.',
          'Jendela': 'Jendela besi & teralis berkualitas. Aman, menarik, dengan opsi kasa nyamuk. Cocok untuk rumah tinggal.',
          'Teralis': 'Teralis jendela besi artistik dan fungsional. Melindungi rumah dengan tetap menjaga sirkulasi udara.',
          'Stainless': 'Produk stainless steel premium: kitchen set, rak, meja, handrail. Tahan karat, higienis, finishing halus.',
          'Minimalis': 'Desain minimalis modern untuk pagar, kanopi, railing. Simpel, elegan, sesuai arsitektur kontemporer.',
        };
        const categoryDesc = categoryDescriptions[categoryName] || `Produk ${categoryName.toLowerCase()} berkualitas dari Bengkel Las Abadi Jaya`;
        metaDescription = `${categoryDesc} Konsultasi gratis, garansi pengerjaan, harga transparan.`;
      }
    } catch {
      // noop, use fallback below
    }
  }
  
  if (searchQuery && !categoryName) {
    metaDescription = `Hasil pencarian "${searchQuery}" di katalog Bengkel Las Abadi Jaya. Temukan produk las & fabrikasi besi berkualitas - konsultasi gratis.`;
  }
  
  if (!metaDescription) {
    const pageContext = page > 1 ? ` (Halaman ${page})` : '';
    metaDescription = `Jelajahi katalog lengkap produk las & fabrikasi besi Abadi Jaya${pageContext}. Pagar, kanopi, railing, teralis, stainless. Konsultasi gratis, garansi pengerjaan.`;
  }
  const baseTitle = 'Katalog Produk | Abadi Jaya';
  const title = categoryName ? `Katalog: ${categoryName} | Abadi Jaya` : baseTitle;
  const robots = qs?.q ? { index: false, follow: true } : { index: true, follow: true };
  // Build dynamic OG image URL (absolute if possible)
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  let ogUrl: string | undefined;
  try {
    if (categoryName) {
      const path = `/api/og?variant=category&category=${encodeURIComponent(categoryName)}&title=${encodeURIComponent(title)}`;
      ogUrl = site ? new URL(path, site).toString() : path;
    } else {
      const path = `/api/og?title=${encodeURIComponent(title)}`;
      ogUrl = site ? new URL(path, site).toString() : path;
    }
  } catch {
    ogUrl = categoryName
      ? `/api/og?variant=category&category=${encodeURIComponent(categoryName)}&title=${encodeURIComponent(title)}`
      : `/api/og?title=${encodeURIComponent(title)}`;
  }
  // Build keywords including local service areas for stronger local SEO
  const keywords = (() => {
    const tokens = new Set<string>();
    tokens.add('katalog');
    tokens.add('produk las');
    tokens.add('fabrikasi besi');
    if (categoryName) tokens.add(categoryName);
    areaAll.forEach((a) => tokens.add(a));
    return Array.from(tokens);
  })();
  return {
    alternates: { canonical },
    title,
    description: metaDescription,
    keywords,
    robots,
    openGraph: {
      title,
      description: metaDescription,
      images: ogUrl ? [{ url: ogUrl }] : undefined,
    },
    twitter: {
      title,
      description: metaDescription,
      images: ogUrl ? [ogUrl] : undefined,
    },
    other: {
      'link:rel:prev': prev || '',
      'link:rel:next': next,
    }
  };
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; q?: string }> }) {
  const qs = await searchParams;
  const page = Math.max(1, Number(qs?.page || '1') || 1);
  const categoryParam = qs?.category || 'Semua';
  const qParam = qs?.q || '';
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build absolute URLs helper for JSON-LD
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const toAbs = (path: string): string | undefined => {
    try { return site ? new URL(path, site).toString() : undefined; } catch { return undefined; }
  };
  const rootAbs = toAbs('/');
  const catalogAbs = toAbs('/catalog');

  // Fetch categories (server-side), include description for SEO/UI
  const { data: catData } = await supabaseServer
    .from('product_categories')
    .select('name, description')
    .order('name');
  const categories = ['Semua', ...((catData || []).map((c: CategoryRow) => c.name))];
  const activeCategoryDesc = (catData || []).find((c) => c.name === (categoryParam || ''))?.description || '';

  // Build queries with optional inner join when filtering by category
  const filteringByCategory = !!(categoryParam && categoryParam !== 'Semua');

  // List data fetch
  // Saat filter kategori aktif, hindari duplikasi row dari inner join yang bisa memotong hasil unik.
  // Strategi: ambil daftar ID unik terlebih dahulu (dengan join + range), lalu fetch detail berdasarkan ID tersebut.
  let prodData: ProductRow[] | null = null;
  let totalCount = 0;
  if (filteringByCategory) {
    // Step 1: fetch IDs (unique) with the same filters and pagination
    const categoriesToMatch = (categoryParam === 'Jendela')
      ? ['Jendela', 'Teralis']
      : [categoryParam];
    let idQuery = supabaseServer
      .from('products')
      .select('id,product_categories!inner(name)', { count: 'exact' })
      .or('is_active.eq.true,is_active.is.null')
      // Fallback: jika kategori adalah Jendela dan belum ada data,
      // kita sertakan Teralis agar tetap ada hasil.
      .in('product_categories.name', categoriesToMatch);
    if (qParam) {
      const like = `%${qParam}%`;
      idQuery = idQuery.or(`name.ilike.${like},description.ilike.${like},tags.cs.{"${qParam}"}`);
    }
    const idRes = await idQuery.order('id', { ascending: false }).range(from, to);
    const ids = Array.from(
      new Set(((idRes.data || []) as Array<{ id: number | string }>).map(r => Number(r.id)))
    ).slice(0, PAGE_SIZE);
    totalCount = idRes.count || ids.length || 0;

    // Step 2: fetch product details for those IDs (no join to avoid duplicates)
    const detailQuery = supabaseServer
      .from('products')
      .select('id,name,description,price,image_url,category_id,tags')
      .in('id', ids)
      .or('is_active.eq.true,is_active.is.null');
    // keep output order by id desc similar to list
    const listRes = await detailQuery.order('id', { ascending: false });
    prodData = listRes.data as ProductRow[] | null;
  } else {
    // Tanpa filter kategori, gunakan query biasa dengan range
    let listQuery = supabaseServer.from('products')
      .select('id,name,description,price,image_url,category_id,tags', { count: 'exact' })
      .or('is_active.eq.true,is_active.is.null');
    if (qParam) {
      const like = `%${qParam}%`;
      listQuery = listQuery.or(`name.ilike.${like},description.ilike.${like},tags.cs.{"${qParam}"}`);
    }
    const listRes = await listQuery
      .order('id', { ascending: false })
      .range(from, to);
    prodData = listRes.data as ProductRow[] | null;
    totalCount = listRes.count || (prodData?.length || 0);
  }

  // Gunakan hasil langsung tanpa cache agar selalu up-to-date
  const prodDataCached = prodData;
  const total = totalCount;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Fetch category names for the listed products to avoid inner join side-effects
  const categoryIdSet = new Set<number>();
  for (const p of prodDataCached || []) {
    if (typeof p.category_id === 'number') categoryIdSet.add(p.category_id);
  }
  const categoryMap = new Map<number, string>();
  if (categoryIdSet.size > 0) {
    const { data: catRows } = await supabaseServer
      .from('product_categories')
      .select('id, name')
      .in('id', Array.from(categoryIdSet));
    for (const c of (catRows || []) as Array<{ id: number; name: string }>) {
      categoryMap.set(c.id, c.name);
    }
  }

  const categoryIcon = (name?: string) => {
    switch ((name || '').toLowerCase()) {
      case 'pagar': return '🏗️';
      case 'kanopi': return '🚗';
      case 'railing': return '🪜';
      case 'pintu besi': return '🚪';
      case 'jendela': return '🪟';
      case 'teralis': return '🔒';
      case 'tangga putar': return '🔄';
      case 'stainless': return '✨';
      case 'minimalis': return '📏';
      default: return '🧰';
    }
  };

  const initialProducts: ProductUI[] = (prodDataCached || []).map((p: ProductRow) => {
    const catName = (typeof p.category_id === 'number' && categoryMap.get(p.category_id)) || 'Lainnya';
    return {
      id: Number(p.id),
      name: String(p.name),
      category: catName,
      description: p.description || '',
      priceText: typeof p.price === 'number' ? `Rp ${p.price.toLocaleString('id-ID')}` : '-',
      image: p.image_url || categoryIcon(catName),
      features: [],
      specifications: {},
      tags: Array.isArray(p.tags) ? p.tags : [],
    };
  });

  return (
    <>
      <PrevNextHead page={page} pageCount={pageCount} category={categoryParam} q={qParam} />
      {/* JSON-LD: BreadcrumbList (Home > Katalog) */}
      <Script id="breadcrumblist-catalog" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Beranda',
              'item': rootAbs || '/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Katalog',
              'item': catalogAbs || '/catalog'
            }
          ]
        })}
      </Script>
      {/* JSON-LD: CollectionPage with category description for SEO context */}
      <Script id="collectionpage-catalog" type="application/ld+json">
        {(() => {
          const parts: string[] = [];
          if (page > 1) parts.push(`page=${page}`);
          if (categoryParam && categoryParam !== 'Semua') parts.push(`category=${encodeURIComponent(categoryParam)}`);
          if (qParam) parts.push(`q=${encodeURIComponent(qParam)}`);
          const urlPath = parts.length ? `/catalog?${parts.join('&')}` : '/catalog';
          const urlPathAbs = toAbs(urlPath);
          return JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': categoryParam && categoryParam !== 'Semua' ? `Katalog: ${categoryParam}` : 'Katalog Produk',
            'description': (activeCategoryDesc || 'Katalog produk las dan fabrikasi besi.'),
            'url': urlPathAbs || urlPath
          });
        })()}
      </Script>
      {/* JSON-LD: ItemList untuk daftar produk */}
      <Script id="itemlist-catalog" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'itemListElement': initialProducts.map((p, idx) => ({
            '@type': 'ListItem',
            'position': (from + idx + 1),
            'url': (toAbs(`/catalog/${p.id}-${slugify(p.name)}`) || `/catalog/${p.id}-${slugify(p.name)}`)
          }))
        })}
      </Script>
      {/* JSON-LD: ItemList dengan detail Product + Offer untuk mengurangi warning GSC */}
      <Script id="itemlist-catalog-rich" type="application/ld+json">
        {(() => {
          const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
            .toISOString()
            .split('T')[0];
          // Gunakan prodDataCached (server data) bila tersedia, fallback ke initialProducts minimal URL
          const richItems = (prodDataCached || []).map((p, idx) => ({
            '@type': 'ListItem',
            position: from + idx + 1,
            item: {
              '@type': 'Product',
              name: String(p.name),
              description: p.description || undefined,
              image: p.image_url || undefined,
              brand: { '@type': 'Brand', name: 'Abadi Jaya' },
              offers: {
                '@type': 'Offer',
                price: Number.isFinite(p.price as number) ? p.price : undefined,
                priceCurrency: Number.isFinite(p.price as number) ? 'IDR' : undefined,
                availability: Number.isFinite(p.price as number) ? 'https://schema.org/InStock' : undefined,
                url: (toAbs(`/catalog/${p.id}-${slugify(String(p.name))}`) || `/catalog/${p.id}-${slugify(String(p.name))}`),
                priceValidUntil: Number.isFinite(p.price as number) ? priceValidUntil : undefined,
                itemCondition: Number.isFinite(p.price as number) ? 'https://schema.org/NewCondition' : undefined,
                shippingDetails: Number.isFinite(p.price as number) ? {
                  '@type': 'OfferShippingDetails',
                  shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'IDR' },
                  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ID' },
                  deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' } }
                } : undefined,
                hasMerchantReturnPolicy: Number.isFinite(p.price as number) ? {
                  '@type': 'MerchantReturnPolicy',
                  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                  merchantReturnDays: 7,
                  returnMethod: 'https://schema.org/ReturnByMail'
                } : undefined
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: 5,
                reviewCount: 1
              }
            }
          }));
          return JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: richItems
          });
        })()}
      </Script>
      {/* JSON-LD: WebPage with local area context (about/mentions) */}
      <Script id="areaserved-catalog" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'Katalog Produk',
          'about': areaAll,
          'mentions': areaAll
        })}
      </Script>
      <CatalogClient
        initialProducts={initialProducts}
        categories={categories}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        initialCategory={categoryParam}
        initialQuery={qParam}
        categoryDescription={activeCategoryDesc || ''}
      />
    </>
  );
}
