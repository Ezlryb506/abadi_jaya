import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Harga Pagar Minimalis di Bekasi 2025 — Estimasi & Tips | Abadi Jaya',
  description: 'Panduan lengkap harga pagar minimalis di Bekasi 2025. Estimasi biaya, tips memilih material, dan rekomendasi bengkel las terpercaya.',
  keywords: [
    'harga pagar minimalis bekasi',
    'estimasi biaya pagar besi bekasi',
    'bengkel las pagar minimalis bekasi',
    'jasa pagar besi bekasi',
    'pagar minimalis modern bekasi',
    'harga pagar besi per meter bekasi',
    'kontraktor pagar bekasi'
  ],
  alternates: {
    canonical: '/blog/harga-pagar-minimalis-bekasi-2025'
  },
  openGraph: {
    title: 'Harga Pagar Minimalis di Bekasi 2025 — Estimasi & Tips | Abadi Jaya',
    description: 'Panduan lengkap harga pagar minimalis di Bekasi 2025. Estimasi biaya, tips memilih material, dan rekomendasi bengkel las terpercaya.',
    type: 'article',
    url: '/blog/harga-pagar-minimalis-bekasi-2025',
    images: [{
      url: '/api/og?variant=blog&title=Harga%20Pagar%20Minimalis%20Bekasi%202025'
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
      name: 'Berapa harga pagar minimalis per meter di Bekasi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Harga pagar minimalis di Bekasi berkisar Rp 350.000 - Rp 750.000 per meter, tergantung material dan kompleksitas desain. Besi hollow galvanis mulai Rp 350.000/meter, sedangkan stainless steel 316 bisa mencapai Rp 750.000/meter.'
      }
    },
    {
      '@type': 'Question',
      name: 'Material apa yang paling cocok untuk pagar minimalis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Material terbaik untuk pagar minimalis adalah besi hollow galvanis dengan ketebalan 1.2-1.5mm, atau stainless steel 304 untuk area yang lebih terpapar cuaca.'
      }
    },
    {
      '@type': 'Question',
      name: 'Berapa lama pengerjaan pagar minimalis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pengerjaan pagar minimalis biasanya membutuhkan waktu 3-5 hari untuk area 20-30 meter, tergantung kompleksitas desain dan kondisi lokasi.'
      }
    }
  ]
};

// Article JSON-LD
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Harga Pagar Minimalis di Bekasi 2025 — Estimasi & Tips',
  description: 'Panduan lengkap harga pagar minimalis di Bekasi 2025. Estimasi biaya, tips memilih material, dan rekomendasi bengkel las terpercaya.',
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
  mainEntityOfPage: 'https://abadi-jaya.vercel.app/blog/harga-pagar-minimalis-bekasi-2025',
  image: 'https://abadi-jaya.vercel.app/api/og?variant=blog&title=Harga%20Pagar%20Minimalis%20Bekasi%202025'
};

