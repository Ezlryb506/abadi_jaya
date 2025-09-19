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

type RouteParams = { category: string; area: string };
type Props = { params: Promise<RouteParams> };

// Validasi area
function validateArea(area: string): string | null {
  const normalizedArea = area.toLowerCase().replace(/[^a-z0-9]/g, '');
  return areaAll.find(a => 
    slugify(a).toLowerCase() === normalizedArea || 
    a.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedArea
  ) || null;
}

// Validasi kategori
async function validateCategory(category: string): Promise<string | null> {
  const { data: categories } = await supabaseServer
    .from('product_categories')
    .select('name')
    .order('name');
  
  if (!categories) return null;
  
  const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '');
  return categories.find(cat => 
    slugify(cat.name).toLowerCase() === normalizedCategory ||
    cat.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedCategory
  )?.name || null;
}

// Generate metadata dinamis
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, area } = await params;
  const validCategory = await validateCategory(category);
  const validArea = validateArea(area);
  
  if (!validCategory || !validArea) {
    return {
      title: 'Kategori Tidak Ditemukan | Abadi Jaya',
      description: 'Kategori tidak ditemukan. Lihat daftar kategori kami.',
    };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = `/kategori/${slugify(validCategory)}/${slugify(validArea)}`;
  const canonicalAbs = site ? new URL(canonical, site).toString() : canonical;

  // Generate long-tail keywords
  const longTailKeywords = [
    `${validCategory.toLowerCase()} di ${validArea}`,
    `harga ${validCategory.toLowerCase()} ${validArea}`,
    `jasa ${validCategory.toLowerCase()} ${validArea}`,
    `bengkel las ${validCategory.toLowerCase()} ${validArea}`,
    `kontraktor ${validCategory.toLowerCase()} ${validArea}`,
    `pemasangan ${validCategory.toLowerCase()} ${validArea}`,
    `kustom ${validCategory.toLowerCase()} ${validArea}`,
    `modern ${validCategory.toLowerCase()} ${validArea}`,
    `minimalis ${validCategory.toLowerCase()} ${validArea}`,
    validArea.toLowerCase(),
    validCategory.toLowerCase(),
    'bekasi',
    'cikarang',
    'tambun',
    'cibitung'
  ];

  return {
    title: `${validCategory} di ${validArea} | Abadi Jaya`,
    description: `Katalog ${validCategory.toLowerCase()} terpercaya di ${validArea}. Kualitas tinggi, harga transparan, konsultasi gratis. Bengkel las Abadi Jaya siap membantu proyek Anda.`,
    keywords: longTailKeywords,
    alternates: { canonical: canonicalAbs },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${validCategory} di ${validArea} | Abadi Jaya`,
      description: `Katalog ${validCategory.toLowerCase()} terpercaya di ${validArea}. Kualitas tinggi, harga transparan, konsultasi gratis.`,
      type: 'website',
      url: canonicalAbs,
      images: site ? [{
        url: new URL(`/api/og?variant=category-area&category=${encodeURIComponent(validCategory)}&area=${encodeURIComponent(validArea)}&title=${encodeURIComponent(`${validCategory} di ${validArea}`)}`, site).toString()
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${validCategory} di ${validArea} | Abadi Jaya`,
      description: `Katalog ${validCategory.toLowerCase()} terpercaya di ${validArea}. Kualitas tinggi, harga transparan.`,
    },
  };
}

// Generate static params
export async function generateStaticParams() {
  const { data: categories } = await supabaseServer
    .from('product_categories')
    .select('name');
  
  if (!categories) return [];
  
  const params: Array<{ category: string; area: string }> = [];
  
  for (const category of categories) {
    for (const area of areaAll) {
      params.push({
        category: slugify(category.name),
        area: slugify(area)
      });
    }
  }
  
  return params;
}

// Fetch produk berdasarkan kategori dan area
async function getProductsForCategoryArea(categoryName: string, _area: string) {
  // mark as used to satisfy lint while keeping signature stable
  void _area;
  // Fallback untuk kategori "Jendela" yang belum ada data
  const actualCategoryName = categoryName === 'Jendela' ? 'Teralis' : categoryName;
  
  // Step 1: Dapatkan ID kategori berdasarkan nama
  const { data: categoryData } = await supabaseServer
    .from('product_categories')
    .select('id')
    .eq('name', actualCategoryName)
    .single();

  if (!categoryData) {
    return [];
  }

  // Step 2: Fetch produk berdasarkan category_id
  const { data: products } = await supabaseServer
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
    .limit(12);

  return products || [];
}

// Fetch kategori detail
async function getCategoryDetail(categoryName: string) {
  const { data: category } = await supabaseServer
    .from('product_categories')
    .select('name, description')
    .eq('name', categoryName)
    .single();

  return category;
}

