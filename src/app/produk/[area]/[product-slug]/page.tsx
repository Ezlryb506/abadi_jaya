import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { areaAll } from '@/lib/areaLayanan';
import { supabaseServer } from '@/lib/supabaseServer';
import { slugify } from '@/lib/slug';
import Link from 'next/link';
import Script from 'next/script';
import { formatRupiah } from '@/lib/format';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ImageZoomLightbox from '@/components/ui/ImageZoomLightbox';

type RouteParams = { area: string; 'product-slug': string };
type Props = { params: Promise<RouteParams> };

// Validasi area
function validateArea(area: string): string | null {
  const normalizedArea = area.toLowerCase().replace(/[^a-z0-9]/g, '');
  return areaAll.find(a => 
    slugify(a).toLowerCase() === normalizedArea || 
    a.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedArea
  ) || null;
}

// Parse product ID dari slug
function parseProductId(slug: string): number | null {
  const match = slug.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

// Fetch produk berdasarkan ID
async function getProduct(id: number) {
  const { data: product, error } = await supabaseServer
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
    .eq('id', id)
    .or('is_active.eq.true,is_active.is.null')
    .single();

  if (error || !product) return null;

  return {
    id: Number(product.id),
    name: String(product.name),
    description: product.description || '',
    price: typeof product.price === 'number' ? product.price : null,
    image: product.image_url as string | null,
    category: Array.isArray(product.product_categories) 
      ? (product.product_categories[0]?.name || 'Lainnya')
      : ((product.product_categories as { name?: string } | null)?.name || 'Lainnya'),
    tags: Array.isArray(product.tags) ? product.tags : [],
  };
}

// Generate metadata dinamis
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, 'product-slug': productSlug } = await params;
  const validArea = validateArea(area);
  const productId = parseProductId(productSlug);
  
  if (!validArea || !productId) {
    return {
      title: 'Produk Tidak Ditemukan | Abadi Jaya',
      description: 'Produk tidak ditemukan. Lihat katalog produk kami.',
    };
  }

  const product = await getProduct(productId);
  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Abadi Jaya',
      description: 'Produk tidak ditemukan. Lihat katalog produk kami.',
    };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = `/produk/${slugify(validArea)}/${productSlug}`;
  const canonicalAbs = site ? new URL(canonical, site).toString() : canonical;

  // Generate long-tail keywords
  const longTailKeywords = [
    `${product.name.toLowerCase()} di ${validArea}`,
    `harga ${product.name.toLowerCase()} ${validArea}`,
    `jasa ${product.name.toLowerCase()} ${validArea}`,
    `bengkel las ${product.name.toLowerCase()} ${validArea}`,
    `kustom ${product.name.toLowerCase()} ${validArea}`,
    `modern ${product.name.toLowerCase()} ${validArea}`,
    `minimalis ${product.name.toLowerCase()} ${validArea}`,
    validArea.toLowerCase(),
    product.category.toLowerCase(),
    'bekasi',
    'cikarang',
    'tambun',
    'cibitung'
  ];

  return {
    title: `${product.name} di ${validArea} | Abadi Jaya`,
    description: `${product.name} berkualitas tinggi di ${validArea}. ${product.description || 'Kustomisasi sesuai kebutuhan, harga transparan, konsultasi gratis.'}`,
    keywords: longTailKeywords,
    alternates: { canonical: canonicalAbs },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${product.name} di ${validArea} | Abadi Jaya`,
      description: `${product.name} berkualitas tinggi di ${validArea}. Kustomisasi sesuai kebutuhan, harga transparan.`,
      type: 'website',
      url: canonicalAbs,
      images: product.image ? [{
        url: product.image
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} di ${validArea} | Abadi Jaya`,
      description: `${product.name} berkualitas tinggi di ${validArea}. Kustomisasi sesuai kebutuhan.`,
      images: product.image ? [product.image] : undefined,
    },
  };
}

// Generate static params
export async function generateStaticParams() {
  const { data: products } = await supabaseServer
    .from('products')
    .select('id, name')
    .or('is_active.eq.true,is_active.is.null')
    .limit(100); // Batasi untuk performa build
  
  if (!products) return [];
  
  const params: Array<{ area: string; 'product-slug': string }> = [];
  
  for (const area of areaAll) {
    for (const product of products) {
      params.push({
        area: slugify(area),
        'product-slug': `${product.id}-${slugify(product.name)}`
      });
    }
  }
  
  return params;
}

