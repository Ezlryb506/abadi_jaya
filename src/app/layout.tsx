import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
  title: "Bengkel Las Abadi Jaya - Spesialis Jasa Las & Fabrikasi Besi",
  description: "Bengkel Las Abadi Jaya menyediakan jasa las dan fabrikasi besi berkualitas tinggi. Pagar, kanopi, railing tangga, pintu besi, jendela, teralis, dan stainless steel.",
  keywords: [
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
    title: "Bengkel Las Abadi Jaya",
    description: "Spesialis Jasa Las & Fabrikasi Besi Berkualitas Tinggi",
    type: "website",
    url: siteUrl,
    siteName: "Bengkel Las Abadi Jaya",
    locale: 'id_ID',
    images: [
      {
        url: "/api/og", // TODO: akan dibuat di tahap berikutnya
        width: 1200,
        height: 630,
        alt: "Bengkel Las Abadi Jaya - Spesialis Jasa Las & Fabrikasi Besi",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bengkel Las Abadi Jaya - Spesialis Jasa Las & Fabrikasi Besi",
    description: "Jasa las & fabrikasi besi: pagar, kanopi, railing, pintu, teralis, stainless.",
    images: ['/api/og'], // sinkron dengan OG
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
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header Global */}
        <Header />

        {/* Main Content */}
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div>
            {children}
            <Toaster richColors />
          </div>
        </main>

        {/* Footer Global */}
        <Footer />
      </body>
    </html>
  );
}
