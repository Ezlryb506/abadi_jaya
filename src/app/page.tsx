'use client';

import dynamic from 'next/dynamic';
import Script from 'next/script';

// Lazy load components untuk performance yang lebih baik
const HeroSection = dynamic(() => import('@/components/sections/HeroSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: true
});

const LayananSection = dynamic(() => import('@/components/sections/LayananSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: true
});

const KeunggulanSection = dynamic(() => import('@/components/sections/KeunggulanSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: true,
});

const CtaSection = dynamic(() => import('@/components/sections/CtaSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: true,
});

const FaqSection = dynamic(() => import('@/components/sections/FaqSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: true,
});

export default function Home() {
  return (
    <>
      {/* JSON-LD: Organization */}
      <Script id="ld-org" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Bengkel Las Abadi Jaya',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/apple-touch-icon.png`,
          sameAs: [],
        })}
      </Script>

      {/* JSON-LD: Website with potentialAction */}
      <Script id="ld-website" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Website',
          name: 'Bengkel Las Abadi Jaya',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/catalog?query={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        })}
      </Script>

      {/* JSON-LD: LocalBusiness (untuk SEO lokal) */}
      <Script id="ld-localbusiness" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Bengkel Las Abadi Jaya',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/apple-touch-icon.png`,
          image: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/apple-touch-icon.png`],
          telephone: '+62 896-5375-4317',
          sameAs: [],
          areaServed: 'ID',
          priceRange: '$$',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Gg. Bunga, Wanasari, Kec. Cibitung',
            addressLocality: 'Kabupaten Bekasi',
            addressRegion: 'Jawa Barat',
            postalCode: '17520',
            addressCountry: 'ID'
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
              ],
              opens: '08:00',
              closes: '17:00'
            }
          ],
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -6.254683,
            longitude: 107.085045
          },
          hasMap: 'https://www.google.com/maps?q=-6.254683,107.085045&z=15',
          contactPoint: [
            {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              telephone: '+62 896-5375-4317',
              availableLanguage: ['Indonesian'],
              areaServed: 'ID',
              url: 'https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las'
            }
          ],
          makesOffer: {
            '@type': 'OfferCatalog',
            name: 'Layanan Abadi Jaya',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pagar Besi', description: 'Pagar besi minimalis/modern, kuat dan tahan cuaca, kustom ukuran & motif.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kanopi & Carport', description: 'Kanopi teras/garasi, material berkualitas (spandek, polycarbonate, hollow), rapi & presisi.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Railing Tangga', description: 'Railing besi/stainless untuk rumah & komersial, aman, ergonomis, estetik.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pintu Besi', description: 'Pintu besi rumah/gerbang, finishing halus, kokoh, kustom model.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Jendela & Teralis', description: 'Teralis jendela aman dan menarik, opsional kasa nyamuk.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Stainless Steel', description: 'Produk stainless premium: tahan karat, higienis, finishing halus.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pergola & Kanopi Taman', description: 'Pergola/kanopi estetik untuk teras & taman, teduh, nyaman, tahan cuaca.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Railing Balkon', description: 'Railing balkon minimalis/modern, aman dan mempercantik fasad.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pintu Gerbang', description: 'Gerbang besi/stainless, dorong/geser, kunci aman & awet.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kitchen Set Stainless', description: 'Meja sink & kabinet stainless, higienis untuk rumah/komersial.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rak & Meja Stainless', description: 'Rak/meja stainless kuat dan higienis, cocok gudang/komersial.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Handrail Tangga Stainless', description: 'Handrail ergonomis, finishing premium, aman untuk semua usia.' } }
            ]
          }
        })}
      </Script>

      <HeroSection />
      <LayananSection />
      <KeunggulanSection />
      <CtaSection />
      <FaqSection />
    </>
  );
}
