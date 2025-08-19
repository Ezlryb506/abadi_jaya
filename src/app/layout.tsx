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

export const metadata: Metadata = {
  title: "Bengkel Las Abadi Jaya - Spesialis Jasa Las & Fabrikasi Besi",
  description: "Bengkel Las Abadi Jaya menyediakan jasa las dan fabrikasi besi berkualitas tinggi. Pagar, kanopi, railing tangga, pintu besi, jendela, teralis, dan stainless steel.",
  keywords: "bengkel las, jasa las, fabrikasi besi, pagar besi, kanopi, railing tangga, pintu besi, jendela besi, teralis, stainless steel",
  authors: [{ name: "Abadi Jaya" }],
  openGraph: {
    title: "Bengkel Las Abadi Jaya",
    description: "Spesialis Jasa Las & Fabrikasi Besi Berkualitas Tinggi",
    type: "website",
  },
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
