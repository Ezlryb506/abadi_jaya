"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Normalize to non-null string to satisfy TS when doing string ops
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const u = data?.user ?? null;
        setUser(u);

        // 1) Cek membership admin via tabel admin_users (lebih akurat sesuai skema DB)
        let isAdminByTable = false;
        if (u?.id) {
          const { count, error } = await supabase
            .from('admin_users')
            .select('auth_user_id', { count: 'exact', head: true })
            .eq('auth_user_id', u.id);
          if (error) {
            // optional: handle silently, fallback checks below will run
          }
          isAdminByTable = (count ?? 0) > 0;
        }

        // 2) Fallback: cek metadata dengan type guard aman (tanpa any)
        const userMeta = ((): Record<string, unknown> | null => {
          const m = u?.user_metadata as unknown;
          return typeof m === 'object' && m !== null ? (m as Record<string, unknown>) : null;
        })();
        const appMeta = ((): Record<string, unknown> | null => {
          const m = u?.app_metadata as unknown;
          return typeof m === 'object' && m !== null ? (m as Record<string, unknown>) : null;
        })();

        const userMetaRole = userMeta && 'role' in userMeta && typeof userMeta.role === 'string' ? (userMeta.role as string) : undefined;
        const appMetaRoles = appMeta && 'roles' in appMeta && Array.isArray(appMeta.roles) ? (appMeta.roles as unknown as string[]) : undefined;
        const appMetaRole = appMeta && 'role' in appMeta && typeof appMeta.role === 'string' ? (appMeta.role as string) : undefined;

        const isAdminMeta = userMetaRole === 'admin';
        const isAdminAppRoles = Array.isArray(appMetaRoles) && appMetaRoles.includes('admin');
        const isAdminAppRole = appMetaRole === 'admin';

        const isAdmin = !!u && (isAdminByTable || isAdminMeta || isAdminAppRoles || isAdminAppRole);

        if (!u) {
          setAuthorized(false);
          router.replace("/login?next=" + encodeURIComponent(pathname || "/admin-dashboard"));
        } else if (!isAdmin) {
          setAuthorized(false);
          router.replace("/login?next=" + encodeURIComponent(pathname || "/admin-dashboard"));
        } else {
          setAuthorized(true);
        }
      } catch {
        setAuthorized(false);
        router.replace("/login?next=" + encodeURIComponent(pathname || "/admin-dashboard"));
      } finally {
        setAuthChecked(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // redirect to login page
      router.replace("/login");
    } catch {
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

  // Loading / Guard state: cegah flash konten admin sebelum otorisasi
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 border-2 border-orange-300 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-600">Memeriksa akses admin...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-white">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Mengalihkan...</h2>
          <p className="text-sm text-gray-600">Anda tidak memiliki akses. Mengarahkan ke halaman login.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-orange-50 to-white overflow-x-hidden [overflow-x:clip]">
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
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static top-16 lg:top-auto bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-lg flex flex-col py-8 px-4 transition-transform duration-300 ease-in-out h-[calc(100vh-4rem)] lg:h-auto [contain:paint]`}>
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
            href="/admin-dashboard/reviews"
            label="Ulasan"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.175 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.98 8.72c-.783-.57-.38-1.81.588-1.81H8.03a1 1 0 00.95-.69l1.07-3.292z"/></svg>}
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
      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
