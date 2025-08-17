'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/contact') return pathname === '/contact';
    if (href === '/catalog') return pathname === '/catalog';
    if (href === '/login') return pathname === '/login';
    if (href === '/customer-login') return pathname === '/customer-login';
    if (href === '/gallery') return pathname === '/gallery';
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
            <Link
              href="/"
              className={`transition-colors ${isActive('/') ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Beranda
            </Link>
            <Link
              href="/catalog"
              className={`transition-colors ${isActive('/catalog') ? 'text-orange-600 font-bold underline underline-offset-4' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Katalog
            </Link>
            <Link
              href="/gallery"
              className={`transition-colors ${isActive('/gallery') ? 'text-orange-600 font-bold underline underline-offset-4' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Galeri
            </Link>
            <Link
              href="/contact"
              className={`transition-colors ${isActive('/contact') ? 'text-orange-600 font-bold underline underline-offset-4' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Kontak
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Customer Login Button */}
            <Link
              href="/customer-login"
              className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                isActive('/customer-login') 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              👤 Customer Login
            </Link>
            
            {/* Admin Login Button */}
            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                isActive('/login') 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔐 Admin Login
            </Link>
            
            {/* Konsultasi Button */}
            <button
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors transform hover:scale-105 shadow-lg"
              onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
            >
              Konsultasi
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
