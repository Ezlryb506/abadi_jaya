import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { slugify } from '@/lib/slug';

interface ProductLite {
  id: number;
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  tags?: string[];
  category?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const kategori = String(req.query.kategori || '').trim();
  if (!kategori) return res.status(400).json([]);

  // 1. Ambil ID kategori
  const { data: categoryData } = await supabaseServer
    .from('product_categories')
    .select('id')
    .eq('name', kategori)
    .single();

  // 2. Query berdasarkan kategori
  let byCategory: ProductLite[] = [];
  if (categoryData?.id) {
    const { data } = await supabaseServer
      .from('products')
      .select('id,name,description,price,image_url,tags')
      .eq('category_id', categoryData.id)
      .or('is_active.eq.true,is_active.is.null')
      .order('id', { ascending: false })
      .limit(12);
    byCategory = Array.isArray(data) ? (data as ProductLite[]) : [];
  }

  // 3. Query tambahan: nama produk mengandung kata kategori
  const base = kategori;
  const slugWords = slugify(base).replace(/-/g, ' ');
  const tokens = Array.from(new Set([base, slugWords].flatMap(s => s.split(/\s+/g)).map(s => s.trim()).filter(s => s.length >= 3)));
  let byName: ProductLite[] = [];
  if (tokens.length) {
    const orExpr = tokens.map(t => `name.ilike.%${t}%`).join(',');
    const { data } = await supabaseServer
      .from('products')
      .select('id,name,description,price,image_url,tags')
      .or(orExpr)
      .or('is_active.eq.true,is_active.is.null')
      .order('id', { ascending: false })
      .limit(12);
    byName = Array.isArray(data) ? (data as ProductLite[]) : [];
  }

  // 4. Gabungkan unik berdasarkan id
  const seen = new Set<number>();
  const merged: ProductLite[] = [];
  for (const row of byCategory) {
    const idNum = Number(row?.id);
    if (!Number.isFinite(idNum) || seen.has(idNum)) continue;
    seen.add(idNum);
    merged.push(row);
  }
  for (const row of byName) {
    const idNum = Number(row?.id);
    if (!Number.isFinite(idNum) || seen.has(idNum)) continue;
    seen.add(idNum);
    merged.push(row);
  }

  // 5. Batasi 8 produk
  res.status(200).json(merged.slice(0, 8));
}
