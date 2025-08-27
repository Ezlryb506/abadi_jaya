import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import CatalogClient, { type ProductUI } from './CatalogClient';
import { supabaseServer } from '@/lib/supabaseServer';
import PrevNextHead from './PrevNextHead';
import Script from 'next/script';
import { slugify } from '@/lib/slug';

// Enable Incremental Static Regeneration for the catalog page
export const revalidate = 86400; // 1 day

type CategoryRow = { name: string; description?: string | null };
type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  product_categories: { name?: string } | { name?: string }[] | null;
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
  // Build meta description based on category description (if any)
  let metaDescription: string | undefined = undefined;
  const categoryName = qs?.category && qs.category !== 'Semua' ? String(qs.category) : '';
  if (categoryName) {
    try {
      const baseRaw = await getCategoryDescriptionCached(categoryName);
      const base = (baseRaw || '').toString().trim();
      if (base) {
        const truncated = base.length > 165 ? `${base.slice(0, 160).replace(/\s+\S*$/, '')}…` : base;
        metaDescription = truncated;
      }
    } catch {
      // noop, fallback below
    }
  }
  if (!metaDescription) {
    metaDescription = 'Jelajahi katalog produk las dan fabrikasi besi: pagar, kanopi, railing, teralis, dan lainnya. Pilih kategori untuk menemukan produk yang Anda butuhkan.';
  }
  return {
    alternates: { canonical },
    title: categoryName ? `Katalog: ${categoryName} | Abadi Jaya` : undefined,
    description: metaDescription,
    openGraph: {
      description: metaDescription,
    },
    twitter: {
      description: metaDescription,
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
    let idQuery = supabaseServer
      .from('products')
      .select('id,product_categories!inner(name)', { count: 'exact' })
      .eq('is_active', true)
      .eq('product_categories.name', categoryParam);
    if (qParam) {
      const like = `%${qParam}%`;
      idQuery = idQuery.or(`name.ilike.${like},description.ilike.${like}`);
    }
    const idRes = await idQuery.order('id', { ascending: false }).range(from, to);
    const ids = Array.from(
      new Set(((idRes.data || []) as Array<{ id: number | string }>).map(r => Number(r.id)))
    ).slice(0, PAGE_SIZE);
    totalCount = idRes.count || ids.length || 0;

    // Step 2: fetch product details for those IDs (no join to avoid duplicates)
    const detailQuery = supabaseServer
      .from('products')
      .select('id,name,description,price,image_url,product_categories(name)')
      .in('id', ids)
      .eq('is_active', true);
    // keep output order by id desc similar to list
    const listRes = await detailQuery.order('id', { ascending: false });
    prodData = listRes.data as ProductRow[] | null;
  } else {
    // Tanpa filter kategori, gunakan query biasa dengan range
    let listQuery = supabaseServer.from('products')
      .select('id,name,description,price,image_url,product_categories(name)', { count: 'exact' })
      .eq('is_active', true);
    if (qParam) {
      const like = `%${qParam}%`;
      listQuery = listQuery.or(`name.ilike.${like},description.ilike.${like}`);
    }
    const listRes = await listQuery
      .order('id', { ascending: false })
      .range(from, to);
    prodData = listRes.data as ProductRow[] | null;
    totalCount = listRes.count || (prodData?.length || 0);
  }

  // Cache wrapper ringan untuk menyatukan hasil (menghindari extra roundtrip)
  const fetchCatalogCached = unstable_cache(async () => ({ prodData, total: totalCount }), ['catalog', String(page), categoryParam || 'Semua', qParam || ''], { revalidate, tags: ['catalog'] });
  const { prodData: prodDataCached, total } = await fetchCatalogCached();
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const categoryIcon = (name?: string) => {
    switch ((name || '').toLowerCase()) {
      case 'pagar': return '🏗️';
      case 'kanopi': return '🚗';
      case 'railing tangga': return '🪜';
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
    const catName = Array.isArray(p.product_categories)
      ? (p.product_categories[0]?.name || 'Lainnya')
      : (p.product_categories?.name || 'Lainnya');
    return {
      id: Number(p.id),
      name: String(p.name),
      category: catName,
      description: p.description || '',
      priceText: typeof p.price === 'number' ? `Rp ${p.price.toLocaleString('id-ID')}` : '-',
      image: p.image_url || categoryIcon(catName),
      features: [],
      specifications: {},
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
              'item': '/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Katalog',
              'item': '/catalog'
            }
          ]
        })}
      </Script>
      {/* JSON-LD: CollectionPage with category description for SEO context */}
      <Script id="collectionpage-catalog" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': categoryParam && categoryParam !== 'Semua' ? `Katalog: ${categoryParam}` : 'Katalog Produk',
          'description': (activeCategoryDesc || 'Katalog produk las dan fabrikasi besi.'),
          'url': `/catalog${qParam || page > 1 || (categoryParam && categoryParam !== 'Semua') ? '' : ''}`
        })}
      </Script>
      {/* JSON-LD: ItemList untuk daftar produk */}
      <Script id="itemlist-catalog" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'itemListElement': initialProducts.map((p, idx) => ({
            '@type': 'ListItem',
            'position': (from + idx + 1),
            'url': `/catalog/${p.id}-${slugify(p.name)}`
          }))
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
