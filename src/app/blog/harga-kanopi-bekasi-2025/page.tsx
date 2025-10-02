import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Card from '@/components/ui/Card';
import ContohProyekBlog from '@/components/sections/ContohProyekBlog';

export const metadata: Metadata = {
  title: 'Harga Kanopi di Bekasi 2025 — Estimasi & Tips | Abadi Jaya',
  description: 'Panduan lengkap harga kanopi di Bekasi 2025. Estimasi biaya, tips memilih material, dan rekomendasi bengkel las terpercaya.',
  keywords: [
    'harga kanopi bekasi',
    'estimasi biaya kanopi bekasi',
    'bengkel las kanopi bekasi',
    'jasa kanopi bekasi',
    'kanopi minimalis modern bekasi',
    'harga kanopi per meter bekasi',
    'kontraktor kanopi bekasi'
  ],
  alternates: {
    canonical: '/blog/harga-kanopi-bekasi-2025'
  },
  openGraph: {
    title: 'Harga Kanopi di Bekasi 2025 — Estimasi & Tips | Abadi Jaya',
    description: 'Panduan lengkap harga kanopi di Bekasi 2025. Estimasi biaya, tips memilih material, dan rekomendasi bengkel las terpercaya.',
    type: 'article',
    url: '/blog/harga-kanopi-bekasi-2025',
    images: [{
      url: '/api/og?variant=blog&title=Harga%20Kanopi%20Bekasi%202025'
    }]
  }
};

// FAQ JSON-LD untuk artikel
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Berapa harga kanopi per meter di Bekasi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Harga kanopi di Bekasi berkisar Rp 400.000 - Rp 800.000 per meter, tergantung material dan desain.'
      }
    },
    {
      '@type': 'Question',
      name: 'Material kanopi apa yang paling awet di Bekasi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Material terbaik untuk kanopi di Bekasi adalah baja ringan dengan atap polycarbonate atau spandek, serta stainless steel untuk hasil premium.'
      }
    }
  ]
};

// Article JSON-LD
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Harga Kanopi di Bekasi 2025 — Estimasi & Tips',
  description: 'Panduan lengkap harga kanopi di Bekasi 2025. Estimasi biaya, tips memilih material, dan rekomendasi bengkel las terpercaya.',
  author: {
    '@type': 'Organization',
    name: 'Abadi Jaya',
    url: 'https://abadi-jaya.vercel.app'
  },
  publisher: {
    '@type': 'Organization',
    name: 'Abadi Jaya',
    url: 'https://abadi-jaya.vercel.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://abadi-jaya.vercel.app/apple-touch-icon.png'
    }
  },
  datePublished: '2025-01-27',
  dateModified: '2025-01-27',
  mainEntityOfPage: 'https://abadi-jaya.vercel.app/blog/harga-kanopi-bekasi-2025',
  image: 'https://abadi-jaya.vercel.app/api/og?variant=blog&title=Harga%20Kanopi%20Bekasi%202025'
};

export default function HargaKanopiBekasi2025() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="faq-ld" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script id="article-ld" type="application/ld+json">
        {JSON.stringify(articleJsonLd)}
      </Script>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            <Link href="/" className="hover:underline">Beranda</Link> <span>/</span> 
            <Link href="/blog" className="hover:underline">Blog</Link> <span>/</span> 
            <span className="opacity-90">Harga Kanopi Bekasi 2025</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Harga Kanopi di Bekasi 2025 — Estimasi & Tips
          </h1>
          <p className="text-orange-100 text-lg">
            Panduan lengkap estimasi biaya kanopi di Bekasi. Tips memilih material, contoh desain, dan rekomendasi bengkel las terpercaya.
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Card className="mb-10 p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Estimasi Harga Kanopi di Bekasi 2025
            </h2>
            <p className="text-gray-700 mb-6">
              Kanopi menjadi solusi praktis untuk melindungi kendaraan dan area outdoor di Bekasi. Dengan desain yang modern dan material berkualitas, kanopi memberikan perlindungan optimal dan nilai estetika pada rumah Anda.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tabel Harga Kanopi per Meter
            </h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Material</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Atap</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Harga per Meter</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Baja Ringan</td>
                    <td className="border border-gray-300 px-4 py-2">Spandek</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">Rp 400.000</td>
                    <td className="border border-gray-300 px-4 py-2">Ekonomis, awet</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Baja Ringan</td>
                    <td className="border border-gray-300 px-4 py-2">Polycarbonate</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">Rp 500.000</td>
                    <td className="border border-gray-300 px-4 py-2">Tahan panas, modern</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Stainless Steel</td>
                    <td className="border border-gray-300 px-4 py-2">Polycarbonate</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">Rp 800.000</td>
                    <td className="border border-gray-300 px-4 py-2">Premium, elegan</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-blue-800">
                <strong>Catatan:</strong> Harga di atas sudah termasuk material, pemasangan, finishing, dan garansi pengerjaan 1 tahun. Harga dapat bervariasi tergantung desain dan kondisi lokasi.
              </p>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tips Memilih Kanopi di Bekasi
            </h3>
            <ul className="list-disc pl-6 text-gray-700 mb-8">
              <li>Pilih material sesuai kebutuhan dan budget</li>
              <li>Pastikan struktur kuat dan tahan lama</li>
              <li>Konsultasikan desain dengan ahli</li>
              <li>Gunakan jasa bengkel las terpercaya</li>
            </ul>
            <ContohProyekBlog kategori="Kanopi" area="Bekasi" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Konsultasi Gratis Kanopi di Bekasi
            </h3>
            <p className="mb-4">
              Ingin mendapatkan estimasi harga yang akurat untuk proyek kanopi Anda? Tim Abadi Jaya siap membantu dengan survey gratis ke lokasi proyek.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://wa.me/6289653754317?text=Halo%2C%20saya%20ingin%20konsultasi%20untuk%20kanopi%20di%20Bekasi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-lg transition-transform transition-colors duration-200 hover:bg-orange-700 hover:scale-[1.02]"
              >
                💬 Konsultasi Gratis
              </a>
              <Link 
                href="/layanan/kabupaten-bekasi"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-orange-600 text-orange-600 font-semibold rounded-lg transition-transform transition-colors duration-200 hover:bg-orange-50 hover:text-orange-700 hover:scale-[1.02]"
              >
                📋 Lihat Layanan
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
