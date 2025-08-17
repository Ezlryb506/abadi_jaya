'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/contact') return pathname === '/contact';
    return pathname === '/' && href.startsWith('#');
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo dan Nama Bengkel sebagai Link ke / */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Abadi Jaya</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <a
              href="#beranda"
              className={`transition-colors ${isActive('#beranda') ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Beranda
            </a>
            <a
              href="#layanan"
              className={`transition-colors ${isActive('#layanan') ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Layanan
            </a>
            <a
              href="#galeri"
              className={`transition-colors ${isActive('#galeri') ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Galeri
            </a>
            <Link
              href="/contact"
              className={`transition-colors ${isActive('/contact') ? 'text-orange-600 font-bold underline underline-offset-4' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Kontak
            </Link>
          </nav>
          <button 
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors transform hover:scale-105 shadow-lg"
            onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
          >
            Konsultasi
          </button>
        </div>
      </div>
    </header>
  );
}
