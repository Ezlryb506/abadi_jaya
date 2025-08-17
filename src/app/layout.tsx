import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

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
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header Global */}
        <Header />

        {/* Main Content */}
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </main>

        {/* Footer Global */}
        <footer id="kontak" className="bg-gray-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <h3 className="text-2xl font-bold">Abadi Jaya</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Spesialis jasa las dan fabrikasi besi berkualitas tinggi dengan pengalaman bertahun-tahun.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">
                    <span className="text-xl">📱</span>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">
                    <span className="text-xl">📘</span>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">
                    <span className="text-xl">📷</span>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Layanan</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Pagar Besi</li>
                  <li>Kanopi & Carport</li>
                  <li>Railing Tangga</li>
                  <li>Pintu Besi</li>
                  <li>Jendela & Teralis</li>
                  <li>Stainless Steel</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Kontak</h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span>📍</span>
                    <span>Jl. Contoh No. 123, Jakarta</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📞</span>
                    <span>+62 896-5375-4317</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✉️</span>
                    <span>info@abadi-jaya.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🕒</span>
                    <span>Senin - Sabtu: 08:00 - 17:00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
              <p>&copy; 2024 Bengkel Las Abadi Jaya. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
