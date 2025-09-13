'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Ganti mounted -> isLoading untuk placeholder terkontrol (hindari SSR null)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      if (user) {
        const { data } = await supabase
          .from('admin_users')
          .select('auth_user_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        setIsAdmin(Boolean(data));
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      await init();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // removed unused logout function to satisfy lint

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/contact') return pathname === '/contact';
    // Treat /catalog and any sub-route (/catalog/...)
    if (href === '/catalog') return pathname === '/catalog' || pathname.startsWith('/catalog/');
    if (href === '/layanan') return pathname === '/layanan' || pathname.startsWith('/layanan/');
    if (href === '/login') return pathname === '/login';
    if (href === '/testimoni') return pathname === '/testimoni';
    return false;
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo dan Nama Bengkel sebagai Link ke / */}
          <Link href="/" className="flex items-center space-x-2 group" aria-label="Abadi Jaya - Beranda">
            <Image
              src="/icons/icon-192x192.png"
              alt="Logo Abadi Jaya"
              width={40}
              height={40}
              priority
              className="rounded-lg group-hover:scale-110 transition-transform shadow-sm"
            />
            <span className="text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Abadi Jaya</span>
          </Link>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/') 
                  ? 'bg-orange-50 text-orange-500 border-2 border-orange-200 shadow-md' 
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 border-2 border-transparent shadow-md hover:scale-[1.05]'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/catalog"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/catalog') 
                  ? 'bg-orange-50 text-orange-500 border-2 border-orange-200 shadow-md' 
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 border-2 border-transparent shadow-md hover:scale-[1.05]'
              }`}
            >
              Katalog
            </Link>
            <Link
              href="/layanan"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/layanan') 
                  ? 'bg-orange-50 text-orange-500 border-2 border-orange-200 shadow-md' 
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 border-2 border-transparent shadow-md hover:scale-[1.05]'
              }`}
            >
              Layanan
            </Link>
            <Link
              href="/testimoni"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/testimoni') 
                  ? 'bg-orange-50 text-orange-500 border-2 border-orange-200 shadow-md' 
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 border-2 border-transparent shadow-md hover:scale-[1.05]'
              }`}
            >
              Testimoni
            </Link>
            <Link
              href="/contact"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/contact') 
                  ? 'bg-orange-50 text-orange-500 border-2 border-orange-200 shadow-md' 
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 border-2 border-transparent shadow-md hover:scale-[1.05]'
              }`}
            >
              Kontak
            </Link>
          </nav>
          
          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoading ? (
              <div className="h-10 w-40 rounded-lg bg-gray-100 animate-pulse border-2 border-gray-200" aria-hidden />
            ) : (
              <>
                {!userEmail && (
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md border-2 ${
                      isActive('/login') 
                        ? 'bg-orange-600 text-white border-orange-600 shadow-lg' 
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                    }`}
                  >
                    🔐 Masuk atau Daftar
                  </Link>
                )}
                {userEmail && (
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Link href="/admin-dashboard" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium border-2 border-gray-200 shadow-md">Dashboard</Link>
                    )}
                  </div>
                )}
                {userEmail && !isAdmin && (
                  <Link
                    href="/user-dashboard"
                    className={`px-3 py-2 rounded-lg font-medium transition-all border-2 shadow-md ${
                      pathname === '/user-dashboard'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:border-blue-300'
                    }`}
                  >
                    Dashboard Saya
                  </Link>
                )}
              </>
            )}

            {/* Konsultasi button removed on desktop to prevent overlap */}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border-2 border-gray-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            title={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div id="mobile-nav" className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col items-center space-y-3 mb-4">
              <Link
                href="/"
                className={`inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg font-medium transition-colors border-2 ${
                  isActive('/') 
                    ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-md' 
                    : 'text-gray-600 hover:bg-orange-50 border-2 border-orange-200 shadow-md'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="/catalog"
                className={`inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg font-medium transition-colors border-2 ${
                  isActive('/catalog') 
                    ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-md' 
                    : 'text-gray-600 hover:bg-orange-50 border-2 border-orange-200 shadow-md'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Katalog
              </Link>
              <Link
                href="/layanan"
                className={`inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg font-medium transition-colors border-2 ${
                  isActive('/layanan') 
                    ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-md' 
                    : 'text-gray-600 hover:bg-orange-50 border-2 border-orange-200 shadow-md'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Layanan
              </Link>
              <Link
                href="/testimoni"
                className={`inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg font-medium transition-colors border-2 ${
                  isActive('/testimoni') 
                    ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-md' 
                    : 'text-gray-600 hover:bg-orange-50 border-2 border-orange-200 shadow-md'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimoni
              </Link>
              <Link
                href="/contact"
                className={`inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg font-medium transition-colors border-2 ${
                  isActive('/contact') 
                    ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-md' 
                    : 'text-gray-600 hover:bg-orange-50 border-2 border-orange-200 shadow-md'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Kontak
              </Link>
            </nav>

            {/* Mobile Action Buttons (centered) */}
            <div className="space-y-3 flex flex-col items-center">
              {isLoading ? (
                <div className="inline-flex w-11/12 max-w-xs h-10 rounded-lg bg-gray-100 animate-pulse border-2 border-gray-200" aria-hidden />
              ) : (
                <>
                  {!userEmail && (
                    <Link
                      href="/login"
                      className={`inline-flex w-11/12 max-w-xs justify-center text-center px-4 py-2 rounded-lg font-medium transition-all border-2 shadow-md ${
                        isActive('/login') 
                          ? 'bg-orange-600 text-white border-orange-600 shadow-lg' 
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-300 shadow-md'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🔐 Masuk atau Daftar
                    </Link>
                  )}
                  {userEmail && (
                    <div className="space-y-2 flex flex-col items-center">
                      {isAdmin && (
                        <Link 
                          href="/admin-dashboard" 
                          className="inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium border-2 border-gray-200 shadow-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                    </div>
                  )}
                  {userEmail && !isAdmin && (
                    <Link
                      href="/user-dashboard"
                      className={`inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg font-medium transition-all border-2 shadow-md ${
                        pathname === '/user-dashboard'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                          : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:border-blue-300'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard Saya
                    </Link>
                  )}
                </>
              )}

              <button
                className="w-11/12 max-w-xs bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-500 hover:border-orange-600"
                onClick={() => {
                  window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank');
                  setMobileMenuOpen(false);
                }}
              >
                Konsultasi
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
