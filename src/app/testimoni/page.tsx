"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { formatTanggal } from "@/lib/format";

interface ReviewRow {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  show_name: boolean | null;
  display_name: string | null;
  // Denormalized agar aman RLS di halaman publik (optional, fallback bila null)
  product_name?: string | null;
  product_description?: string | null;
}

// Komponen Read More berbasis jumlah baris (line-clamp) untuk mencegah komentar terlalu panjang merusak layout
const ReadMoreClamp = ({ text, lines = 5 }: { text: string; lines?: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const pRef = useRef<HTMLParagraphElement | null>(null);

  if (!text) return null;
  const cleanText = text.replace(/<br\s*\/?>(?=\n|\r|$)/gi, '').replace(/<br\s*\/?>(?!\n|\r|$)/gi, '');

  useEffect(() => {
    const el = pRef.current as HTMLParagraphElement | null;
    if (!el) return;
    // Cek overflow hanya saat collapsed
    if (!expanded) {
      const needToggle = el.scrollHeight > el.clientHeight + 2; // toleransi
      setShowToggle(needToggle);
    } else {
      setShowToggle(true);
    }
  }, [cleanText, expanded]);

  return (
    <div className="relative">
      <p
        ref={pRef}
        className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap transition-all"
        style={expanded ? {} : { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {cleanText}
      </p>
      {showToggle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-orange-600 hover:text-orange-800 mt-2 transition-colors duration-200"
        >
          {expanded ? 'Baca lebih sedikit' : 'Baca selengkapnya'}
        </button>
      )}
    </div>
  );
};

const TestimonialCardSkeleton = () => (
  <div className="p-5 bg-white rounded-2xl border-0 ring-1 ring-gray-100 shadow-md">
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>

      {/* Badge Skeleton */}
      <div className="mt-4 h-6 w-24 bg-gray-200 rounded-full"></div>

      {/* Comment Skeleton */}
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function TestimoniPage() {
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    // Coba ambil dengan kolom denormalisasi
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        show_name,
        display_name,
        product_name,
        product_description
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) {
      // Fallback: jika kolom tidak tersedia, ambil kolom dasar agar halaman tetap tampil
      const { data: basic, error: basicErr } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          show_name,
          display_name
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (basicErr) {
        setError("Gagal memuat testimoni");
      } else {
        setItems(basic as any);
      }
    } else {
      setItems(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white">
      {/* Hero Section (konsisten dengan Contact & Catalog) */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Testimoni Pelanggan</h1>
          <p className="text-lg md:text-xl text-orange-100 ">Suara asli dari pelanggan yang telah menggunakan layanan dan produk kami.</p>
          <p className="text-sm md:text-base text-orange-100 max-w-2xl mx-auto mt-2">Testimoni ini baru dimulai pada tanggal 25 Agustus 2025 (Tanggal Peluncuran Website).</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl px-4 py-12 md:py-16"
      >

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {[...Array(6)].map((_, i) => (
              <TestimonialCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">{error}</div>
        ) : items.length === 0 ? (
          <div className="mt-10 p-6 bg-white rounded-2xl border text-center text-gray-600">Belum ada testimoni, ini karena website ini baru saja dibuat.</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
            initial="hidden"
            animate="visible"
            variants={{ 
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {items.map((r) => (
              <motion.article
                key={r.id}
                variants={{ 
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className="group flex flex-col justify-between p-5 bg-white rounded-2xl border-0 ring-1 ring-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Header: Rating + Tanggal */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center text-amber-500" aria-label={`Rating ${r.rating} dari 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`h-5 w-5 ${i < (r.rating || 0) ? 'fill-amber-400' : 'fill-gray-200'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{formatTanggal(r.created_at, true)}</span>
                  </div>

                  {/* Product Badge */}
                  {(r.product_name || r.product_description) && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3.5M4 13V7a2 2 0 012-2h3.5M4 13v4a2 2 0 002 2h3.5M20 13v4a2 2 0 01-2 2h-3.5M9.5 5V3m5 2V3M4 9h16"/></svg>
                        {r.product_name || 'Produk' }
                      </span>
                    </div>
                  )}

                  {/* Comment with Quote Icon */}
                  {r.comment && (
                    <div className="relative mt-3">
                      <svg className="absolute -top-1 -left-2 h-8 w-8 text-gray-100" fill="currentColor" viewBox="0 0 32 32"><path d="M9.333 22.667C6.089 22.667 4 21.045 4 18.133c0-2.222.978-3.822 2.622-5.067C8.622 11.422 11.467 10 14.667 10v2.667c-2.489 0-4.267.667-5.333 2C8.267 15.733 8 16.844 8 18.133c0 .889.267 1.467.8 1.733.533.267 1.422.4 2.667.4v2.4zM22.667 22.667C19.422 22.667 17.333 21.045 17.333 18.133c0-2.222.978-3.822 2.622-5.067C21.956 11.422 24.8 10 28 10v2.667c-2.489 0-4.267.667-5.333 2C21.6 15.733 21.333 16.844 21.333 18.133c0 .889.267 1.467.8 1.733.533.267 1.422.4 2.667.4v2.4z"/></svg>
                      <div className="relative z-10">
                        <ReadMoreClamp text={r.comment || ''} lines={5} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Nama */}
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-white ring-1 ring-orange-100 flex items-center justify-center text-sm font-semibold text-orange-800">
                      {(r.show_name && r.display_name ? r.display_name : 'PT').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-800 font-semibold">{r.show_name && r.display_name ? r.display_name : 'Pelanggan Terverifikasi'}</div>
                      <div className="text-xs text-gray-500">Review terverifikasi</div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Sebelumnya
          </button>
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">Halaman {page + 1}</span>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || items.length < pageSize}
          >
            Berikutnya
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </motion.div>
    </main>
  );
}
