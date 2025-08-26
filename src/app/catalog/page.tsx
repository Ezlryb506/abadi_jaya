import type { Metadata } from 'next';
import CatalogClient, { type ProductUI } from './CatalogClient';
import { supabaseServer } from '@/lib/supabaseServer';
import PrevNextHead from './PrevNextHead';

type CategoryRow = { name: string };
type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  product_categories: { name?: string } | { name?: string }[] | null;
};

const PAGE_SIZE = 12;

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
  return {
    alternates: { canonical },
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

  // Fetch categories (server-side)
  const { data: catData } = await supabaseServer
    .from('product_categories')
    .select('name')
    .order('name');
  const categories = ['Semua', ...((catData || []).map((c: CategoryRow) => c.name))];

  // Build queries with optional inner join when filtering by category
  const filteringByCategory = !!(categoryParam && categoryParam !== 'Semua');

  // List query
  let listQuery = supabaseServer.from('products')
    .select(
      filteringByCategory
        ? 'id,name,description,price,image_url,product_categories!inner(name)'
        : 'id,name,description,price,image_url,product_categories(name)'
      , { count: 'exact' }
    )
    .eq('is_active', true);

  if (filteringByCategory) {
    listQuery = listQuery.eq('product_categories.name', categoryParam);
  }
  if (qParam) {
    const like = `%${qParam}%`;
    listQuery = listQuery.or(`name.ilike.${like},description.ilike.${like}`);
  }

  const { data: prodData } = await listQuery
    .order('id', { ascending: false })
    .range(from, to);

  // Count query
  let countQuery = supabaseServer.from('products')
    .select(
      filteringByCategory
        ? 'id,product_categories!inner(name)'
        : 'id,product_categories(name)'
      , { count: 'exact', head: true }
    )
    .eq('is_active', true);

  if (filteringByCategory) {
    countQuery = countQuery.eq('product_categories.name', categoryParam);
  }
  if (qParam) {
    const like = `%${qParam}%`;
    countQuery = countQuery.or(`name.ilike.${like},description.ilike.${like}`);
  }
  const countRes = await countQuery;
  const total = countRes.count || (prodData?.length || 0);
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

  const initialProducts: ProductUI[] = (prodData || []).map((p: ProductRow) => {
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
      <CatalogClient
        initialProducts={initialProducts}
        categories={categories}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        initialCategory={categoryParam}
        initialQuery={qParam}
      />
    </>
  );
}
