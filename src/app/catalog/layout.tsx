import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Katalog Produk | Abadi Jaya',
  description: 'Jelajahi katalog produk las dan fabrikasi besi Abadi Jaya. Kualitas tinggi, harga transparan, layanan profesional.',
  alternates: { canonical: '/catalog' },
  openGraph: {
    title: 'Katalog Produk | Abadi Jaya',
    description: 'Jelajahi katalog produk las dan fabrikasi besi Abadi Jaya. Kualitas tinggi, harga transparan, layanan profesional.',
    type: 'website',
    url: '/catalog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Katalog Produk | Abadi Jaya',
    description: 'Jelajahi katalog produk las dan fabrikasi besi Abadi Jaya. Kualitas tinggi, harga transparan, layanan profesional.',
  }
};

export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
  // Ambil sebagian daftar produk untuk ItemList (maks 20 agar ringan)
  const { data } = await supabaseServer
    .from('products')
    .select('id,name')
    .eq('is_active', true)
    .order('id', { ascending: false })
    .limit(20);

  const items = (data || []).map((p, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    url: `/catalog/${p.id}-${slugify(p.name || String(p.id))}`,
    name: p.name,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
