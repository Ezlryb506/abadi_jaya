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
import CategoryCard from '@/components/ui/CategoryCard';
import LocalTestimonials from '@/components/sections/LocalTestimonials';

type RouteParams = { area: string };
type Props = { params: Promise<RouteParams> };

// Validasi area
function validateArea(area: string): string | null {
  const normalizedArea = area.toLowerCase().replace(/[^a-z0-9]/g, '');
  return areaAll.find(a => 
    slugify(a).toLowerCase() === normalizedArea || 
    a.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedArea
  ) || null;
}

// Generate metadata dinamis
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const validArea = validateArea(area);
  
  if (!validArea) {
    return {
      title: 'Area Tidak Ditemukan | Abadi Jaya',
      description: 'Area layanan tidak ditemukan. Lihat daftar area layanan kami.',
    };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = `/layanan/${slugify(validArea)}`;
  const canonicalAbs = site ? new URL(canonical, site).toString() : canonical;

  return {
    title: `Bengkel Las ${validArea} — Abadi Jaya | Survei Gratis & Garansi`,
    description: `Bengkel las terpercaya di ${validArea}. Pagar besi, kanopi, railing, teralis, stainless steel. Konsultasi gratis, garansi pengerjaan, harga transparan. Survey gratis & estimasi harga.`,
    keywords: [
      'bengkel las',
      'jasa las',
      'fabrikasi besi',
      'pagar besi',
      'kanopi',
      'railing',
      'teralis',
      'stainless steel',
      validArea.toLowerCase(),
      'bekasi',
      'cikarang',
      'tambun',
      'cibitung'
    ],
    alternates: { canonical: canonicalAbs },
    robots: { index: true, follow: true },
    openGraph: {
      title: `Bengkel Las ${validArea} — Abadi Jaya | Survei Gratis & Garansi`,
      description: `Bengkel las terpercaya di ${validArea}. Pagar besi, kanopi, railing, teralis, stainless steel. Konsultasi gratis, garansi pengerjaan, harga transparan.`,
      type: 'website',
      url: canonicalAbs,
      images: site ? [
        {
          url: new URL(`/api/og?variant=area&area=${encodeURIComponent(validArea)}&title=${encodeURIComponent(`Jasa Las di ${validArea}`)}`, site).toString(),
          width: 1200,
          height: 630,
          alt: `Bengkel Las ${validArea} - Abadi Jaya`
        },
        {
          url: new URL('/images/layanan/pagar besi - modern 1.jpg', site).toString(),
          width: 800,
          height: 600,
          alt: 'Pagar Besi Modern - Abadi Jaya'
        },
        {
          url: new URL('/images/layanan/Modern Carport - Kanopi - 2.jpg', site).toString(),
          width: 800,
          height: 600,
          alt: 'Kanopi Carport Modern - Abadi Jaya'
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Bengkel Las ${validArea} — Abadi Jaya | Survei Gratis & Garansi`,
      description: `Bengkel las terpercaya di ${validArea}. Pagar besi, kanopi, railing, teralis, stainless steel. Konsultasi gratis, garansi pengerjaan.`,
    },
  };
}

// Generate static params untuk semua area
export async function generateStaticParams() {
  return areaAll.map(area => ({
    area: slugify(area)
  }));
}

// Fetch data produk untuk area tertentu
async function getProductsForArea(_area: string) {
  // mark as used to satisfy lint while keeping signature stable
  void _area;
  const { data: products } = await supabaseServer
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      product_categories(name)
    `)
    .or('is_active.eq.true,is_active.is.null')
    .order('id', { ascending: false })
    .limit(12);

  return products || [];
}

// Fetch kategori populer
async function getPopularCategories() {
  const { data: categories } = await supabaseServer
    .from('product_categories')
    .select('name, description')
    .order('name');

  return categories || [];
}

export default async function AreaServicePage({ params }: Props) {
  const { area } = await params;
  const validArea = validateArea(area);
  
  if (!validArea) {
    notFound();
  }

  const [products, categories] = await Promise.all([
    getProductsForArea(validArea),
    getPopularCategories()
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const currentUrl = `/layanan/${slugify(validArea)}`;
  const currentAbs = site ? new URL(currentUrl, site).toString() : currentUrl;

  // JSON-LD untuk LocalBusiness
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
    .toISOString()
    .split('T')[0];
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Abadi Jaya',
    description: `Bengkel las dan fabrikasi besi terpercaya di ${validArea}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: validArea,
      addressRegion: 'Jawa Barat',
      addressCountry: 'ID'
    },
    areaServed: [validArea, ...areaAll],
    serviceType: ['Bengkel Las', 'Fabrikasi Besi', 'Pagar Besi', 'Kanopi', 'Railing', 'Teralis', 'Stainless Steel'],
    url: currentAbs,
    telephone: '+62-896-5375-4317',
    priceRange: '$$',
    image: site ? [new URL('/apple-touch-icon.png', site).toString()] : undefined,
    openingHours: 'Mo-Sa 08:00-17:00',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Katalog Produk',
      itemListElement: products.map((product) => ({
        '@type': 'Offer',
        price: Number.isFinite(product.price as number) ? product.price : undefined,
        priceCurrency: Number.isFinite(product.price as number) ? 'IDR' : undefined,
        availability: Number.isFinite(product.price as number) ? 'https://schema.org/InStock' : undefined,
        url: product.id && product.name ? (site ? new URL(`/catalog/${product.id}-${slugify(product.name)}`, site).toString() : `/catalog/${product.id}-${slugify(product.name)}`) : undefined,
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
        } : undefined,
        itemOffered: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image_url,
          url: product.id && product.name ? (site ? new URL(`/catalog/${product.id}-${slugify(product.name)}`, site).toString() : `/catalog/${product.id}-${slugify(product.name)}`) : undefined,
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
      { '@type': 'ListItem', position: 3, name: validArea, item: currentAbs }
    ]
  };

  // FAQ JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Berapa lama waktu pengerjaan untuk proyek di ${validArea}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Waktu pengerjaan bervariasi tergantung kompleksitas proyek. Pagar besi sederhana membutuhkan 3-5 hari, kanopi 5-7 hari, dan railing tangga 2-3 hari. Tim kami akan memberikan estimasi waktu yang akurat saat survey.`
        }
      },
      {
        '@type': 'Question',
        name: `Apakah ada garansi untuk pengerjaan di ${validArea}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Ya, kami memberikan garansi pengerjaan 1 tahun untuk semua proyek di ${validArea}. Garansi meliputi struktur, sambungan las, dan finishing. Kami juga menyediakan layanan purna jual.`
        }
      },
      {
        '@type': 'Question',
        name: `Bagaimana cara mendapatkan estimasi harga yang akurat?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Hubungi kami untuk survey gratis ke lokasi proyek di ${validArea}. Tim kami akan mengukur, menganalisis kondisi, dan memberikan estimasi harga yang detail dalam 24 jam.`
        }
      },
      {
        '@type': 'Question',
        name: `Apakah Anda melayani area ${validArea} dan sekitarnya?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Ya, kami melayani ${validArea} dan seluruh wilayah Bekasi. Tim kami berpengalaman melayani pelanggan di berbagai area dengan kualitas konsisten.`
        }
      },
      {
        '@type': 'Question',
        name: `Material apa saja yang tersedia untuk proyek di ${validArea}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Kami menyediakan berbagai material berkualitas: besi hollow, besi siku, stainless steel, polycarbonate, dan berbagai finishing. Semua material memiliki sertifikat kualitas.`
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="local-business-ld" type="application/ld+json">
        {JSON.stringify(localBusinessJsonLd)}
      </Script>
      {/* JSON-LD tambahan: ItemList Product dengan offers langsung agar memenuhi Product snippets */}
      <Script id="area-products-itemlist-ld" type="application/ld+json">
        {(() => {
          const items = (products || []).map((product, index) => ({
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
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: 5,
                reviewCount: 1
              }
            }
          }));
          return JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items });
        })()}
      </Script>
      <Script id="breadcrumb-ld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
      <Script id="faq-ld" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            <Link href="/" className="hover:underline">Beranda</Link> <span>/</span> 
            <Link href="/layanan" className="hover:underline">Layanan</Link> <span>/</span> 
            <span className="opacity-90">{validArea}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Jasa Las & Fabrikasi Besi di {validArea}
          </h1>
          <p className="text-orange-100 text-lg">
            Bengkel las terpercaya untuk daerah {validArea} dengan pengalaman bertahun-tahun. <br></br>
            Pagar besi, kanopi, railing, teralis, dan stainless steel berkualitas tinggi.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Keunggulan Area */}
        <Card className="mb-10 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mengapa Memilih Jasa Las Abadi Jaya untuk kamu yang berada di {validArea}?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-semibold text-lg mb-2">Layanan Lokal</h3>
              <p className="text-gray-600">Tim kami berpengalaman melayani pelanggan di {validArea} dan sekitarnya</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Respon Cepat</h3>
              <p className="text-gray-600">Survey dan konsultasi gratis dengan jadwal yang fleksibel</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold text-lg mb-2">Garansi Pengerjaan</h3>
              <p className="text-gray-600">Kualitas terjamin dengan garansi pengerjaan yang jelas</p>
            </div>
          </div>
        </Card>

        {/* Kategori Layanan */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Layanan / Jasa Las Kami di {validArea}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                areaCount={areaAll.length}
                href={`/layanan/${slugify(validArea)}/${slugify(category.name)}`}
              />
            ))}
          </div>
        </div>

        {/* Produk Unggulan */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Produk Unggulan di {validArea}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showConsultation={true}
                context={{ area: validArea }}
              />
            ))}
          </div>
        </div>

        {/* Estimasi Harga */}
        <Card className="mb-10 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Estimasi Harga Layanan di {validArea}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-orange-800">Pagar Besi</h3>
              <p className="text-orange-700 mb-2">Mulai dari <span className="font-bold">Rp 350.000/m²</span></p>
              <p className="text-sm text-orange-600">Termasuk material, pemasangan, dan finishing</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-blue-800">Kanopi</h3>
              <p className="text-blue-700 mb-2">Mulai dari <span className="font-bold">Rp 450.000/m²</span></p>
              <p className="text-sm text-blue-600">Struktur baja ringan dengan atap polycarbonate</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-green-800">Railing Tangga</h3>
              <p className="text-green-700 mb-2">Mulai dari <span className="font-bold">Rp 250.000/meter</span></p>
              <p className="text-sm text-green-600">Desain modern dengan finishing powder coating</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-purple-800">Pintu Besi</h3>
              <p className="text-purple-700 mb-2">Mulai dari <span className="font-bold">Rp 1.500.000/pintu</span></p>
              <p className="text-sm text-purple-600">Pintu besi custom dengan sistem keamanan</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-red-800">Teralis Jendela</h3>
              <p className="text-red-700 mb-2">Mulai dari <span className="font-bold">Rp 200.000/meter</span></p>
              <p className="text-sm text-red-600">Teralis besi dengan desain minimalis</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-indigo-800">Stainless Steel</h3>
              <p className="text-indigo-700 mb-2">Mulai dari <span className="font-bold">Rp 650.000/m²</span></p>
              <p className="text-sm text-indigo-600">Custom stainless steel untuk dapur & furniture</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-pink-800">Railing Balkon</h3>
              <p className="text-pink-700 mb-2">Mulai dari <span className="font-bold">Rp 300.000/meter</span></p>
              <p className="text-sm text-pink-600">Railing balkon dengan desain modern</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-yellow-800">Pintu Gerbang</h3>
              <p className="text-yellow-700 mb-2">Mulai dari <span className="font-bold">Rp 2.500.000/pintu</span></p>
              <p className="text-sm text-yellow-600">Pintu gerbang otomatis dengan remote</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-teal-800">Tangga Putar</h3>
              <p className="text-teal-700 mb-2">Mulai dari <span className="font-bold">Rp 8.000.000/tangga</span></p>
              <p className="text-sm text-teal-600">Tangga putar custom dengan desain elegan</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-yellow-800">
              <strong>Catatan:</strong> Harga dapat bervariasi tergantung kompleksitas desain, material yang dipilih, dan kondisi lokasi. 
              Survey gratis untuk mendapatkan estimasi yang akurat.
            </p>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-10 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Berapa lama waktu pengerjaan untuk proyek di {validArea}?
              </h3>
              <p className="text-gray-600">
                Waktu pengerjaan bervariasi tergantung kompleksitas proyek. Pagar besi sederhana membutuhkan 3-5 hari, 
                kanopi 5-7 hari, dan railing tangga 2-3 hari. Tim kami akan memberikan estimasi waktu yang akurat saat survey.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Apakah ada garansi untuk pengerjaan di {validArea}?
              </h3>
              <p className="text-gray-600">
                Ya, kami memberikan garansi pengerjaan 1 tahun untuk semua proyek di {validArea}. 
                Garansi meliputi struktur, sambungan las, dan finishing. Kami juga menyediakan layanan purna jual.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Bagaimana cara mendapatkan estimasi harga yang akurat?
              </h3>
              <p className="text-gray-600">
                Hubungi kami untuk survey gratis ke lokasi proyek di {validArea}. Tim kami akan mengukur, 
                menganalisis kondisi, dan memberikan estimasi harga yang detail dalam 24 jam.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Apakah Anda melayani area {validArea} dan sekitarnya?
              </h3>
              <p className="text-gray-600">
                Ya, kami melayani {validArea} dan seluruh wilayah Bekasi. Tim kami berpengalaman 
                melayani pelanggan di berbagai area dengan kualitas konsisten.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Material apa saja yang tersedia untuk proyek di {validArea}?
              </h3>
              <p className="text-gray-600">
                Kami menyediakan berbagai material berkualitas: besi hollow, besi siku, stainless steel, 
                polycarbonate, dan berbagai finishing. Semua material memiliki sertifikat kualitas.
              </p>
            </div>
          </div>
        </Card>

        {/* Testimoni Lokal */}
        <LocalTestimonials area={validArea} />

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Siap Memulai Proyek Anda di {validArea}?
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Konsultasi gratis untuk proyek pagar besi, kanopi, railing, atau fabrikasi besi lainnya. <br></br>
            Tim kami siap membantu mewujudkan impian Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/6289653754317" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="lg" className="bg-white text-orange-600 hover:bg-orange-50 hover:scale-[1.05]">
                📞 Hubungi Sekarang
              </Button>
            </a>
            <a href="https://wa.me/6289653754317?text=Halo%2C%20saya%20ingin%20konsultasi%20gratis%20untuk%20proyek%20las%20dan%20fabrikasi%20besi" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600 hover:scale-[1.05]">
                💬 Konsultasi Gratis
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
