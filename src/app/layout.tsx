import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Script from 'next/script';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const isProd = process.env.NODE_ENV === 'production';

export const metadata: Metadata = {
  title: "Bengkel Las Bekasi - Abadi Jaya | Jasa Pagar & Kanopi Profesional",
  description: "Bengkel Las Abadi Jaya di Cibitung, Bekasi. Melayani jasa pembuatan pagar, kanopi, & railing untuk area Kabupaten Bekasi, Kota Bekasi, Cikarang, dan sekitarnya. Garansi pengerjaan.",
  keywords: [
    // Generic services
    "bengkel las",
    "jasa las",
    "fabrikasi besi",
    "pagar besi",
    "kanopi",
    "railing tangga",
    "pintu besi",
    "jendela besi",
    "teralis",
    "stainless steel",
    "abadi jaya",
    // Local SEO (Bekasi & sekitarnya)
    "bengkel las bekasi",
    "bengkel las cibitung",
    "bengkel las cikarang",
    "bengkel las kabupaten bekasi",
    "bengkel las kota bekasi",
    "jasa las bekasi",
    "jasa las cikarang",
    "kanopi bekasi",
    "kanopi tambun",
    "pagar besi bekasi",
    "cikarang barat",
    "cikarang selatan",
    "cikarang utara",
    "tambun selatan",
    "tambun utara",
    "setu",
    "babelan",
    "tarumajaya",
    "karangbahagia",
    "tambelang",
    "sukatani",
    "sukakarya",
    "pebayuran",
    "kedungwaringin",
    "serang baru",
    "bojongmangu",
    "cabangbungin",
  ],
  authors: [{ name: "Abadi Jaya" }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: isProd,
    follow: isProd,
    googleBot: {
      index: isProd,
      follow: isProd,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: "Bengkel Las Bekasi - Abadi Jaya | Jasa Pagar & Kanopi Profesional",
    description: "Bengkel Las Abadi Jaya di Cibitung, Bekasi. Melayani jasa pembuatan pagar, kanopi, & railing untuk area Kabupaten Bekasi, Kota Bekasi, Cikarang, dan sekitarnya.",
    type: "website",
    url: siteUrl,
    siteName: "Bengkel Las Abadi Jaya",
    locale: 'id_ID',
    images: [
      {
        url: "/api/og?title=Bengkel%20Las%20Abadi%20Jaya%20-%20Spesialis%20Jasa%20Las%20%26%20Fabrikasi%20Besi",
        width: 1200,
        height: 630,
        alt: "Bengkel Las Abadi Jaya - Spesialis Jasa Las & Fabrikasi Besi",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bengkel Las Bekasi - Abadi Jaya | Jasa Pagar & Kanopi Profesional",
    description: "Bengkel Las Abadi Jaya di Cibitung, Bekasi. Melayani jasa pembuatan pagar, kanopi, & railing untuk area Kabupaten Bekasi dan sekitarnya.",
    images: ['/api/og?title=Bengkel%20Las%20Abadi%20Jaya%20-%20Spesialis%20Jasa%20Las%20%26%20Fabrikasi%20Besi'],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Derive Supabase storage host for preconnect/dns-prefetch
  let supabaseHost: string | undefined;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    supabaseHost = url ? new URL(url).hostname : undefined;
  } catch {
    supabaseHost = undefined;
  }
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {supabaseHost && (
          <>
            <link rel="preconnect" href={`https://${supabaseHost}`} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
          </>
        )}
        {/* Fallback meta description to ensure Lighthouse detection; page-level metadata can override */}
        <meta
          name="description"
          content="Bengkel Las Abadi Jaya di Cibitung, Bekasi. Melayani jasa pembuatan pagar, kanopi, & railing untuk area Kabupaten Bekasi, Kota Bekasi, Cikarang, dan sekitarnya. Garansi pengerjaan."
        />
        {/* Non-blocking load for animations to reduce critical CSS size */}
        <link rel="preload" href="/styles/animations.css" as="style" />
        <Script id="load-animations-css" strategy="afterInteractive">
          {`
            (function(){
              try {
                if (document.getElementById('animations-css')) return;
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = '/styles/animations.css';
                l.media = 'all';
                l.id = 'animations-css';
                document.head.appendChild(l);
              } catch(e) { /* noop */ }
            })();
          `}
        </Script>
        <noscript>
          <style>{`@import url('/styles/animations.css');`}</style>
        </noscript>

        {/* Load other non-critical CSS (forms and ui helpers) non-blocking */}
        <link rel="preload" href="/styles/forms.css" as="style" />
        <link rel="preload" href="/styles/ui.css" as="style" />
        <Script id="load-forms-ui-css" strategy="afterInteractive">
          {`
            (function(){
              try {
                var add = function(id, href){
                  if (document.getElementById(id)) return;
                  var l = document.createElement('link');
                  l.rel = 'stylesheet';
                  l.href = href;
                  l.id = id;
                  document.head.appendChild(l);
                };
                add('forms-css','/styles/forms.css');
                add('ui-css','/styles/ui.css');
              } catch(e) { /* noop */ }
            })();
          `}
        </Script>
        <noscript>
          <style>{`@import url('/styles/forms.css');`}</style>
          <style>{`@import url('/styles/ui.css');`}</style>
        </noscript>
        {/* JSON-LD: WebSite dengan SearchAction untuk membantu mesin pencari memahami fitur pencarian */}
        <Script id="website-searchaction" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: siteUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/catalog?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          })}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header Global */}
        <Header />

        {/* Main Content */}
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 [overflow-x:clip] pt-20 lg:pt-20">
          <div className="min-w-0 [overflow-x:clip]">
            {children}
            <Toaster richColors />
          </div>
        </main>

        {/* Footer Global */}
        <Footer />

        {/* Vercel Web Analytics (aktif hanya di production) */}
        {isProd && <Analytics />}
      </body>
    </html>
  );
}
