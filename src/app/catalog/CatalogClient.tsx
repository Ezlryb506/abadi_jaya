"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { slugify } from '@/lib/slug';

export interface ProductUI {
  id: number;
  name: string;
  category: string;
  description: string;
  priceText: string;
  image: string;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
}

export default function CatalogClient({
  initialProducts,
  categories: initialCategories,
  total,
  page,
  pageSize,
  initialCategory,
  initialQuery,
  categoryDescription,
}: {
  initialProducts: ProductUI[];
  categories: string[];
  total: number;
  page: number;
  pageSize: number;
  initialCategory: string;
  initialQuery: string;
  categoryDescription?: string;
}) {
  const [categories] = useState<string[]>(['Semua', ...initialCategories.filter((c) => c !== 'Semua')]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Semua');
  // applied query (used for fetching/navigation)
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  // input buffer so fast typing won't navigate
  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  // Gunakan data produk dari server langsung dari props agar berubah saat URL/props berubah
  const products: ProductUI[] = initialProducts;
  const [user, setUser] = useState<User | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [skeletonVisible, setSkeletonVisible] = useState(false); // anti-flicker control
  const router = useRouter();
  const initialCategoryRef = useRef(initialCategory || 'Semua');
  const initialQueryRef = useRef(initialQuery || '');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const categorySelectRef = useRef<HTMLSelectElement | null>(null);
  const filterSectionRef = useRef<HTMLDivElement | null>(null);
  const navStartRef = useRef<number | null>(null);

  // Determine how many columns are visible (to apply priority to first-row images)
  const [cols, setCols] = useState<number>(4);
  const [isSlowEnv, setIsSlowEnv] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqXl = window.matchMedia('(min-width: 1280px)'); // xl: 4 cols
    const mqLg = window.matchMedia('(min-width: 1024px)'); // lg: 3 cols
    const mqMd = window.matchMedia('(min-width: 768px)');  // md: 2 cols
    const update = () => {
      const c = mqXl.matches ? 4 : mqLg.matches ? 3 : mqMd.matches ? 2 : 1;
      setCols(c);
    };
    update();
    // Subscribe to changes
    try {
      mqXl.addEventListener?.('change', update);
      mqLg.addEventListener?.('change', update);
      mqMd.addEventListener?.('change', update);
      return () => {
        mqXl.removeEventListener?.('change', update);
        mqLg.removeEventListener?.('change', update);
        mqMd.removeEventListener?.('change', update);
      };
    } catch {
      // Fallback for older browsers
      mqXl.addListener?.(update);
      mqLg.addListener?.(update);
      mqMd.addListener?.(update);
      return () => {
        mqXl.removeListener?.(update);
        mqLg.removeListener?.(update);
        mqMd.removeListener?.(update);
      };
    }
  }, []);

  // Deteksi kondisi koneksi lambat / data saver untuk menunda prefetch berat (mobile LCP)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      // Touch device asumsi mobile
      const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
      // Ketikkan tipe aman untuk Network Information API agar menghindari any
      type Conn = { effectiveType?: string; saveData?: boolean };
      const navWithConn = navigator as Navigator & { connection?: Conn };
      const conn: Conn = navWithConn.connection || {};
      const eff: string | undefined = conn.effectiveType;
      const saveData: boolean = Boolean(conn.saveData);
      const slow = saveData || ['slow-2g', '2g'].includes(eff || '');
      setIsSlowEnv(Boolean(isTouch && slow));
    } catch {
      setIsSlowEnv(false);
    }
  }, []);


  useEffect(() => {
    // Check user authentication (client-only)
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // Produk sudah difilter dari server; tidak perlu filter ulang di client
  const filteredProducts = useMemo(() => products, [products]);

  // Status filter aktif untuk menampilkan chip & tombol reset
  const hasActiveFilter = useMemo(
    () => (selectedCategory && selectedCategory !== 'Semua') || Boolean(searchQuery),
    [selectedCategory, searchQuery]
  );

  // Ketika data/props dari server berubah (akibat navigasi), sinkronkan state dan akhiri state navigating
  useEffect(() => {
    if ((initialCategory || 'Semua') !== (initialCategoryRef.current || 'Semua')) {
      setSelectedCategory(initialCategory || 'Semua');
      initialCategoryRef.current = initialCategory || 'Semua';
    }
    if ((initialQuery || '') !== (initialQueryRef.current || '')) {
      setSearchQuery(initialQuery || '');
      setInputQuery(initialQuery || '');
      initialQueryRef.current = initialQuery || '';
    }
    // Navigasi selesai ketika data server (initialProducts) dan filter props sudah berubah
    setIsNavigating(false);
  }, [initialCategory, initialQuery, initialProducts, page]);

  // A11y + UX: setelah navigasi selesai dan skeleton hilang, fokuskan ke filter
  useEffect(() => {
    if (!isNavigating && !skeletonVisible) {
      // Auto-focus ke filter
      const t = setTimeout(() => {
        if (categorySelectRef.current) {
          categorySelectRef.current.focus();
        } else if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isNavigating, skeletonVisible]);

  // Anti-flicker: pertahankan skeleton minimal 250ms agar tidak kedip
  useEffect(() => {
    const MIN = 200;
    if (isNavigating) {
      navStartRef.current = Date.now();
      setSkeletonVisible(true);
      return;
    }
    // isNavigating false -> hitung sisa waktu
    const started = navStartRef.current ?? Date.now();
    const elapsed = Date.now() - started;
    if (elapsed < MIN) {
      const t = setTimeout(() => setSkeletonVisible(false), MIN - elapsed);
      return () => clearTimeout(t);
    }
    setSkeletonVisible(false);
  }, [isNavigating]);

  // Handler util untuk reset/hapus filter
  const handleRemoveCategory = () => setSelectedCategory('Semua');
  const handleRemoveQuery = () => { setSearchQuery(''); setInputQuery(''); };
  const resetFilters = () => {
    setSelectedCategory('Semua');
    setSearchQuery('');
    setInputQuery('');
    // focus kembali ke select kategori
    setTimeout(() => {
      if (categorySelectRef.current) categorySelectRef.current.focus();
      else if (searchInputRef.current) searchInputRef.current.focus();
    }, 0);
  };

  // Apply search when user submits the form or presses Enter
  const applySearch = () => {
    // Only apply if value changed
    if ((inputQuery || '') !== (initialQueryRef.current || '') || (inputQuery || '') !== (searchQuery || '')) {
      setSearchQuery(inputQuery || '');
    }
  };

  // Sinkronkan filter ke URL; hindari push ke URL identik (mis. jangan tambahkan page=1)
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(() => {
      if (!mounted) return;
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
      if (searchQuery) params.set('q', searchQuery);
      const categoryChanged = (selectedCategory || 'Semua') !== (initialCategoryRef.current || 'Semua');
      const queryChanged = (searchQuery || '') !== (initialQueryRef.current || '');
      const desiredPage = categoryChanged || queryChanged ? 1 : Math.max(1, page);
      if (desiredPage > 1) params.set('page', String(desiredPage)); // hindari ?page=1
      const qs = params.toString();
      const href = qs ? `/catalog?${qs}` : '/catalog';
      const current = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '';
      if (current !== href) {
        setIsNavigating(true);
        router.push(href, { scroll: false });
      }
    }, 120);
    return () => { mounted = false; clearTimeout(t); };
  }, [selectedCategory, searchQuery, page, router]);

  const openWhatsApp = (product: ProductUI) => {
    const message = `Halo! Saya tertarik dengan produk ${product.name}. Bisa minta informasi lebih detail?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6289653754317?text=${encodedMessage}`, '_blank');
  };

  const handleOrder = async (product: ProductUI) => {
    if (!user) {
      toast.info('Silakan masuk untuk memesan.', {
        description: 'Anda akan diarahkan ke halaman login.',
        duration: 5000,
        action: { label: 'Login', onClick: () => window.location.href = '/login?redirect=/catalog' },
      });
      return;
    }

    setOrderLoading(true);

    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (customerError) {
        throw new Error('Data customer tidak ditemukan. Silakan lengkapi profil Anda.');
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from('product_categories')
        .select('id')
        .eq('name', product.category)
        .single();

      if (categoryError) {
        throw new Error('Kategori produk tidak ditemukan.');
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          customer_id: customerData.id,
          category_id: categoryData.id,
          product_id: product.id,
          description: `Pesanan untuk produk: ${product.name}`,
          project_status: 'Survey',
          estimated_price: typeof product.priceText === 'string' && product.priceText !== '-' 
            ? parseFloat(product.priceText.replace(/[^0-9]/g, '')) 
            : 0,
          payment_method: 'DP',
        });

      if (transactionError) {
        throw new Error(`Gagal membuat pesanan: ${transactionError.message}`);
      }

      toast.success('Pesanan berhasil dibuat!', {
        description: 'Anda dapat melihat detail pesanan di dasbor Anda.',
        duration: 5000,
      });

    } catch (error: unknown) {
      const msg = (error && typeof error === 'object' && 'message' in error)
        ? String((error as { message?: string }).message || 'Terjadi kesalahan yang tidak diketahui.')
        : 'Terjadi kesalahan yang tidak diketahui.';
      toast.error('Gagal membuat pesanan.', { description: msg });
    } finally {
      setOrderLoading(false);
    }
  };

  const pageCount = Math.ceil(total / pageSize);
  const fromIndex = (page - 1) * pageSize;
  const startNumber = total > 0 ? fromIndex + 1 : 0;
  const endNumber = fromIndex + filteredProducts.length;

  const buildCatalogHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
    if (searchQuery) params.set('q', searchQuery);
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : '/catalog';
  };

  const getPageList = (current: number, totalPages: number) => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const add = (p: number | 'ellipsis') => pages.push(p);
    add(1);
    const left = Math.max(2, current - 2);
    const right = Math.min(totalPages - 1, current + 2);
    if (left > 2) add('ellipsis');
    for (let i = left; i <= right; i++) add(i);
    if (right < totalPages - 1) add('ellipsis');
    add(totalPages);
    return pages;
  };
  const pageList = getPageList(page, pageCount);

  // Prefetch halaman berikutnya/ sebelumnya untuk mempercepat navigasi pagination
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Hindari saat sedang navigasi atau skeleton tampil untuk menghemat bandwidth
    if (isNavigating || skeletonVisible) return;
    // Skip prefetch di kondisi lambat (mobile + data saver/jaringan lambat)
    if (isSlowEnv) return;
    const nextPage = Math.min(pageCount, page + 1);
    const prevPage = Math.max(1, page - 1);
    // Build href inline agar tidak bergantung pada fungsi luar (menghindari missing dependency)
    const buildHref = (targetPage: number) => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
      if (searchQuery) params.set('q', searchQuery);
      if (targetPage > 1) params.set('page', String(targetPage));
      const qs = params.toString();
      return qs ? `/catalog?${qs}` : '/catalog';
    };
    const nextHref = buildHref(nextPage);
    const prevHref = buildHref(prevPage);
    try {
      if (nextPage !== page) {
        console.debug('[prefetch] catalog next page:', nextHref);
        router.prefetch?.(nextHref);
      }
      if (prevPage !== page) {
        console.debug('[prefetch] catalog prev page:', prevHref);
        router.prefetch?.(prevHref);
      }
    } catch { /* noop */ }
  }, [page, pageCount, selectedCategory, searchQuery, isNavigating, skeletonVisible, router, isSlowEnv]);

  // Idle prefetch: detail 3-4 produk teratas (ringan) untuk perceived speed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!filteredProducts?.length) return;
    if (isNavigating || skeletonVisible) return;
    if (isSlowEnv) return; // tunda prefetch detail di jaringan lambat
    const run = () => {
      const count = Math.min(4, filteredProducts.length);
      for (let i = 0; i < count; i++) {
        const p = filteredProducts[i];
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
        if (searchQuery) params.set('q', searchQuery);
        if (page && page > 1) params.set('page', String(page));
        const qs = params.toString();
        const href = `/catalog/${p.id}-${slugify(p.name)}${qs ? `?${qs}` : ''}`;
        try {
          console.debug('[prefetch] product detail:', href);
          router.prefetch?.(href);
        } catch { /* noop */ }
      }
    };
    if ('requestIdleCallback' in window) {
      const ric = (window as unknown as { requestIdleCallback: (cb: IdleRequestCallback, options?: { timeout?: number }) => number }).requestIdleCallback;
      const cic = (window as unknown as { cancelIdleCallback?: (handle: number) => void }).cancelIdleCallback;
      const id = ric(run, { timeout: 1200 });
      return () => cic?.(id);
    } else {
      const t = setTimeout(run, 350);
      return () => clearTimeout(t);
    }
  }, [filteredProducts, selectedCategory, searchQuery, page, isNavigating, skeletonVisible, router, isSlowEnv]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Katalog Produk</h1>
          <p className="text-xl text-orange-100">Temukan produk las dan fabrikasi besi berkualitas tinggi untuk kebutuhan Anda.</p>
          {/* Category description (SEO + UX copy) */}
          {initialCategory && initialCategory !== 'Semua' && (categoryDescription || '').trim() && (
            <p className="mt-3 max-w-3xl mx-auto text-orange-50/95 text-base md:text-lg leading-relaxed">
              {categoryDescription}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-10">
        {/* Search and Filter Section */}
        <div ref={filterSectionRef} className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); applySearch(); }}
              className="contents"
            >
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Cari Produk</label>
              <div className="relative flex items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="search"
                    placeholder="Cari nama atau deskripsi produk..."
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    ref={searchInputRef}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <button
                  type="submit"
                  aria-label="Terapkan pencarian"
                  className="inline-flex items-center whitespace-nowrap gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow-sm"
                >
                  Terapkan Pencarian
                </button>
              </div>
            </div>
            </form>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <div className="relative">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  ref={categorySelectRef}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-gray-900 bg-white py-2 px-3 hover:bg-orange-50" style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filter chips + Reset */}
          {hasActiveFilter && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory && selectedCategory !== 'Semua' && (
                  <button
                    type="button"
                    onClick={handleRemoveCategory}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition text-sm"
                  >
                    <span className="text-xs">Kategori:</span>
                    <span className="font-medium">{selectedCategory}</span>
                    <span aria-hidden>✕</span>
                  </button>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleRemoveQuery}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition text-sm max-w-full"
                    title={searchQuery}
                  >
                    <span className="text-xs">Kata kunci:</span>
                    <span className="font-medium truncate max-w-[40ch]">{searchQuery}</span>
                    <span aria-hidden>✕</span>
                  </button>
                )}
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="relative min-h-[420px] md:min-h-[520px] lg:min-h-[560px]" aria-busy={isNavigating || skeletonVisible}>
          {/* Actual products grid with fade transition */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${(isNavigating || skeletonVisible) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {(() => {
              // Desktop bisa menampilkan beberapa kolom; LCP sering berasal dari item selain index 0.
              // Prioritaskan seluruh item pada baris pertama (index < cols) agar discoverable di HTML.
              return filteredProducts.map((product, index) => {
                const isHttp = product.image.startsWith('http');
                const isPriorityImg = isHttp && index < cols;

                return (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col focus:outline-none focus:ring-2 focus:ring-orange-400/60 max-w-sm w-full mx-auto md:max-w-none"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 200px' }}
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
                      if (searchQuery) params.set('q', searchQuery);
                      if (page && page > 1) params.set('page', String(page));
                      const qs = params.toString();
                      const detailHref = `/catalog/${product.id}-${slugify(product.name)}${qs ? `?${qs}` : ''}`;
                      router.push(detailHref);
                    }}
                    onMouseEnter={() => {
                      const params = new URLSearchParams();
                      if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
                      if (searchQuery) params.set('q', searchQuery);
                      if (page && page > 1) params.set('page', String(page));
                      const qs = params.toString();
                      const detailHref = `/catalog/${product.id}-${slugify(product.name)}${qs ? `?${qs}` : ''}`;
                      router.prefetch?.(detailHref);
                    }}
                    onFocus={() => {
                      const params = new URLSearchParams();
                      if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
                      if (searchQuery) params.set('q', searchQuery);
                      if (page && page > 1) params.set('page', String(page));
                      const qs = params.toString();
                      const detailHref = `/catalog/${product.id}-${slugify(product.name)}${qs ? `?${qs}` : ''}`;
                      router.prefetch?.(detailHref);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const params = new URLSearchParams();
                        if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
                        if (searchQuery) params.set('q', searchQuery);
                        if (page && page > 1) params.set('page', String(page));
                        const qs = params.toString();
                        const detailHref = `/catalog/${product.id}-${slugify(product.name)}${qs ? `?${qs}` : ''}`;
                        router.push(detailHref);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Buka detail ${product.name}`}
                  >
                    {/* Product Image */}
                    <div className="relative m-2 rounded-lg overflow-hidden aspect-[4/3] sm:aspect-[16/9] bg-white sm:bg-gradient-to-br sm:from-orange-100 sm:to-orange-200">
                      {product.image.startsWith('http') ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain"
                          priority={isPriorityImg}
                          fetchPriority={isPriorityImg ? 'high' : 'auto'}
                          loading={isPriorityImg ? 'eager' : 'lazy'}
                          quality={60}
                          sizes="(max-width: 767px) 92vw, (max-width: 1023px) 44vw, (max-width: 1279px) 30vw, 22vw"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-6xl">{product.image}</span>
                      )}
                    </div>

                    {/* UX hint (always visible on mobile, reveal on hover in desktop) */}
                    <div className="px-4 -mt-2 mb-1 text-[11px] text-gray-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-200">Klik untuk detail</div>

                    {/* Product Info */}
                    <div className="px-5 py-3 flex flex-col flex-1">
                      <div className="mb-2">
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{product.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{product.description}</p>
                      <div className="mb-3">
                        <span className="text-2xl font-bold text-orange-600">{product.priceText || '-'}</span>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOrder(product); }}
                          disabled={orderLoading}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {orderLoading ? '⏳ Memproses...' : '🛒 Pesan'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openWhatsApp(product); }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 cursor-pointer"
                        >
                          💬 Konsultasi
                        </button>
                      </div>
                    </div>
                    {/* Corner badge (top-right) */}
                    <div className="pointer-events-none absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/95 text-white text-[11px] font-medium px-2.5 py-1 shadow-sm opacity-100 md:opacity-0 md:-translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-focus-within:opacity-100 md:group-focus-within:translate-y-0 transition-all duration-200">
                        {"lihat detail"}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {skeletonVisible && (
            <>
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10" />
              <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 z-20">
                {Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                  <div key={i} className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="m-2 rounded-lg bg-orange-100/60 aspect-[16/9]" />
                    <div className="px-5 py-3">
                      <div className="h-5 w-24 bg-gray-200 rounded-full mb-3" />
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-5/6 bg-gray-200 rounded mb-4" />
                      <div className="h-7 w-32 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty State - centered in wrapper */}
          {!isNavigating && !skeletonVisible && filteredProducts.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 py-8 md:py-10">
                <div className="text-5xl md:text-6xl mb-3 md:mb-4">🔍</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
              </div>
            </div>
          )}

        </div>

        {/* Product Count & Pagination */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 items-center text-gray-600 gap-3 md:gap-0">
          <div className="text-md text-center justify-self-center md:col-start-2" aria-live="polite">
            {total > 0 ? (
              <>
                Menampilkan {startNumber}-{endNumber} dari {total} produk{' '}
                di kategori <span className="font-medium text-gray-800">{selectedCategory || 'Semua'}</span>
                {searchQuery && (
                  <>
                    {' '}untuk kata kunci ‘{searchQuery}’
                  </>
                )}
                {' '}(<span className="whitespace-nowrap">Halaman {page} dari {pageCount}</span>)
              </>
            ) : (
              <>Menampilkan 0 dari 0 produk</>
            )}
          </div>
          {pageCount > 1 && (
            <div className="inline-flex gap-1 md:gap-2 justify-self-center md:justify-self-end mt-1 md:mt-0 overflow-x-auto max-w-full px-1">
              {/* Prev */}
              <Link
                href={buildCatalogHref(Math.max(1, page - 1))}
                scroll={false}
                prefetch
                aria-disabled={page <= 1}
                className={`px-3 py-2 rounded-lg border ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50 border-orange-200 text-orange-600'}`}
              >
                ←
              </Link>
              {/* Pages */}
              {pageList.map((p, i) => p === 'ellipsis' ? (
                <span key={`e-${i}`} className="px-2 py-2 select-none">…</span>
              ) : (
                <Link
                  key={p}
                  href={buildCatalogHref(p)}
                  scroll={false}
                  prefetch
                  aria-current={p === page ? 'page' : undefined}
                  className={`px-3 py-2 rounded-lg border ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'hover:bg-orange-50 border-orange-200 text-orange-600'}`}
                >
                  {p}
                </Link>
              ))}
              {/* Next */}
              <Link
                href={buildCatalogHref(Math.min(pageCount, page + 1))}
                scroll={false}
                prefetch
                aria-disabled={page >= pageCount}
                className={`px-3 py-2 rounded-lg border ${page >= pageCount ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50 border-orange-200 text-orange-600'}`}
              >
                →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal detail & lightbox lama telah dihapus. Klik kartu sekarang menuju halaman detail. */}
    </div>
  );
}
