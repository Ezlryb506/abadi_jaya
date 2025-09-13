import type { Metadata } from 'next';
import { areaAll, areaGroups, type AreaGroup } from '@/lib/areaLayanan';
import { supabaseServer } from '@/lib/supabaseServer';
import { slugify } from '@/lib/slug';
import Link from 'next/link';
import Script from 'next/script';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CategoryCard from '@/components/ui/CategoryCard';

type Props = Record<string, never>;

export const metadata: Metadata = {
  title: 'Layanan Bengkel Las | Abadi Jaya',
  description: 'Jasa las dan fabrikasi besi terpercaya di Bekasi, Cikarang, Tambun, Cibitung. Pagar besi, kanopi, railing, teralis, stainless steel. Konsultasi gratis, garansi pengerjaan.',
  keywords: [
    'bengkel las',
    'jasa las',
    'fabrikasi besi',
    'pagar besi',
    'kanopi',
    'railing',
    'teralis',
    'stainless steel',
    'bekasi',
    'cikarang',
    'tambun',
    'cibitung'
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Layanan Bengkel Las | Abadi Jaya',
    description: 'Jasa las dan fabrikasi besi terpercaya di Bekasi, Cikarang, Tambun, Cibitung. Pagar besi, kanopi, railing, teralis, stainless steel.',
    type: 'website',
  },
};

// Fetch kategori layanan
async function getServiceCategories() {
  const { data: categories } = await supabaseServer
    .from('product_categories')
    .select('name, description')
    .order('name');

  return categories || [];
}

export default async function LayananPage({}: Props) {
  const categories = await getServiceCategories();
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  // JSON-LD untuk Organization
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Abadi Jaya',
    description: 'Bengkel las dan fabrikasi besi terpercaya di Bekasi dan sekitarnya',
    url: site || 'https://abadi-jaya.com',
    logo: site ? new URL('/apple-touch-icon.png', site).toString() : '/apple-touch-icon.png',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bekasi',
      addressRegion: 'Jawa Barat',
      addressCountry: 'ID'
    },
    areaServed: areaAll,
    serviceType: categories.map(cat => cat.name),
    telephone: '+62-896-5375-4317',
    priceRange: '$$',
    openingHours: 'Mo-Sa 08:00-17:00'
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: site || '/' },
      { '@type': 'ListItem', position: 2, name: 'Layanan', item: site ? new URL('/layanan', site).toString() : '/layanan' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="organization-ld" type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </Script>
      <Script id="breadcrumb-ld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            <Link href="/" className="hover:underline">Beranda</Link> <span>/</span> 
            <span className="opacity-90">Layanan</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Layanan Bengkel Las & Fabrikasi Besi
          </h1>
          <p className="text-orange-100 text-lg max-w-3xl">
            Melayani berbagai kebutuhan las dan fabrikasi besi di Bekasi, Cikarang, Tambun, Cibitung, 
            dan wilayah sekitarnya dengan kualitas terjamin dan harga transparan.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Area Layanan */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Area Layanan Kami
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {areaGroups.map((group: AreaGroup, groupIndex: number) => (
              <Card key={groupIndex} className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${group.gradient} flex items-center justify-center text-2xl mb-4`}>
                  {group.icon}
                </div>
                <h3 className="font-semibold text-lg mb-3">{group.title}</h3>
                <ul className="space-y-2">
                  {group.items.map((area: string, areaIndex: number) => (
                    <li key={areaIndex}>
                      <Link 
                        href={`/layanan/${slugify(area)}`}
                        className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                      >
                        {area}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Kategori Layanan */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Kategori Layanan
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                areaCount={areaAll.length}
              />
            ))}
          </div>
        </div>

        {/* Kombinasi Area & Layanan */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Layanan Spesifik per Area
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areaAll.slice(0, 6).map((area) => (
              <Card key={area} className="p-6">
                <h3 className="font-semibold text-lg mb-4">{area}</h3>
                <div className="space-y-2">
                  {categories.slice(0, 4).map((category) => (
                    <Link
                      key={category.name}
                      href={`/layanan/${slugify(area)}/${slugify(category.name)}`}
                      className="block text-orange-600 hover:text-orange-700 hover:underline transition-colors text-sm"
                    >
                      {category.name} di {area}
                    </Link>
                  ))}
                  <Link
                    href={`/layanan/${slugify(area)}`}
                    className="block text-orange-500 hover:text-orange-600 font-medium text-sm mt-3"
                  >
                    Lihat semua layanan di {area} →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Keunggulan */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Mengapa Memilih Abadi Jaya?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="font-semibold text-xl mb-3">Pengalaman Bertahun-tahun</h3>
              <p className="text-gray-600">
                Tim berpengalaman dengan ribuan proyek berhasil di berbagai area layanan
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="font-semibold text-xl mb-3">Kustomisasi Lengkap</h3>
              <p className="text-gray-600">
                Desain dan ukuran sesuai kebutuhan spesifik dengan konsultasi gratis
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="font-semibold text-xl mb-3">Garansi Kualitas</h3>
              <p className="text-gray-600">
                Material berkualitas tinggi dengan garansi pengerjaan yang jelas
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Siap Memulai Proyek Anda?
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Konsultasi gratis untuk proyek las dan fabrikasi besi Anda. 
            Tim kami siap membantu mewujudkan impian Anda di area manapun.
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
