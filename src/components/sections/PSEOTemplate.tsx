import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { formatRupiah } from '@/lib/format';
import { slugify } from '@/lib/slug';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface PSEOTemplateProps {
  // Hero Section
  title: string;
  description: string;
  breadcrumbs: Array<{ name: string; href: string }>;
  
  // Content
  children?: React.ReactNode;
  
  // JSON-LD
  jsonLd?: Record<string, unknown>;
  breadcrumbJsonLd?: Record<string, unknown>;
  
  // CTA Section
  ctaTitle: string;
  ctaDescription: string;
  ctaButtons?: Array<{ text: string; href?: string; variant?: 'primary' | 'secondary' | 'outline' }>;
  
  // Optional sections
  showAreaServices?: boolean;
  showProducts?: boolean;
  showCategories?: boolean;
  showFAQ?: boolean;
  
  // Data
  areas?: string[];
  categories?: Array<{ name: string; description?: string }>;
  products?: Array<{
    id: number;
    name: string;
    description?: string;
    price?: number;
    image_url?: string;
    tags?: string[];
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  
  // Current context
  currentArea?: string;
  currentCategory?: string;
  currentService?: string;
}

export default function PSEOTemplate({
  title,
  description,
  breadcrumbs,
  children,
  jsonLd,
  breadcrumbJsonLd,
  ctaTitle,
  ctaDescription,
  ctaButtons = [
    { text: '📞 Hubungi Sekarang', variant: 'secondary' as const },
    { text: '💬 Konsultasi Gratis', variant: 'outline' as const }
  ],
  showAreaServices = false,
  showProducts = false,
  showCategories = false,
  showFAQ = false,
  areas = [],
  categories = [],
  products = [],
  faqs = [],
  currentArea,
  currentCategory,
  currentService
}: PSEOTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* JSON-LD Scripts */}
      {jsonLd && (
        <Script id="main-json-ld" type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </Script>
      )}
      {breadcrumbJsonLd && (
        <Script id="breadcrumb-json-ld" type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </Script>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span> / </span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="opacity-90">{crumb.name}</span>
                ) : (
                  <Link href={crumb.href} className="hover:underline">
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <p className="text-orange-100 text-lg max-w-3xl">{description}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Custom Content */}
        {children}

        {/* Area Services Section */}
        {showAreaServices && areas.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentArea ? `Layanan Lainnya di ${currentArea}` : 'Area Layanan Kami'}
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {areas.slice(0, 8).map((area) => (
                <Link
                  key={area}
                  href={currentService ? `/layanan/${slugify(area)}/${slugify(currentService)}` : `/layanan/${slugify(area)}`}
                  className="group"
                >
                  <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <h3 className="font-semibold group-hover:text-orange-600 transition-colors">
                      {area}
                    </h3>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        {showCategories && categories.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentArea ? `Kategori Layanan di ${currentArea}` : 'Kategori Layanan'}
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={currentArea ? `/layanan/${slugify(currentArea)}/${slugify(category.name)}` : `/kategori/${slugify(category.name)}`}
                  className="group"
                >
                  <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="text-3xl mb-3">🧰</div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description || `Jasa ${category.name.toLowerCase()}`}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {showProducts && products.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentArea && currentCategory ? `${currentCategory} di ${currentArea}` : 'Produk Unggulan'}
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-6xl">🧰</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description || 'Deskripsi belum tersedia'}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-orange-600 font-bold">
                        {product.price ? formatRupiah(product.price) : 'Hubungi Kami'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/catalog/${product.id}-${slugify(product.name)}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          Lihat Detail
                        </Button>
                      </Link>
                      <Button size="sm" variant="primary">
                        💬 Konsultasi
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {showFAQ && faqs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pertanyaan Umum
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{ctaTitle}</h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">{ctaDescription}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtons.map((button, index) => (
              button.href ? (
                <Link key={index} href={button.href}>
                  <Button 
                    variant={button.variant || 'secondary'} 
                    size="lg" 
                    className={button.variant === 'secondary' ? 'bg-white text-orange-600 hover:bg-orange-50' : 'border-white text-white hover:bg-white hover:text-orange-600'}
                  >
                    {button.text}
                  </Button>
                </Link>
              ) : (
                <Button 
                  key={index}
                  variant={button.variant || 'secondary'} 
                  size="lg" 
                  className={button.variant === 'secondary' ? 'bg-white text-orange-600 hover:bg-orange-50' : 'border-white text-white hover:bg-white hover:text-orange-600'}
                >
                  {button.text}
                </Button>
              )
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
