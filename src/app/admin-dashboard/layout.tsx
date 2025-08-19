"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    })();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // redirect to login page
      router.replace("/login");
    } catch (err) {
      console.error(err);
      alert("Gagal logout. Coba lagi.");
    }
  };

  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: ReactNode }) => {
    // Active state: exact match for root '/admin', segment-based match for nested routes
    const active = href === '/admin-dashboard'
      ? pathname === href
      : (pathname === href || pathname.startsWith(href + '/'));
    return (
      <Link
        href={href}
        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-3 ${
          active
            ? "bg-orange-100 text-orange-700"
            : "text-gray-700 hover:bg-orange-50"
        }`}
        onClick={() => {
          // Auto-hide sidebar on mobile after menu selection
          if (window.innerWidth < 1024) {
            setOpen(false);
          }
        }}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Mobile Header Bar */}
      <div className="xl:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 bg-white rounded-lg shadow border border-gray-200"
          aria-label="Toggle Sidebar"
        >
          {open ? (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static top-16 lg:top-auto bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-lg flex flex-col py-8 px-4 transition-transform duration-300 ease-in-out h-[calc(100vh-4rem)] lg:h-auto`}>
        {/* Profile Section */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-3xl text-orange-600 font-bold mb-2">
            <span>👨‍💼</span>
          </div>
          <div className="font-semibold text-gray-800">{user?.user_metadata?.name || 'Admin'}</div>
          <div className="text-xs text-gray-500 break-all">{user?.email || 'admin@example.com'}</div>
        </div>

        <nav className="space-y-1">
        <NavItem
            href="/admin-dashboard"
            label="Laporan"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6m6 6V7M3 21h18"/></svg>}
          />
          <NavItem
            href="/admin-dashboard/products"
            label="Produk"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3.5M4 13V7a2 2 0 012-2h3.5M4 13v4a2 2 0 002 2h3.5M20 13v4a2 2 0 01-2 2h-3.5M9.5 5V3m5 2V3M4 9h16"/></svg>}
          />
          <NavItem
            href="/admin-dashboard/orders"
            label="Pesanan"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 9h18M3 15h18M3 21h18"/></svg>}
          />
          <NavItem
            href="/admin-dashboard/settings"
            label="Pengaturan"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.89 3.31.877 2.42 2.42-.458.794-.19 1.805.604 2.263 1.543.89 1.121 3.2-.604 3.2-.92 0-1.667.746-1.667 1.667 0 1.725-2.31 2.147-3.2.604a1.724 1.724 0 00-2.263-.604c-1.543.89-3.31-.877-2.42-2.42.458-.794.19-1.805-.604-2.263-1.543-.89-1.121-3.2.604-3.2.92 0 1.667-.746 1.667-1.667zM12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>}
          />
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0H6"/></svg>
            <span>Ke Beranda</span>
          </Link>
          <button onClick={handleLogout} className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition-all">
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
