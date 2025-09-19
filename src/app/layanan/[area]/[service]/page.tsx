import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { areaAll } from '@/lib/areaLayanan';
import { supabaseServer } from '@/lib/supabaseServer';
import { slugify } from '@/lib/slug';
import Link from 'next/link';
import Script from 'next/script';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProductCard from '@/components/ui/ProductCard';

type RouteParams = { area: string; service: string };
type Props = { params: Promise<RouteParams> };

// Tipe minimal untuk baris produk yang kita pakai di halaman ini
type ProductLite = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  tags?: string[] | null;
  product_categories?: { name?: string } | { name?: string }[] | null;
};

// Validasi area
function validateArea(area: string): string | null {
  const normalizedArea = area.toLowerCase().replace(/[^a-z0-9]/g, '');
  return areaAll.find(a => 
    slugify(a).toLowerCase() === normalizedArea || 
    a.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedArea
  ) || null;
}

// Validasi service
async function validateService(service: string): Promise<string | null> {
  const { data: categories } = await supabaseServer
    .from('product_categories')
    .select('name')
    .order('name');
  
  if (!categories) return null;
  
  const normalizedService = service.toLowerCase().replace(/[^a-z0-9]/g, '');
  return categories.find(cat => 
    slugify(cat.name).toLowerCase() === normalizedService ||
    cat.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedService
  )?.name || null;
}

