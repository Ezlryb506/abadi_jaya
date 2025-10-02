import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Blog Las & Fabrikasi Besi Bekasi 2025 | Estimasi Harga, Tips, Material & Kanopi',
  description: 'Kumpulan artikel dan panduan lengkap seputar las, pagar minimalis, kanopi, teralis, railing, dan tips memilih bengkel las terpercaya di Bekasi. Update harga, material, dan inspirasi desain 2025.',
  keywords: [
    'blog bengkel las bekasi',
    'harga pagar minimalis bekasi',
    'harga kanopi bekasi',
    'harga teralis bekasi',
    'harga railing bekasi',
    'tips bengkel las bekasi',
    'estimasi harga las',
    'material besi anti karat',
    'desain pagar kanopi teralis railing',
    'bengkel las terpercaya bekasi'
  ],
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: 'Blog Las & Fabrikasi Besi Bekasi 2025 | Estimasi Harga, Tips, Material & Kanopi',
    description: 'Kumpulan artikel dan panduan lengkap seputar las, pagar minimalis, kanopi, teralis, railing, dan tips memilih bengkel las terpercaya di Bekasi. Update harga, material, dan inspirasi desain 2025.',
    type: 'website',
    url: '/blog',
    images: [
      {
        url: '/images/layanan/pagar besi - modern 1.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog Las & Fabrikasi Besi - Abadi Jaya'
      },
      {
        url: '/images/layanan/Modern Carport - Kanopi - 2.jpg',
        width: 800,
        height: 600,
        alt: 'Kanopi Carport - Abadi Jaya'
      },
      {
        url: '/images/layanan/Railing Tangga - Logam - 9.jpg',
        width: 800,
        height: 600,
        alt: 'Railing Tangga - Abadi Jaya'
      }
    ]
  }
};

const blogPosts = [
  {
    title: 'Harga Pagar Minimalis di Bekasi 2025 — Estimasi & Tips',
    slug: 'harga-pagar-minimalis-bekasi-2025',
    excerpt: 'Panduan lengkap estimasi biaya pagar minimalis di Bekasi 2025. Tips memilih material, contoh desain, dan rekomendasi bengkel las terpercaya.',
    date: '2025-01-27',
    category: 'Estimasi Harga',
    readTime: '8 min read',
    image: '/images/layanan/pagar besi - modern 1.jpg'
  },
  {
    title: 'Harga Kanopi di Bekasi 2025 — Estimasi & Tips',
    slug: 'harga-kanopi-bekasi-2025',
    excerpt: 'Update harga kanopi baja ringan, polycarbonate, dan stainless di Bekasi. Tips memilih material dan kontraktor kanopi terbaik.',
    date: '2025-01-27',
    category: 'Estimasi Harga',
    readTime: '7 min read',
    image: '/images/layanan/Modern Carport - Kanopi - 2.jpg'
  },
  {
    title: 'Harga Teralis di Bekasi 2025 — Estimasi & Tips',
    slug: 'harga-teralis-bekasi-2025',
    excerpt: 'Panduan harga teralis jendela, pintu, dan balkon di Bekasi. Pilihan material anti karat dan desain minimalis modern.',
    date: '2025-01-27',
    category: 'Estimasi Harga',
    readTime: '7 min read',
    image: '/images/layanan/Jendela - Teralis - Pagar - Modern 6.jpg'
  },
  {
    title: 'Harga Railing di Bekasi 2025 — Estimasi & Tips',
    slug: 'harga-railing-bekasi-2025',
    excerpt: 'Estimasi harga railing tangga dan balkon di Bekasi. Perbandingan material besi hollow galvanis dan stainless steel.',
    date: '2025-01-27',
    category: 'Estimasi Harga',
    readTime: '7 min read',
    image: '/images/layanan/Railing Tangga - Logam - 9.jpg'
  }
];

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  'name': 'Blog Las & Fabrikasi Besi Abadi Jaya',
  'description': 'Kumpulan artikel, tips, dan panduan seputar las, pagar, kanopi, teralis, railing, dan material besi di Bekasi.',
  'url': 'https://abadi-jaya.vercel.app/blog',
  'blogPost': blogPosts.map((post) => ({
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'url': `https://abadi-jaya.vercel.app/blog/${post.slug}`,
    'datePublished': post.date,
    'image': `https://abadi-jaya.vercel.app${post.image}`,
    'author': {
      '@type': 'Organization',
      'name': 'Abadi Jaya'
    }
  }))
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="blog-ld" type="application/ld+json">
        {JSON.stringify(blogJsonLd)}
      </Script>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-orange-100 text-sm mb-3">
            <Link href="/" className="hover:underline">Beranda</Link> <span>/</span>
            <span className="opacity-90">Blog Las & Fabrikasi Besi</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Blog Las, Pagar, Kanopi, Teralis & Railing Bekasi 2025
          </h1>
          <p className="text-orange-100 text-lg max-w-3xl">
            Temukan panduan, update harga, dan inspirasi desain terbaru seputar las, pagar minimalis, kanopi, teralis, dan railing di Bekasi. Semua artikel ditulis dengan riset SEO dan pengalaman bengkel las profesional.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Blog Posts Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Artikel Pilihan & Estimasi Harga 2025
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {blogPosts.map((post, index) => (
            <Link key={index} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all group-hover:scale-[1.02]">
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={false}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-600 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{post.date}</span>
                    <span className="text-orange-600 text-sm font-medium group-hover:underline">
                      Baca →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Konsultasi Gratis Proyek Las & Fabrikasi Besi Bekasi
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Tim ahli Abadi Jaya siap membantu mewujudkan proyek pagar, kanopi, teralis, dan railing Anda di Bekasi. Konsultasi gratis dengan estimasi harga yang akurat dan desain sesuai kebutuhan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6289653754317?text=Halo%2C%20saya%20ingin%20konsultasi%20proyek%20las%20dan%20fabrikasi%20besi%20di%20Bekasi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors hover:scale-[1.05] shadow-lg"
            >
              💬 Konsultasi Gratis
            </a>
            <Link
              href="/layanan"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors hover:scale-[1.05]"
            >
              📋 Lihat Layanan
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
