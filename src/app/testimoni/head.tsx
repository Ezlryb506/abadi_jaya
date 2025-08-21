export default function Head() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Testimoni Pelanggan Abadi Jaya',
    description: 'Kumpulan ulasan asli pelanggan tentang layanan las & fabrikasi besi Abadi Jaya.',
  };

  return (
    <>
      <title>Testimoni Pelanggan | Abadi Jaya</title>
      <meta name="description" content="Baca pengalaman asli pelanggan Abadi Jaya. Ulasan bintang dan komentar yang telah dipublikasikan." />
      <meta name="robots" content="index,follow" />
      <meta property="og:title" content="Testimoni Pelanggan | Abadi Jaya" />
      <meta property="og:description" content="Baca pengalaman asli pelanggan Abadi Jaya. Ulasan bintang dan komentar yang telah dipublikasikan." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="/testimoni" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
