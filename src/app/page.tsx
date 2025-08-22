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

      <HeroSection />
      <LayananSection />
      <KeunggulanSection />
      <CtaSection />
      <FaqSection />
    </>
  );
}