export default async function ProductAreaPage({ params }: Props) {
  const { area, 'product-slug': productSlug } = await params;
  const validArea = validateArea(area);
  const productId = parseProductId(productSlug);
  
  if (!validArea || !productId) {
    notFound();
  }

  const product = await getProduct(productId);
  if (!product) {
    notFound();
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const currentUrl = `/produk/${slugify(validArea)}/${productSlug}`;
  const currentAbs = site ? new URL(currentUrl, site).toString() : currentUrl;

  // JSON-LD untuk Product
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    keywords: product.tags.join(', '),
    brand: {
      '@type': 'Organization',
      name: 'Abadi Jaya',
      areaServed: validArea,
    },
    seller: {
      '@type': 'Organization',
      name: 'Abadi Jaya',
      areaServed: validArea,
    },
    offers: product.price ? {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      areaServed: {
        '@type': 'City',
        name: validArea
      }
    } : undefined,
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: site || '/' },
      { '@type': 'ListItem', position: 2, name: 'Katalog', item: site ? new URL('/catalog', site).toString() : '/catalog' },
      { '@type': 'ListItem', position: 3, name: validArea, item: site ? new URL(`/layanan/${slugify(validArea)}`, site).toString() : `/layanan/${slugify(validArea)}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: currentAbs }
    ]
  };

  // Determine if Next/Image should use unoptimized
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let allowHost: string | undefined;
  try { allowHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined; } catch { allowHost = undefined; }
  let imgHost: string | undefined;
  try { imgHost = product.image ? new URL(product.image).hostname : undefined; } catch { imgHost = undefined; }
  const useUnoptimized = Boolean(product.image && allowHost && imgHost && imgHost !== allowHost);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <Script id="product-ld" type="application/ld+json">
        {JSON.stringify(productJsonLd)}
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
            <Link href={`/layanan/${slugify(validArea)}`} className="hover:underline">{validArea}</Link> <span>/</span>
            <span className="opacity-90">{product.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {product.name} di {validArea}
          </h1>
          <p className="text-orange-100 text-lg max-w-3xl">
            {product.description || `Produk ${product.name.toLowerCase()} berkualitas tinggi di ${validArea} dengan kustomisasi sesuai kebutuhan.`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <Card className="p-4 md:p-6">
              {product.image ? (
                <ImageZoomLightbox
                  src={product.image}
                  alt={product.name}
                  sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 50vw, 100vw"
                  priority
                  unoptimized={useUnoptimized}
                  quality={95}
                  containerClassName="w-full max-h-[75vh]"
                  imageClassName="object-contain"
                />
              ) : (
                <div className="relative rounded-xl overflow-hidden aspect-[3/2] max-h-[75vh] flex items-center justify-center text-8xl">🧰</div>
              )}
            </Card>
          </div>

          {/* Detail Section */}
          <div>
            <Card className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-3">
                {product.price ? formatRupiah(product.price) : 'Hubungi Kami'}
              </div>
              
              {/* Badges */}
              <div className="mb-5">
                <div className="flex flex-wrap gap-2" aria-label="Informasi penting">
                  <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 select-none">
                    <span aria-hidden>✔️</span>
                    <span>Bisa Kustom</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 select-none">
                    <span aria-hidden>📍</span>
                    <span>Melayani {validArea}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 select-none">
                    <span aria-hidden>💱</span>
                    <span>Harga Dapat Berubah</span>
                  </span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-5">
                {product.description || 'Deskripsi belum tersedia.'}
              </p>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="mb-5" aria-label="Tag produk">
                  <div className="text-sm text-gray-500 mb-2">Tag:</div>
                  <ul className="flex flex-wrap gap-2" role="list">
                    {product.tags.map((tag) => (
                      <li key={tag} role="listitem">
                        <Link
                          href={`/catalog?q=${encodeURIComponent(tag)}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-sm hover:bg-orange-100 hover:border-orange-300 transition-colors"
                          prefetch={false}
                        >
                          <span className="text-orange-500">#</span>
                          <span>{tag}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="lg" className="flex-1">
                  📞 Hubungi Sekarang
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  💬 Konsultasi Gratis
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Produk {product.category} Lainnya di {validArea}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Placeholder untuk produk terkait */}
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-semibold text-lg mb-2">Produk Terkait</h3>
              <p className="text-gray-600 text-sm mb-4">
                Lihat produk {product.category.toLowerCase()} lainnya di {validArea}
              </p>
              <Link href={`/catalog/?category=${product.category}`}>
                <Button variant="outline" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center mt-10">
          <h2 className="text-2xl font-bold mb-4">
            Tertarik dengan {product.name} di {validArea}?
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Konsultasi gratis untuk proyek {product.name.toLowerCase()} Anda di {validArea}. 
            Tim kami siap membantu mewujudkan desain yang Anda inginkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ghost" size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              📞 Hubungi Sekarang
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600">
              💬 Konsultasi Gratis
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