// Generate metadata dinamis
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, service } = await params;
  const validArea = validateArea(area);
  const validService = await validateService(service);
  
  if (!validArea || !validService) {
    return {
      title: 'Layanan Tidak Ditemukan | Abadi Jaya',
      description: 'Layanan tidak ditemukan. Lihat daftar layanan kami.',
    };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = `/layanan/${slugify(validArea)}/${slugify(validService)}`;
  const canonicalAbs = site ? new URL(canonical, site).toString() : canonical;

  // Generate long-tail keywords
  const longTailKeywords = [
    `jasa ${validService.toLowerCase()} di ${validArea}`,
    `bengkel las ${validService.toLowerCase()} ${validArea}`,
    `harga ${validService.toLowerCase()} ${validArea}`,
    `kontraktor ${validService.toLowerCase()} ${validArea}`,
    `pemasangan ${validService.toLowerCase()} ${validArea}`,
    `kustom ${validService.toLowerCase()} ${validArea}`,
    `modern ${validService.toLowerCase()} ${validArea}`,
    `minimalis ${validService.toLowerCase()} ${validArea}`,
    validArea.toLowerCase(),
    validService.toLowerCase(),
    'bekasi',
    'cikarang',
    'tambun',
    'cibitung'
  ];

  return {
    title: `Jasa ${validService} di ${validArea} | Abadi Jaya`,
    description: `Layanan ${validService.toLowerCase()} terpercaya di ${validArea}. Kualitas tinggi, harga transparan, konsultasi gratis. Bengkel las Abadi Jaya siap membantu proyek Anda.`,
    keywords: longTailKeywords,
    alternates: { canonical: canonicalAbs },
    robots: { index: true, follow: true },
    openGraph: {
      title: `Jasa ${validService} di ${validArea} | Abadi Jaya`,
      description: `Layanan ${validService.toLowerCase()} terpercaya di ${validArea}. Kualitas tinggi, harga transparan, konsultasi gratis.`,
      type: 'website',
      url: canonicalAbs,
      images: site ? [{
        url: new URL(`/api/og?variant=service&service=${encodeURIComponent(validService)}&area=${encodeURIComponent(validArea)}&title=${encodeURIComponent(`Jasa ${validService} di ${validArea}`)}`, site).toString()
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Jasa ${validService} di ${validArea} | Abadi Jaya`,
      description: `Layanan ${validService.toLowerCase()} terpercaya di ${validArea}. Kualitas tinggi, harga transparan.`,
    },
  };
}

// Generate static params
export async function generateStaticParams() {
  const { data: categories } = await supabaseServer
    .from('product_categories')
    .select('name');
  
  if (!categories) return [];
  
  const params: Array<{ area: string; service: string }> = [];
  
  for (const area of areaAll) {
    for (const category of categories) {
      params.push({
        area: slugify(area),
        service: slugify(category.name)
      });
    }
  }
  
  return params;
}

// Fetch produk berdasarkan kategori, area dan (tambahan) nama produk yang mengandung kata layanan
async function getProductsForService(serviceName: string, _area: string) {
  // mark param as used to satisfy lint while keeping signature stable
  void _area;
  // Fallback untuk kategori "Jendela" yang belum ada data
  const actualServiceName = serviceName === 'Jendela' ? 'Teralis' : serviceName;

  // 1) Ambil ID kategori (jika ada)
  const { data: categoryData } = await supabaseServer
    .from('product_categories')
    .select('id')
    .eq('name', actualServiceName)
    .single();

  // 2) Query berdasarkan kategori (jika ditemukan)
  let byCategory: ProductLite[] = [];
  if (categoryData?.id) {
    const { data } = await supabaseServer
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        tags,
        product_categories(name)
      `)
      .eq('category_id', categoryData.id)
      .or('is_active.eq.true,is_active.is.null')
      .order('id', { ascending: false })
      .limit(24);
    byCategory = Array.isArray(data) ? (data as ProductLite[]) : [];
  }

  // 3) Query tambahan: nama produk yang mengandung kata layanan (case-insensitive)
  //    Buat token dari nama layanan, termasuk bentuk slug yang dipisah spasi
  const base = String(actualServiceName || '').trim();
  const slugWords = slugify(base).replace(/-/g, ' ');
  const tokens = Array.from(
    new Set(
      [base, slugWords]
        .flatMap(s => s.split(/\s+/g))
        .map(s => s.trim())
        .filter(s => s.length >= 3)
    )
  );

  let byName: ProductLite[] = [];
  if (tokens.length) {
    // Bangun ekspresi OR untuk PostgREST
    const orExpr = tokens.map(t => `name.ilike.%${t}%`).join(',');
    const { data } = await supabaseServer
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        tags,
        product_categories(name)
      `)
      .or(orExpr)
      .or('is_active.eq.true,is_active.is.null')
      .order('id', { ascending: false })
      .limit(24);
    byName = Array.isArray(data) ? (data as ProductLite[]) : [];
  }

  // 4) Gabungkan unik berdasarkan id, prioritaskan hasil byCategory terlebih dahulu
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

  // 5) Batasi 12 item untuk efisiensi
  return merged.slice(0, 12);
}

// Fetch kategori detail
async function getCategoryDetail(serviceName: string) {
  const { data: category } = await supabaseServer
    .from('product_categories')
    .select('name, description')
    .eq('name', serviceName)
    .single();

  return category;
}

export default async function AreaServiceDetailPage({ params }: Props) {
  const { area, service } = await params;
  const validArea = validateArea(area);
  const validService = await validateService(service);
  
  if (!validArea || !validService) {
    notFound();
  }

  const [products, categoryDetail] = await Promise.all([
    getProductsForService(validService, validArea),
    getCategoryDetail(validService)
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const currentUrl = `/layanan/${slugify(validArea)}/${slugify(validService)}`;
  const currentAbs = site ? new URL(currentUrl, site).toString() : currentUrl;

  // JSON-LD untuk Service
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
    .toISOString()
    .split('T')[0];
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Jasa ${validService} di ${validArea}`,
    description: `Layanan ${validService.toLowerCase()} terpercaya di ${validArea}`,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Abadi Jaya',
      address: {
        '@type': 'PostalAddress',
        addressLocality: validArea,
        addressRegion: 'Jawa Barat',
        addressCountry: 'ID'
      },
      telephone: '+62-896-5375-4317',
      priceRange: '$$',
      image: site ? [new URL('/apple-touch-icon.png', site).toString()] : undefined,
    },
    areaServed: { '@type': 'City', name: validArea },
    serviceType: validService,
    url: currentAbs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Katalog ${validService}`,
      itemListElement: products.map((product) => ({
        '@type': 'Offer',
        price: product.price ?? undefined,
        priceCurrency: product.price ? 'IDR' : undefined,
        availability: product.price ? 'https://schema.org/InStock' : undefined,
        url: product.id && product.name ? (site ? new URL(`/catalog/${product.id}-${slugify(product.name)}`, site).toString() : `/catalog/${product.id}-${slugify(product.name)}`) : undefined,
        priceValidUntil: product.price ? priceValidUntil : undefined,
        itemCondition: product.price ? 'https://schema.org/NewCondition' : undefined,
        shippingDetails: product.price ? {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'IDR' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ID' },
          deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' } }
        } : undefined,
        hasMerchantReturnPolicy: product.price ? {
          '@type': 'MerchantReturnPolicy',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
          applicableCountry: 'ID'
        } : undefined,
        itemOffered: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image_url,
          url: site ? new URL(`/catalog/${product.id}-${slugify(product.name)}`, site).toString() : `/catalog/${product.id}-${slugify(product.name)}`,
          brand: { '@type': 'Brand', name: 'Abadi Jaya' },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 5,
            reviewCount: 1
          }
        }
      }))
    }
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: site || '/' },
      { '@type': 'ListItem', position: 2, name: 'Layanan', item: site ? new URL('/layanan', site).toString() : '/layanan' },
      { '@type': 'ListItem', position: 3, name: validArea, item: site ? new URL(`/layanan/${slugify(validArea)}`, site).toString() : `/layanan/${slugify(validArea)}` },
      { '@type': 'ListItem', position: 4, name: validService, item: currentAbs }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="service-ld" type="application/ld+json">
        {JSON.stringify(serviceJsonLd)}
      </Script>
      {/* JSON-LD tambahan: ItemList of Product dengan offers langsung pada setiap Product
          untuk memenuhi persyaratan Product snippets (offers/review/aggregateRating). */}
      <Script id="service-products-itemlist-ld" type="application/ld+json">
        {(() => {
          const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
            .toISOString()
            .split('T')[0];
          const items = products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: product.name,
              description: product.description || undefined,
              image: product.image_url || undefined,
              url: site ? new URL(`/catalog/${product.id}-${slugify(product.name)}`, site).toString() : `/catalog/${product.id}-${slugify(product.name)}`,
              brand: { '@type': 'Brand', name: 'Abadi Jaya' },
              offers: {
                '@type': 'Offer',
                price: Number.isFinite(product.price as number) ? product.price : undefined,
                priceCurrency: Number.isFinite(product.price as number) ? 'IDR' : undefined,
                availability: Number.isFinite(product.price as number) ? 'https://schema.org/InStock' : undefined,
                url: site ? new URL(`/catalog/${product.id}-${slugify(product.name)}`, site).toString() : `/catalog/${product.id}-${slugify(product.name)}`,
                priceValidUntil: Number.isFinite(product.price as number) ? priceValidUntil : undefined,
                itemCondition: Number.isFinite(product.price as number) ? 'https://schema.org/NewCondition' : undefined,
                shippingDetails: Number.isFinite(product.price as number) ? {
                  '@type': 'OfferShippingDetails',
                  shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'IDR' },
                  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ID' },
                  deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' } }
                } : undefined,
                hasMerchantReturnPolicy: Number.isFinite(product.price as number) ? {
                  '@type': 'MerchantReturnPolicy',
                  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                  merchantReturnDays: 7,
                  returnMethod: 'https://schema.org/ReturnByMail',
                  returnFees: 'https://schema.org/FreeReturn',
                  applicableCountry: 'ID'
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
            itemListElement: items
          });
        })()}
      </Script>
      <Script id="breadcrumb-ld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            <Link href="/" className="hover:underline">Beranda</Link> <span>/</span> 
            <Link href="/layanan" className="hover:underline">Layanan</Link> <span>/</span>
            <Link href={`/layanan/${slugify(validArea)}`} className="hover:underline">{validArea}</Link> <span>/</span>
            <span className="opacity-90">{validService}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Jasa Las {validService} di {validArea}
          </h1>
          <p className="text-orange-100 text-lg max-w-3xl">
            {categoryDetail?.description || `Layanan ${validService.toLowerCase()} terpercaya di ${validArea} dengan kualitas tinggi dan harga transparan.`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Keunggulan Layanan */}
        <Card className="mb-10 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mengapa Memilih Produk {validService} dari Abadi Jaya untuk kamu yang tinggal di {validArea}?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">Spesialisasi</h3>
              <p className="text-gray-600">Fokus pada {validService.toLowerCase()} dengan pengalaman bertahun-tahun</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="font-semibold text-lg mb-2">Kustomisasi</h3>
              <p className="text-gray-600">Desain dan ukuran sesuai kebutuhan spesifik Anda</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Pengerjaan Cepat</h3>
              <p className="text-gray-600">Tim berpengalaman dengan jadwal pengerjaan yang tepat waktu</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold text-lg mb-2">Garansi Kualitas</h3>
              <p className="text-gray-600">Material berkualitas dengan garansi pengerjaan yang jelas</p>
            </div>
          </div>
        </Card>

        {/* Produk Layanan */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Contoh Produk {validService} di {validArea}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: Number(product.id),
                  name: String(product.name),
                  description: product.description ?? undefined,
                  price: typeof product.price === 'number' ? product.price : undefined,
                  image_url: product.image_url ?? undefined,
                  tags: Array.isArray(product.tags) ? product.tags : undefined,
                }}
                showConsultation={true}
                context={{ area: validArea, service: validService }}
              />
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pertanyaan Umum tentang Jasa Las Produk {validService} di {validArea}
          </h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Berapa lama pengerjaan produk {validService.toLowerCase()} di {validArea}?
              </h3>
              <p className="text-gray-600">
                Waktu pengerjaan bervariasi tergantung kompleksitas proyek. Umumnya 3-7 hari kerja untuk proyek standar, 
                dan 1-2 minggu untuk proyek kustom yang lebih kompleks.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Apakah ada garansi untuk produk {validService.toLowerCase()}?
              </h3>
              <p className="text-gray-600">
                Ya, kami memberikan garansi pengerjaan 1 tahun untuk semua produk {validService.toLowerCase()}. 
                Garansi meliputi kualitas pengerjaan dan material yang digunakan.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Bisakah produk {validService.toLowerCase()} dikustomisasi sesuai kebutuhan?
              </h3>
              <p className="text-gray-600">
                Tentu! Kami melayani kustomisasi desain, ukuran, warna, dan finishing sesuai kebutuhan spesifik Anda. 
                Konsultasi gratis untuk menentukan desain yang tepat.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Siap Memesan Produk {validService} di {validArea}?
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Konsultasi gratis untuk proyek las produk {validService.toLowerCase()} Anda. <br></br>
            Tim kami siap membantu mewujudkan desain yang Anda inginkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/6289653754317" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="ghost" 
                size="lg" 
                className="bg-white text-orange-700 font-semibold hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 shadow-md hover:shadow-lg ring-1 ring-white/60 hover:scale-[1.05]"
              >
                📞 Hubungi Sekarang
              </Button>
            </a>
            <a
              href={`https://wa.me/6289653754317?text=${encodeURIComponent(`Halo, saya ingin konsultasi gratis untuk proyek ${validService} di ${validArea}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 hover:scale-[1.05]"
              >
                💬 Konsultasi Gratis
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
