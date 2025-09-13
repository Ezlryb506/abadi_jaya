import React from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/slug';
import Button from './Button';
import Card from './Card';
import ImageWithFallback from './ImageWithFallback';

// Mapping kategori ke gambar yang tersedia
function getCategoryImage(categoryName: string): string {
  const imageMap: Record<string, string> = {
    'Pagar': '/images/layanan/pagar besi - modern 1.jpg',
    'Kanopi': '/images/layanan/Modern Carport - Kanopi - 2.jpg',
    'Railing': '/images/layanan/Railing Tangga - Logam - 9.jpg',
    'Pintu Besi': '/images/layanan/Pintu Besi - Modern - 2.jpg',
    'Jendela': '/images/layanan/Jendela - Teralis - Pagar - Modern 6.jpg',
    'Teralis': '/images/layanan/Jendela - Teralis - Pagar - Modern 6.jpg',
    'Stainless': '/images/layanan/Stainless Steel - Railing Tangga - 2.jpg',
    'Pergola': '/images/layanan/Kanopi - Pargola - Taman - Modern - 5.jpg',
    'Railing Balkon': '/images/layanan/Railing Balkon - Modern - Minimalis 2.jpg',
    'Pintu Gerbang': '/images/layanan/Pintu Gerbang - Modern - Stainless 1.jpg',
    // Permintaan khusus user untuk halaman layanan/[area]
    // Meja / Rak
    'Meja / Rak': '/images/layanan/kitchen Set - Rak - Stainless - 2.jpg',
    // Pintu / Gerbang
    'Pintu / Gerbang': '/images/layanan/Pintu Gerbang - Modern - Stainless 1.jpg',
    // Tangga Putar
    'Tangga Putar': '/images/layanan/Tangga Putar - Modern - Minimalis 4.jpeg',
    // Alias yang sebelumnya ada tetap dipertahankan
    'Kitchen Set': '/images/layanan/kitchen Set - Rak - Stainless - 2.jpg',
    'Rak Stainless': '/images/layanan/Rak Stainless 1.jpg',
    'Handrail': '/images/layanan/Handrail Tembok Tangga 2.jpg',
  };
  
  return imageMap[categoryName] || '/images/layanan/pagar besi - modern 1.jpg';
}

interface CategoryCardProps {
  category: {
    name: string;
    description?: string;
  };
  areaCount?: number;
  className?: string;
  href?: string;
}

export default function CategoryCard({ 
  category, 
  areaCount = 0,
  className = '',
  href
}: CategoryCardProps) {
  const cardContent = (
    <Card className={`group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 flex flex-col ${className}`}>
      {/* Media - Fixed Height */}
      <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 ring-1 ring-gray-100">
        <ImageWithFallback
          src={getCategoryImage(category.name)}
          alt={category.name}
          fill
          sizes="(max-width: 639px) 330px, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          quality={60}
          containerClassName="absolute inset-0"
        />
      </div>
      
      {/* Content - Fixed Height Container */}
      <div className="flex flex-col flex-1 min-h-[180px]">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
          {category.name}
        </h3>
        
        {/* Description - Flexible Height */}
        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
          {category.description || `Layanan ${category.name.toLowerCase()} berkualitas tinggi`}
        </p>
        
        {/* Action Button - Fixed Height */}
        <div className="mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          {href ? (
            <Button variant="primary" size="sm" className="w-full">
              Lihat Layanan
            </Button>
          ) : (
            <Link href={`/kategori/${slugify(category.name)}`}>
              <Button variant="primary" size="sm" className="w-full">
                Lihat Katalog
              </Button>
            </Link>
          )}
        </div>
        
        {/* Area Count - Fixed Height */}
        <div className="text-xs text-gray-500 mt-2 text-center min-h-[1rem]">
          {areaCount > 0 ? `Tersedia di ${areaCount} area` : 'Tersedia di berbagai area'}
        </div>
      </div>
    </Card>
  );

  // Jika ada href, wrap dengan Link, jika tidak return card biasa
  if (href) {
    return (
      <Link href={href} className="group">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