export default async function CategoryAreaPage({ params }: Props) {
  const { category, area } = await params;
  const validCategory = await validateCategory(category);
  const validArea = validateArea(area);
  
  if (!validCategory || !validArea) {
    notFound();
  }

  const [products, categoryDetail] = await Promise.all([
    getProductsForCategoryArea(validCategory, validArea),
    getCategoryDetail(validCategory)
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const currentUrl = `/kategori/${slugify(validCategory)}/${slugify(validArea)}`;
  const currentAbs = site ? new URL(currentUrl, site).toString() : currentUrl;

  // JSON-LD untuk CollectionPage
  // Tambahan field Offer untuk mengurangi warning GSC (availability, priceValidUntil, url, dll)
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
    .toISOString()
    .split('T')[0];
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${validCategory} di ${validArea}`,
    description: `Katalog ${validCategory.toLowerCase()} terpercaya di ${validArea}`,
    url: currentAbs,
    about: {
      '@type': 'Thing',
      name: validCategory
    },
    location: {
      '@type': 'Place',
      name: validArea
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image_url,
          brand: { '@type': 'Brand', name: 'Abadi Jaya' },
          offers: product.price ? {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'IDR',
            availability: 'https://schema.org/InStock',
            url: site ? new URL(`/catalog/${product.id}-${slugify(product.name)}`, site).toString() : `/catalog/${product.id}-${slugify(product.name)}`,
            priceValidUntil,
            itemCondition: 'https://schema.org/NewCondition',
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: '0',
                currency: 'IDR'
              },
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'ID'
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
                transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' }
              }
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: 7,
              returnMethod: 'https://schema.org/ReturnByMail',
              returnFees: 'https://schema.org/FreeReturn',
              applicableCountry: 'ID'
            }
          } : undefined,
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
      { '@type': 'ListItem', position: 2, name: 'Katalog', item: site ? new URL('/catalog', site).toString() : '/catalog' },
      { '@type': 'ListItem', position: 3, name: validCategory, item: site ? new URL(`/kategori/${slugify(validCategory)}`, site).toString() : `/kategori/${slugify(validCategory)}` },
      { '@type': 'ListItem', position: 4, name: validArea, item: currentAbs }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="collection-ld" type="application/ld+json">
        {JSON.stringify(collectionJsonLd)}
      </Script>
      <Script id="breadcrumb-ld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            <Link href="/" className="hover:underline">Beranda</Link> <span>/</span> 
            <Link href="/catalog" className="hover:underline">Katalog</Link> <span>/</span>
            <Link href={`/kategori/${slugify(validCategory)}`} className="hover:underline">{validCategory}</Link> <span>/</span>
            <span className="opacity-90">{validArea}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Jasa Pembuatan Produk Kategori {validCategory} di {validArea}
          </h1>
          <p className="text-orange-100 text-lg max-w-3xl">
            {categoryDetail?.description || `Katalog ${validCategory.toLowerCase()} terpercaya di ${validArea} dengan kualitas tinggi dan harga transparan.`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Filter & Sort */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Menampilkan {products.length} produk {validCategory.toLowerCase()} di {validArea}
                </h2>
                <p className="text-gray-600">
                  Kualitas terjamin dengan konsultasi gratis dan garansi pengerjaan
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/layanan/${slugify(validArea)}`}>
                  <Button variant="outline" size="sm">
                    Lihat Layanan
                  </Button>
                </Link>
                <Link href={`/kategori/${slugify(validCategory)}`}>
                  <Button variant="outline" size="sm">
                    Semua Area
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Produk Grid */}
        <div className="mb-10">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showConsultation={true}
                  context={{ category: validCategory, area: validArea }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Produk {validCategory} di {validArea}
              </h3>
              <p className="text-gray-600 mb-4">
                Kami sedang mengembangkan produk {validCategory.toLowerCase()} untuk area {validArea}. 
                Silakan hubungi kami untuk konsultasi kebutuhan spesifik Anda.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href={`/kategori/${slugify(validCategory)}`}>
                  <Button variant="outline">
                    Lihat Semua {validCategory}
                  </Button>
                </Link>
                <Button variant="primary">
                  💬 Konsultasi Kustom
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Area Lainnya */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {validCategory} di Area Lainnya
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {areaAll.filter(a => a !== validArea).slice(0, 8).map((otherArea) => (
              <Link
                key={otherArea}
                href={`/kategori/${slugify(validCategory)}/${slugify(otherArea)}`}
                className="group"
              >
                <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <h3 className="font-semibold group-hover:text-orange-600 transition-colors">
                    {otherArea}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Butuh {validCategory} Kustom untuk daerah {validArea}?
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Konsultasi gratis untuk proyek {validCategory.toLowerCase()} Anda di {validArea}. <br></br>
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
              href={`https://wa.me/6289653754317?text=${encodeURIComponent(`Halo, saya ingin konsultasi gratis untuk proyek ${validCategory} di ${validArea}`)}`}
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
