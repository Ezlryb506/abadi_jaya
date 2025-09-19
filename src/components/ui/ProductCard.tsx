import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatRupiah } from '@/lib/format';
import { slugify } from '@/lib/slug';
import Button from './Button';
import Card from './Card';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description?: string;
    price?: number;
    image_url?: string;
    tags?: string[];
  };
  showConsultation?: boolean;
  className?: string;
  context?: {
    area?: string;
    service?: string;
    category?: string;
  };
}

export default function ProductCard({ 
  product, 
  showConsultation = true, 
  className = '',
  context
}: ProductCardProps) {
  // Build WA link for consultation with contextual message
  const waHref = (() => {
    const parts: string[] = [];
    if (context?.service) parts.push(`jasa ${context.service}`);
    if (context?.category) parts.push(`kategori ${context.category}`);
    if (context?.area) parts.push(`di ${context.area}`);
    const ctx = parts.length ? ` (${parts.join(' ')})` : '';
    const msg = `Halo, saya tertarik konsultasi untuk produk ${product.name}${ctx}. Mohon info rekomendasi desain & estimasi harga.`;
    return `https://wa.me/6289653754317?text=${encodeURIComponent(msg)}`;
  })();
  const detailHref = (() => {
    const baseSlug = `${product.id}-${slugify(product.name)}`;
    if (context?.area) {
      return `/produk/${slugify(context.area)}/${baseSlug}`;
    }
    return `/catalog/${baseSlug}`;
  })();
  return (
    <Card className={`flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      {/* Image Section - Consistent aspect ratio and no cropping (object-contain) */}
      <div className="relative m-2 rounded-lg overflow-hidden aspect-[4/3] sm:aspect-video bg-white sm:bg-gradient-to-br sm:from-orange-50 sm:to-orange-100 flex items-center justify-center">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 33vw"
            className="object-contain"
            loading="lazy"
            fetchPriority="auto"
            quality={60}
          />
        ) : (
          <div className="text-6xl">🧰</div>
        )}
      </div>
      {/* Content Section - Flexible Height */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[54px]">
          {product.name}
        </h3>
        {/* Description - Tidak terpotong */}
        <p className="text-gray-600 text-sm mb-3">
          {product.description || 'Deskripsi belum tersedia'}
        </p>
        {/* Price & Action Buttons wrapper */}
        <div className="mt-auto">
        {/* Price */}
        <div className="mb-2">
          <span className="text-orange-600 font-bold">
            {product.price ? formatRupiah(product.price) : 'Hubungi Kami'}
          </span>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto flex-wrap items-center">
          <Link href={detailHref} className="flex-1">
            <Button size="sm" variant="outline" className="w-full shadow-md">
              🧾 Detail
            </Button>
          </Link>
          {showConsultation && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" variant="primary" className="w-full shadow-md">
                💬 Chat WA
              </Button>
            </a>
          )}
        </div>
      </div>
      </div>
    </Card>
  );
}
