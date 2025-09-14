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

type RouteParams = { category: string };
type Props = { params: Promise<RouteParams> };

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
  const { category } = await params;
  const validCategory = await validateCategory(category);
  
  if (!validCategory) {
    return {
      title: 'Kategori Tidak Ditemukan | Abadi Jaya',
      description: 'Kategori tidak ditemukan. Lihat daftar kategori kami.',
    };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = `/kategori/${slugify(validCategory)}`;
  const canonicalAbs = site ? new URL(canonical, site).toString() : canonical;

  return {
    title: `Katalog ${validCategory} | Abadi Jaya`,
    description: `Katalog lengkap ${validCategory.toLowerCase()} berkualitas tinggi. Kustomisasi sesuai kebutuhan, harga transparan, konsultasi gratis. Melayani Bekasi, Cikarang, Tambun, Cibitung.`,
    keywords: [
      validCategory.toLowerCase(),
      `jasa ${validCategory.toLowerCase()}`,
      `harga ${validCategory.toLowerCase()}`,
      `kustom ${validCategory.toLowerCase()}`,
      `modern ${validCategory.toLowerCase()}`,
      `minimalis ${validCategory.toLowerCase()}`,
      'bekasi',
      'cikarang',
      'tambun',
      'cibitung',
      'bengkel las',
      'fabrikasi besi'
    ],
    alternates: { canonical: canonicalAbs },
    robots: { index: true, follow: true },
    openGraph: {
      title: `Katalog ${validCategory} | Abadi Jaya`,
      description: `Katalog lengkap ${validCategory.toLowerCase()} berkualitas tinggi. Kustomisasi sesuai kebutuhan, harga transparan.`,
      type: 'website',
      url: canonicalAbs,
      images: site ? [{
        url: new URL(`/api/og?variant=category&category=${encodeURIComponent(validCategory)}&title=${encodeURIComponent(`Katalog ${validCategory}`)}`, site).toString()
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Katalog ${validCategory} | Abadi Jaya`,
      description: `Katalog lengkap ${validCategory.toLowerCase()} berkualitas tinggi. Kustomisasi sesuai kebutuhan.`,
    },
  };
}

// Generate static params
export async function generateStaticParams() {
  const { data: categories } = await supabaseServer
    .from('product_categories')
    .select('name');
  
  if (!categories) return [];
  
  return categories.map(category => ({
    category: slugify(category.name)
  }));
}

// Fetch produk berdasarkan kategori
async function getProductsForCategory(categoryName: string) {
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

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const validCategory = await validateCategory(category);
  
  if (!validCategory) {
    notFound();
  }

  const [products, categoryDetail] = await Promise.all([
    getProductsForCategory(validCategory),
    getCategoryDetail(validCategory)
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const currentUrl = `/kategori/${slugify(validCategory)}`;
  const currentAbs = site ? new URL(currentUrl, site).toString() : currentUrl;

  // JSON-LD untuk CollectionPage
  // Tambahan field untuk mengurangi warning GSC pada Product.offers
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180) // ~6 bulan
    .toISOString()
    .split('T')[0];
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Katalog ${validCategory}`,
    description: `Katalog lengkap ${validCategory.toLowerCase()} berkualitas tinggi`,
    url: currentAbs,
    about: {
      '@type': 'Thing',
      name: validCategory
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
      { '@type': 'ListItem', position: 3, name: validCategory, item: currentAbs }
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
            <span className="opacity-90">{validCategory}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Katalog Produk Kategori {validCategory}
          </h1>
          <p className="text-orange-100 text-lg max-w-3xl">
            {categoryDetail?.description || `Katalog lengkap ${validCategory.toLowerCase()} berkualitas tinggi dengan kustomisasi sesuai kebutuhan.`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Area Layanan */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Produk {validCategory} di Area Layanan Kami
          </h2>
          <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-4">
            {areaAll.map((area) => (
              <Link
                key={area}
                href={`/kategori/${slugify(validCategory)}/${slugify(area)}`}
                className="group"
              >
                <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <h3 className="font-semibold group-hover:text-orange-600 transition-colors text-sm">
                    {area}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Produk Grid */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Produk {validCategory} Unggulan
            </h2>
            <Link href={`/catalog?category=${encodeURIComponent(validCategory)}`}>
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showConsultation={true}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Produk {validCategory}
              </h3>
              <p className="text-gray-600 mb-4">
                Kami sedang mengembangkan produk {validCategory.toLowerCase()}. 
                Silakan hubungi kami untuk konsultasi kebutuhan spesifik Anda.
              </p>
              <Button variant="primary">
                💬 Konsultasi Kustom
              </Button>
            </Card>
          )}
        </div>

        {/* Keunggulan Kategori */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Keunggulan Produk {validCategory} dari Abadi Jaya
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">Spesialisasi</h3>
              <p className="text-gray-600">
                Fokus pada {validCategory.toLowerCase()} dengan pengalaman bertahun-tahun
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="font-semibold text-lg mb-2">Kustomisasi</h3>
              <p className="text-gray-600">
                Desain dan ukuran sesuai kebutuhan spesifik Anda
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold text-lg mb-2">Garansi Kualitas</h3>
              <p className="text-gray-600">
                Material berkualitas tinggi dengan garansi pengerjaan yang jelas
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Butuh Jasa Las atau Pembuatan Produk {validCategory} Kustom?
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Konsultasi gratis untuk proyek {validCategory.toLowerCase()} Anda. <br></br>
            Tim kami siap membantu mewujudkan desain yang Anda inginkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ghost" size="lg" className="bg-white text-orange-600 hover:bg-orange-50 hover:scale-[1.05]">
              📞 Hubungi Sekarang
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600 hover:scale-[1.05]">
              💬 Konsultasi Gratis
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
