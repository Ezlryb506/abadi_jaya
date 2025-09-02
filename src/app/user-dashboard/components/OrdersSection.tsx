import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import LocalTime from './LocalTime';
import { formatRupiah, formatTanggal, hitungPembayaran, getStatusClass } from '@/lib/format';

type ProjectUpdate = {
  id: number;
  status: string;
  description: string | null;
  created_at: string;
  photo_url: string | null;
};

type PaymentHistory = {
  id: number;
  payment_amount: number;
  payment_date: string;
  payment_notes: string | null;
  payment_proof: string | null;
};

type ReviewRow = {
  id: number;
  rating: number;
  comment: string | null;
  show_name: boolean;
  display_name: string | null;
};

type Order = {
  id: number;
  created_at: string;
  estimated_completion: string | null;
  estimated_price: number | null;
  project_status: string | null;
  products: { name: string; product_categories: { name: string } | null } | null;
  customers: { name: string } | null;
  payment_history: PaymentHistory[];
  project_updates: ProjectUpdate[];
  reviews: ReviewRow[];
};

interface OrdersSectionProps {
  orders: Order[];
  loading: boolean;
  error: string;
  customerId: number | null;
}

function OrderCard({ order, customerId, onChanged }: { order: Order; customerId: number | null; onChanged?: () => void }) {
  const [tab, setTab] = useState<'updates' | 'payments'>('updates');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [showName, setShowName] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  const existingReview = Array.isArray(order?.reviews) && order.reviews.length > 0 ? order.reviews[0] : null;
  const canReview = order?.project_status === 'Completed' && !existingReview;

  const { est, paid, remaining, pct } = hitungPembayaran(order?.estimated_price, order?.payment_history);

  const updates = Array.isArray(order?.project_updates)
    ? [...order.project_updates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const payments = Array.isArray(order?.payment_history)
    ? [...order.payment_history].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    : [];

  // Estimated completion helpers
  const dueDate = order?.estimated_completion ? new Date(order.estimated_completion) : null;
  const isCompleted = order?.project_status === 'Completed';
  const now = new Date();
  const endOfDue = dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59) : null;
  const isOverdue = !!(endOfDue && now > endOfDue && !isCompleted);
  const daysLate = isOverdue && endOfDue ? Math.ceil((now.getTime() - endOfDue.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const openReviewModal = () => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
      setShowName(!!existingReview.show_name);
    } else {
      setRating(5);
      setComment('');
      setShowName(false);
    }
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
  };

  const handleSubmitReview = async () => {
    if (!customerId) return;
    if (!rating || rating < 1 || rating > 5) return;

    try {
      setSubmitting(true);
      if (existingReview) {
        // Update: admin moderation reset publish agar sesuai keputusan tadi
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment || null,
            show_name: showName,
            display_name: showName ? (order?.customers?.name || null) : null,
            // denormalized fields for public testimonials page
            product_name: order?.products?.name || null,
            product_description: order?.products?.product_categories?.name || null,
            is_published: false,
          })
          .eq('id', existingReview.id)
          .eq('customer_id', customerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert({
            transaction_id: order.id,
            customer_id: customerId,
            rating,
            comment: comment || null,
            show_name: showName,
            display_name: showName ? (order?.customers?.name || null) : null,
            // denormalized fields
            product_name: order?.products?.name || null,
            product_description: order?.products?.product_categories?.name || null,
          });
        if (error) {
          throw error;
        }
      }
      setReviewModalOpen(false);
      if (onChanged) {
        onChanged();
      }
    } catch {
      // minimal guard; bisa ditingkatkan dengan toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!customerId || !existingReview) return;
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', existingReview.id)
        .eq('customer_id', customerId);
      if (error) throw error;
      if (onChanged) onChanged();
    } catch {
    } finally {
      setSubmitting(false);
      setReviewModalOpen(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <p className="font-semibold text-gray-500 text-sm">Order ID: #{order.id}</p>
          <p className="text-gray-400 text-xs mt-1"><LocalTime utcTime={order.created_at} /></p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-gray-500">Estimasi Selesai:</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
              {dueDate ? formatTanggal(dueDate.toISOString(), false) : 'Belum ditentukan'}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700">
                Terlambat{daysLate > 0 ? ` ${daysLate}h` : ''}
              </span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.project_status ?? undefined)}`}>
          {order.project_status}
        </span>
      </div>

      {/* Review summary / actions */}
      <div className="mb-3 flex items-center justify-between">
        {existingReview ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500" aria-label={`Rating ${existingReview.rating} dari 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`h-5 w-5 ${i < (existingReview.rating || 0) ? 'fill-amber-400 stroke-amber-400' : 'stroke-amber-400'}`} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              ))}
            </div>
            {existingReview.comment && (
              <p className="text-sm text-gray-700 max-w-[42ch] line-clamp-2">{existingReview.comment}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Belum ada ulasan.</p>
        )}

        <div className="flex items-center gap-2">
          {canReview && (
            <button onClick={openReviewModal} className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition">Beri Ulasan</button>
          )}
          {existingReview && (
            <>
              <button onClick={openReviewModal} className="px-3 py-1.5 text-xs rounded-lg border hover:bg-gray-50">Edit</button>
              <button onClick={handleDeleteReview} className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-700 hover:bg-red-50">Hapus</button>
            </>
          )}
        </div>
      </div>

      {order.products && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center">
              <span className="font-semibold text-gray-800">{order.products.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ringkasan Pembayaran */}
      <div className="mt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-3">
            <span className="font-medium">Total:</span>
            <span className="text-orange-600 font-semibold">{formatRupiah(est)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Dibayar:</span>
            <span className="font-semibold">{formatRupiah(paid)}</span>
            <span className="text-gray-400">|</span>
            <span>Sisa:</span>
            <span className="font-semibold">{formatRupiah(remaining)}</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{pct}%</span>
            <span>{formatRupiah(paid)} / {formatRupiah(est)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-sky-500'} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setTab('updates')}
            className={`px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors ${tab === 'updates' ? 'bg-white text-sky-700 shadow border border-sky-100' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Status Proyek Saya
          </button>
          <button
            onClick={() => setTab('payments')}
            className={`px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors ${tab === 'payments' ? 'bg-white text-sky-700 shadow border border-sky-100' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Riwayat Pembayaran Saya
          </button>
        </div>

        {/* Panels */}
        <div className="mt-4">
          {tab === 'updates' ? (
            <ul className="space-y-3">
              {updates.length > 0 ? updates.map((u: ProjectUpdate) => (
                <li key={u.id} className="border-b border-gray-100 pb-2">
                  <p className="text-sm"><strong>Status:</strong> {u.status}</p>
                  {u.description && <p className="text-sm text-gray-700">{u.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formatTanggal(u.created_at, true)}</p>
                  {u.photo_url && (
                    <div className="mt-2 relative w-full h-48 sm:h-56 md:h-64">
                      <Image
                        src={u.photo_url}
                        alt="update"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                </li>
              )) : <p className="text-sm text-gray-500">Belum ada update proyek.</p>}
            </ul>
          ) : (
            <ul className="space-y-3">
              {payments.length > 0 ? payments.map((p: PaymentHistory) => (
                <li key={p.id} className="border-b border-gray-100 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm"><strong>Jumlah:</strong> {formatRupiah(p.payment_amount)}</p>
                      <p className="text-xs text-gray-500">{formatTanggal(p.payment_date, true)}</p>
                      {p.payment_notes && <p className="text-xs text-gray-600">{p.payment_notes}</p>}
                      {p.payment_proof && (
                        <a href={p.payment_proof} target="_blank" rel="noreferrer" className="inline-block text-sky-600 hover:underline text-xs mt-1">Lihat Bukti</a>
                      )}
                    </div>
                  </div>
                </li>
              )) : <p className="text-sm text-gray-500">Belum ada pembayaran.</p>}
            </ul>
          )}
        </div>
      </div>

      {/* Modal Review */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeReviewModal} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-800">{existingReview ? 'Edit Ulasan' : 'Beri Ulasan'}</h3>
            <p className="text-xs text-gray-500 mt-1">Beri rating dan komentar untuk pesanan ini.</p>
            <div className="mt-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const idx = i + 1;
                  const filled = (hoverRating || rating) >= idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setHoverRating(idx)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(idx)}
                      className="p-1"
                      aria-label={`Pilih ${idx} bintang`}
                    >
                      <svg className={`h-7 w-7 ${filled ? 'fill-amber-400 stroke-amber-400' : 'stroke-amber-400'}`} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </button>
                  );
                })}
              </div>
              <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Komentar (opsional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="Tulis pengalamanmu... (maks 500 karakter)"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="rounded border-gray-300" />
                Tampilkan nama saya di halaman testimoni
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={closeReviewModal} className="px-4 py-2 rounded-xl border hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmitReview} disabled={submitting || !rating} className={`px-4 py-2 rounded-xl text-white ${submitting ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'} disabled:opacity-50`}>
                {submitting ? 'Menyimpan...' : existingReview ? 'Simpan Perubahan' : 'Kirim Ulasan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersSection({ orders, loading, error, customerId }: OrdersSectionProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return <div className="text-gray-500 bg-gray-100 p-4 rounded-lg">Anda belum memiliki pesanan.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Pesanan Saya</h2>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} customerId={customerId} onChanged={() => { /* no-op, realtime akan refetch; disiapkan bila perlu */ }} />
      ))}
    </div>
  );
}