export default function HargaPagarMinimalisBekasi2025() {
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
            <span className="opacity-90">Harga Pagar Minimalis Bekasi 2025</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Harga Pagar Minimalis di Bekasi 2025 — Estimasi & Tips
          </h1>
          <p className="text-orange-100 text-lg">
            Panduan lengkap estimasi biaya pagar minimalis di Bekasi. Tips memilih material, 
            contoh desain, dan rekomendasi bengkel las terpercaya.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Artikel Konten */}
        <Card className="mb-10 p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Estimasi Harga Pagar Minimalis di Bekasi 2025
            </h2>
            
            <p className="text-gray-700 mb-6">
              Pagar minimalis menjadi pilihan populer untuk rumah modern di Bekasi. 
              Dengan desain yang clean dan elegan, pagar minimalis memberikan kesan modern 
              sekaligus keamanan yang optimal. Berikut adalah panduan lengkap estimasi harga 
              pagar minimalis di Bekasi tahun 2025.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tabel Harga Pagar Minimalis per Meter
            </h3>
            
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Material</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Ketebalan</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Harga per Meter</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Besi Hollow Galvanis</td>
                    <td className="border border-gray-300 px-4 py-2">1.2mm</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">Rp 350.000</td>
                    <td className="border border-gray-300 px-4 py-2">Standar, tahan karat</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Besi Hollow Galvanis</td>
                    <td className="border border-gray-300 px-4 py-2">1.5mm</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">Rp 450.000</td>
                    <td className="border border-gray-300 px-4 py-2">Lebih kuat, premium</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Stainless Steel 304</td>
                    <td className="border border-gray-300 px-4 py-2">1.0mm</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">Rp 650.000</td>
                    <td className="border border-gray-300 px-4 py-2">Anti karat, premium</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Stainless Steel 316</td>
                    <td className="border border-gray-300 px-4 py-2">1.0mm</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">Rp 750.000</td>
                    <td className="border border-gray-300 px-4 py-2">Super anti karat, marine grade</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-yellow-800">
                <strong>Catatan:</strong> Harga di atas sudah termasuk material, pemasangan, 
                finishing powder coating, dan garansi pengerjaan 1 tahun. Harga dapat bervariasi 
                tergantung kompleksitas desain dan kondisi lokasi.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Faktor yang Mempengaruhi Harga Pagar Minimalis
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-orange-800">1. Material</h4>
                <ul className="text-orange-700 space-y-2">
                  <li>• Besi hollow galvanis (paling ekonomis)</li>
                  <li>• Stainless steel 304 (tahan karat)</li>
                  <li>• Stainless steel 316 (marine grade)</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-blue-800">2. Desain</h4>
                <ul className="text-blue-700 space-y-2">
                  <li>• Desain sederhana (standar)</li>
                  <li>• Desain custom (premium)</li>
                  <li>• Detail ornamen (luxury)</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-green-800">3. Finishing</h4>
                <ul className="text-green-700 space-y-2">
                  <li>• Powder coating (standar)</li>
                  <li>• Cat automotive (premium)</li>
                  <li>• Chrome plating (luxury)</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-purple-800">4. Lokasi</h4>
                <ul className="text-purple-700 space-y-2">
                  <li>• Akses mudah (standar)</li>
                  <li>• Akses terbatas (+10%)</li>
                  <li>• Area terpencil (+20%)</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tips Memilih Bengkel Las Terpercaya di Bekasi
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Survey Gratis</h4>
                  <p className="text-gray-700">Pastikan bengkel las menyediakan survey gratis untuk mengukur dan menganalisis kondisi lokasi.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Garansi Pengerjaan</h4>
                  <p className="text-gray-700">Pilih bengkel yang memberikan garansi minimal 1 tahun untuk pengerjaan dan material.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Portfolio & Testimoni</h4>
                  <p className="text-gray-700">Lihat portfolio proyek sebelumnya dan baca testimoni pelanggan untuk memastikan kualitas.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Harga Transparan</h4>
                  <p className="text-gray-700">Pastikan estimasi harga detail dan transparan, tanpa biaya tersembunyi.</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Contoh Proyek Pagar Minimalis di Bekasi
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-4xl">🏠</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Pagar Minimalis Modern</h4>
                  <p className="text-sm text-gray-600 mb-2">Lokasi: Cikarang, Bekasi</p>
                  <p className="text-sm text-gray-600 mb-2">Material: Besi Hollow 1.5mm</p>
                  <p className="text-orange-600 font-semibold">Rp 450.000/meter</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-4xl">🏡</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Pagar Stainless Premium</h4>
                  <p className="text-sm text-gray-600 mb-2">Lokasi: Tambun, Bekasi</p>
                  <p className="text-sm text-gray-600 mb-2">Material: Stainless Steel 304</p>
                  <p className="text-orange-600 font-semibold">Rp 650.000/meter</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-3">Konsultasi Gratis Pagar Minimalis di Bekasi</h3>
              <p className="mb-4">
                Ingin mendapatkan estimasi harga yang akurat untuk proyek pagar minimalis Anda? 
                Tim Abadi Jaya siap membantu dengan survey gratis ke lokasi proyek.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://wa.me/6289653754317?text=Halo%2C%20saya%20ingin%20konsultasi%20untuk%20pagar%20minimalis%20di%20Bekasi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors hover:scale-[1.05] shadow-lg"
                >
                  💬 Konsultasi Gratis
                </a>
                <Link 
                  href="/layanan/kabupaten-bekasi"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors hover:scale-[1.05]"
                >
                  📋 Lihat Layanan
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Related Articles */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Artikel Terkait
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/layanan/kota-bekasi" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg hover:shadow-lg transition-all group-hover:scale-[1.02]">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-600">
                  Jasa Las & Fabrikasi di Kota Bekasi
                </h3>
                <p className="text-gray-600 text-sm">
                  Layanan lengkap bengkel las di Kota Bekasi dengan tim berpengalaman dan kualitas terjamin.
                </p>
              </div>
            </Link>
            
            <Link href="/layanan/kabupaten-bekasi" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg hover:shadow-lg transition-all group-hover:scale-[1.02]">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600">
                  Layanan Las di Kabupaten Bekasi
                </h3>
                <p className="text-gray-600 text-sm">
                  Melayani seluruh wilayah Kabupaten Bekasi dengan harga kompetitif dan kualitas premium.
                </p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}