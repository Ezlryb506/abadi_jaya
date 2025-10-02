'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Image from 'next/image';

interface ProductLite {
  id: number;
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  tags?: string[];
  category?: string;
}

interface ContohProyekBlogProps {
  kategori: string;
  area?: string;
}

export default function ContohProyekBlog({ kategori, area = 'Bekasi' }: ContohProyekBlogProps) {
  const [produk, setProduk] = useState<ProductLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduk() {
      setLoading(true);
      try {
        const res = await fetch(`/api/blog-produk?kategori=${encodeURIComponent(kategori)}&area=${encodeURIComponent(area)}`);
        const data = await res.json();
        setProduk(Array.isArray(data) ? data : []);
      } catch {
        setProduk([]);
      }
      setLoading(false);
    }
    fetchProduk();
  }, [kategori, area]);

  // JSON-LD Product snippet
  const productJsonLd = produk.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.image_url,
    offers: {
      '@type': 'Offer',
      price: p.price ?? undefined,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    },
    category: kategori,
    brand: {
      '@type': 'Brand',
      name: 'Abadi Jaya',
    },
    areaServed: area,
  }));

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Contoh Proyek {kategori} di {area}
      </h3>
      {loading ? (
        <div className="text-gray-500">Memuat produk...</div>
      ) : produk.length === 0 ? (
        <div className="text-gray-500">Belum ada produk {kategori} untuk area {area}.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {produk.map((p, idx) => (
            <Card key={p.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    width={400}
                    height={192}
                    className="object-cover w-full h-full"
                    priority={idx < 2}
                  />
                ) : (
                  <span className="text-4xl">🏗️</span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{p.name}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{p.description}</p>
                {p.price && (
                  <p className="text-orange-600 font-semibold">Rp {p.price.toLocaleString('id-ID')}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Product JSON-LD for SEO */}
      {produk.map((p, idx) => (
        <script key={p.id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd[idx]) }} />
      ))}
    </div>
  );
}
