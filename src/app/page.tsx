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

const HowToSection = dynamic(() => import('@/components/sections/HowToSection'), {
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
            target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/catalog?q={search_term_string}`,
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
          areaServed: {
            '@type': 'AdministrativeArea',
            name: 'Jawa Barat',
            geoContains: [
              { '@type': 'City', name: 'Kabupaten Bekasi' },
              { '@type': 'City', name: 'Kota Bekasi' },
              { '@type': 'City', name: 'Cibitung' },
              { '@type': 'City', name: 'Cikarang' },
              { '@type': 'City', name: 'Cikarang Barat' },
              { '@type': 'City', name: 'Cikarang Selatan' },
              { '@type': 'City', name: 'Cikarang Utara' },
              { '@type': 'City', name: 'Tambun' },
              { '@type': 'City', name: 'Tambun Selatan' },
              { '@type': 'City', name: 'Tambun Utara' },
              { '@type': 'City', name: 'Setu' },
              { '@type': 'City', name: 'Babelan' },
              { '@type': 'City', name: 'Tarumajaya' },
              { '@type': 'City', name: 'Karangbahagia' },
              { '@type': 'City', name: 'Tambelang' },
              { '@type': 'City', name: 'Sukatani' },
              { '@type': 'City', name: 'Sukakarya' },
              { '@type': 'City', name: 'Pebayuran' },
              { '@type': 'City', name: 'Kedungwaringin' },
              { '@type': 'City', name: 'Serang Baru' },
              { '@type': 'City', name: 'Bojongmangu' },
              { '@type': 'City', name: 'Cabangbungin' }
            ]
          },
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

      {/* JSON-LD: HowTo (alur penggunaan & transaksi) */}
      <Script id="ld-howto" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'Cara Menggunakan & Alur Transaksi di Bengkel Las Abadi Jaya',
          step: [
            { '@type': 'HowToStep', name: 'Pilih Layanan / Katalog', text: 'Jelajahi katalog untuk melihat contoh produk dan range harga sebagai gambaran awal.' },
            { '@type': 'HowToStep', name: 'Konsultasi Cepat', text: 'Ceritakan kebutuhan via WhatsApp. Kami bantu rekomendasi desain, material, dan estimasi.' },
            { '@type': 'HowToStep', name: 'Daftar Akun Customer', text: 'Buat akun agar proses transaksi lebih mudah dan data tersimpan rapi.' },
            { '@type': 'HowToStep', name: 'Masuk & Lengkapi Alamat', text: 'Masuk ke dashboard lalu lengkapi alamat untuk mempermudah pengiriman & penawaran.' },
            { '@type': 'HowToStep', name: 'Survei & Estimasi Detail', text: 'Jika diperlukan, kami jadwalkan survei lokasi untuk pengukuran dan validasi kebutuhan.' },
            { '@type': 'HowToStep', name: 'Penawaran & DP', text: 'Kami kirimkan penawaran resmi. Produksi dimulai setelah DP disepakati.' },
            { '@type': 'HowToStep', name: 'Produksi & QC', text: 'Produksi sesuai spesifikasi dan Quality Check sebelum pemasangan.' },
            { '@type': 'HowToStep', name: 'Instalasi & Garansi', text: 'Pemasangan di lokasi, serah terima, pelunasan, dan garansi sesuai ketentuan.' },
            { '@type': 'HowToStep', name: 'Pantau Dashboard', text: 'Lihat status proyek, update progres, dan histori pembayaran di dashboard Anda.' }
          ]
        })}
      </Script>
      
      {/* JSON-LD: FAQPage (sinkron dengan konten FaqSection) */}
      <Script id="ld-faq" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'Apakah bisa konsultasi dan survei dahulu?', acceptedAnswer: { '@type': 'Answer', text: 'Bisa. Konsultasi gratis via WhatsApp. Kami juga dapat menjadwalkan survei lokasi sesuai kebutuhan.' } },
            { '@type': 'Question', name: 'Bagaimana sistem pembayaran (DP/termin)?', acceptedAnswer: { '@type': 'Answer', text: 'Umumnya DP di awal, pelunasan setelah pekerjaan selesai/terverifikasi. Skema termin fleksibel sesuai proyek.' } },
            { '@type': 'Question', name: 'Berapa lama waktu pengerjaan?', acceptedAnswer: { '@type': 'Answer', text: 'Bergantung jenis dan skala pekerjaan. Setelah survei, kami berikan estimasi waktu yang jelas.' } },
            { '@type': 'Question', name: 'Apakah ada garansi?', acceptedAnswer: { '@type': 'Answer', text: 'Ada. Garansi pengerjaan dan material sesuai ketentuan pada invoice/kontrak.' } },
            { '@type': 'Question', name: 'Apakah menerima desain custom?', acceptedAnswer: { '@type': 'Answer', text: 'Tentu. Bawa referensi Anda, kami bantu pilih material, ukuran, dan finishing sesuai anggaran.' } },
            { '@type': 'Question', name: 'Apakah kustomisasi/desain berbayar?', acceptedAnswer: { '@type': 'Answer', text: 'Tidak. Kustomisasi gratis untuk penyesuaian ukuran, warna, bahan, dan penempatan logo. Biaya hanya mengikuti perubahan material/komponen yang disepakati.' } },
            { '@type': 'Question', name: 'Mengapa harga di katalog bisa berbeda saat konsultasi?', acceptedAnswer: { '@type': 'Answer', text: 'Harga di katalog bersifat estimasi dan tidak diperbarui harian karena fluktuasi bahan. Kami akan mengonfirmasi estimasi terbaru setelah konsultasi sebelum produksi dimulai.' } },
            { '@type': 'Question', name: 'Mengapa ada beberapa gambar terlihat seperti hasil AI?', acceptedAnswer: { '@type': 'Answer', text: 'Sebagian gambar adalah ilustrasi AI sebagai contoh visual. Hasil akhir akan mengikuti brief dan referensi Anda; kami pastikan produk nyata sesuai spesifikasi yang disepakati.' } }
          ]
        })}
      </Script>

      <HeroSection />
      <LayananSection />
      <KeunggulanSection />
      <HowToSection />
      <CtaSection />
      <FaqSection />
    </>
  );
}
