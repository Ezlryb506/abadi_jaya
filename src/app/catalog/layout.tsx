import type { Metadata } from 'next';

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

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  // Hilangkan fetching di layout agar navigasi cepat; JSON-LD ItemList disediakan di page.tsx
  return <>{children}</>;
}
