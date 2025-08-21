"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";

// Icons
const DownloadIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const AlertTriangleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const InfoIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);

// Types (subset sesuai kebutuhan)
interface TransactionRow {
  id: number;
  order_date: string;
  project_status: string | null;
  estimated_price: number | string;
}
interface PaymentRow {
  id: number;
  transaction_id: number;
  payment_amount: number | string;
  payment_date: string;
}
interface ReviewRow { id: number; is_published: boolean | null; created_at: string }

// Helpers
const todayLocal = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export default function AdminReportsPage() {
  // State filter tanggal
  const [from, setFrom] = useState<string>(toISODate(addDays(todayLocal(), -29))); // default 30 hari terakhir
  const [to, setTo] = useState<string>(toISODate(todayLocal()));
  const [loading, setLoading] = useState(false);

  // Data sumber
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  // Dialog ekspor
  const [confirmExport, setConfirmExport] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const fromTs = `${from}T00:00:00`;
      const toTs = `${to}T23:59:59`;

      // Ambil transaksi pada rentang tanggal (berdasarkan order_date)
      const tq = supabase
        .from("transactions")
        .select("id, order_date, project_status, estimated_price")
        .gte("order_date", fromTs)
        .lte("order_date", toTs)
        .order("order_date", { ascending: true });

      // Ambil pembayaran pada rentang tanggal (berdasarkan payment_date)
      const pq = supabase
        .from("payment_history")
        .select("id, transaction_id, payment_amount, payment_date")
        .gte("payment_date", fromTs)
        .lte("payment_date", toTs)
        .order("payment_date", { ascending: true });

      // Ambil ulasan pada rentang tanggal (untuk metrik sederhana)
      const rq = supabase
        .from("reviews")
        .select("id, is_published, created_at")
        .gte("created_at", fromTs)
        .lte("created_at", toTs)
        .order("created_at", { ascending: true });

      const [{ data: tData, error: tErr }, { data: pData, error: pErr }, { data: rData, error: rErr }] = await Promise.all([
        tq, pq, rq,
      ]);

      if (tErr) toast.error("Gagal memuat transaksi.");
      if (pErr) toast.error("Gagal memuat pembayaran.");
      if (rErr) toast.error("Gagal memuat ulasan.");

      setTransactions((tData as any) || []);
      setPayments((pData as any) || []);
      setReviews((rData as any) || []);
    } catch (e) {
      toast.error("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = useMemo(() => {
    const totalTransaksi = transactions.length;
    const totalEstimasi = transactions.reduce((s, t) => s + (Number(t.estimated_price) || 0), 0);

    const totalPemasukan = payments.reduce((s, p) => s + (Number(p.payment_amount) || 0), 0);
    const outstanding = Math.max(0, totalEstimasi - totalPemasukan);

    const publishedReviews = reviews.filter((r) => !!r.is_published).length;

    // Breakdown status transaksi
    const statusCount: Record<string, number> = {};
    for (const t of transactions) {
      const key = (t.project_status || 'Unknown').toString();
      statusCount[key] = (statusCount[key] || 0) + 1;
    }

    return {
      totalTransaksi,
      totalPemasukan,
      outstanding,
      publishedReviews,
      statusCount,
    };
  }, [transactions, payments, reviews]);

  // Tren harian (berdasarkan transaksi per hari & pemasukan per hari)
  const trend = useMemo(() => {
    // Build bucket tanggal dari from..to
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T00:00:00");
    const days: string[] = [];
    const bucketsTrx: Record<string, number> = {};
    const bucketsPay: Record<string, number> = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = toISODate(d);
      days.push(k);
      bucketsTrx[k] = 0;
      bucketsPay[k] = 0;
    }
    for (const t of transactions) {
      const k = (t.order_date || '').slice(0, 10);
      if (k in bucketsTrx) bucketsTrx[k] += 1;
    }
    for (const p of payments) {
      const k = (p.payment_date || '').slice(0, 10);
      if (k in bucketsPay) bucketsPay[k] += Number(p.payment_amount) || 0;
    }
    return { days, bucketsTrx, bucketsPay };
  }, [transactions, payments, from, to]);

  const onApplyPreset = (type: '7d' | '30d' | '90d' | 'thisMonth') => {
    const now = todayLocal();
    if (type === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setFrom(toISODate(start));
      setTo(toISODate(now));
      return;
    }
    const map: Record<string, number> = { '7d': -6, '30d': -29, '90d': -89 };
    const start = addDays(now, map[type]);
    setFrom(toISODate(start));
    setTo(toISODate(now));
  };

  const onRefresh = () => {
    fetchAll();
  };

  const onExportCSV = () => {
    setConfirmExport(true);
  };

  const doExportCSV = () => {
    try {
      // Gabungkan data ringkasan baris per transaksi
      // Map total paid per transaksi di periode (untuk laporan sederhana)
      const paidMap: Record<number, number> = {};
      for (const p of payments) {
        paidMap[p.transaction_id] = (paidMap[p.transaction_id] || 0) + (Number(p.payment_amount) || 0);
      }
      const rows = transactions.map((t) => {
        const paid = paidMap[t.id] || 0;
        const est = Number(t.estimated_price) || 0;
        const remain = Math.max(0, est - paid);
        return {
          id: t.id,
          order_date: t.order_date,
          project_status: t.project_status || '',
          estimated_price: est,
          total_paid: paid,
          remaining: remain,
        };
      });

      const headers = ["id","order_date","project_status","estimated_price","total_paid","remaining"]; 
      const csv = [headers.join(",")]
        .concat(
          rows.map(r => [r.id, r.order_date, r.project_status, r.estimated_price, r.total_paid, r.remaining]
            .map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : String(v))
            .join(",")
          )
        )
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${from}_sd_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export CSV berhasil.");
    } catch (e) {
      toast.error("Export CSV gagal.");
    } finally {
      setConfirmExport(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <main className="min-h-screen px-4 py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Dashboard Laporan</h1>
            <p className="text-gray-500 mt-1">Ringkasan performa bisnis berdasarkan transaksi, pembayaran, dan ulasan.</p>
          </header>

          {/* Filter Bar */}
          <section className="bg-white border rounded-xl shadow-sm p-4 md:p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Dari Tanggal</label>
                  <div className="relative">
                    <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Sampai Tanggal</label>
                    <div className="relative">
                      <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onApplyPreset('7d')} className="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">7 Hari</button>
                <button onClick={() => onApplyPreset('30d')} className="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">30 Hari</button>
                <button onClick={() => onApplyPreset('90d')} className="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">90 Hari</button>
                <button onClick={() => onApplyPreset('thisMonth')} className="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">Bulan Ini</button>
                <button onClick={onRefresh} disabled={loading} className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">Terapkan</button>
              </div>
            </div>
          </section>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard title="Total Transaksi" value={kpis.totalTransaksi} subtitle={`${from} s/d ${to}`} />
            <KpiCard title="Total Pemasukan" value={formatRupiah(kpis.totalPemasukan)} subtitle="Penjumlahan pembayaran" accent="success" />
            <KpiCard title="Outstanding" value={formatRupiah(kpis.outstanding)} subtitle="Estimasi - pembayaran" accent="warning" />
            <KpiCard title="Ulasan Terpublikasi" value={kpis.publishedReviews} subtitle="Periode dipilih" accent="info" />
          </section>

          {/* Breakdown Status & Tren */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border rounded-xl shadow-sm p-5 lg:col-span-1">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Ringkasan Status Transaksi</h3>
              <ul className="divide-y">
                {Object.keys(kpis.statusCount).length === 0 ? (
                  <li className="py-2 text-sm text-gray-500">Tidak ada data.</li>
                ) : (
                  Object.entries(kpis.statusCount).map(([status, count]) => (
                    <li key={status} className="py-3 flex items-center justify-between">
                      <span className="text-gray-700">{status}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="bg-white border rounded-xl shadow-sm p-5 lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Tren Harian</h3>
              <div className="overflow-x-auto">
                <div className="min-w-[640px] grid grid-cols-12 gap-2">
                  {/* Header axis */}
                  <div className="col-span-12 grid grid-cols-12 gap-2 text-[10px] text-gray-500">
                    {trend.days.map((d) => (
                      <div key={d} className="text-center">{d.slice(8,10)}/{d.slice(5,7)}</div>
                    ))}
                  </div>
                  {/* Bars: Transaksi count */}
                  <div className="col-span-12 grid grid-cols-12 gap-2 mt-2">
                    {trend.days.map((d) => {
                      const v = trend.bucketsTrx[d] || 0;
                      const h = Math.min(40, v * 8);
                      return (
                        <div key={d} className="flex flex-col items-center">
                          <div className="w-2 rounded-t bg-amber-400 transition-all" style={{ height: `${h}px` }} title={`Transaksi: ${v}`}></div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Bars: Pemasukan */}
                  <div className="col-span-12 grid grid-cols-12 gap-2 mt-3">
                    {trend.days.map((d) => {
                      const v = trend.bucketsPay[d] || 0;
                      const h = Math.min(40, Math.log10(1 + v) * 20); // skala log sederhana
                      return (
                        <div key={d} className="flex flex-col items-center">
                          <div className="w-2 rounded-t bg-emerald-400 transition-all" style={{ height: `${h}px` }} title={`Pemasukan: ${formatRupiah(v)}`}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">Bar atas: jumlah transaksi • Bar bawah: total pemasukan (skala log).</div>
            </div>
          </section>

          {/* Tabel Ringkas Transaksi */}
          <section className="bg-white border rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold text-gray-800">Ringkasan Transaksi Periode</h3>
              <button onClick={onExportCSV} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50">
                <DownloadIcon className="h-4 w-4" /> Ekspor CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50/70 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Tanggal</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Estimasi</th>
                    <th className="px-4 py-2 text-right">Dibayar</th>
                    <th className="px-4 py-2 text-right">Sisa</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Tidak ada transaksi pada periode ini.</td>
                    </tr>
                  ) : (
                    (() => {
                      const paidMap: Record<number, number> = {};
                      for (const p of payments) {
                        paidMap[p.transaction_id] = (paidMap[p.transaction_id] || 0) + (Number(p.payment_amount) || 0);
                      }
                      return transactions.map((t) => {
                        const paid = paidMap[t.id] || 0;
                        const est = Number(t.estimated_price) || 0;
                        const remain = Math.max(0, est - paid);
                        return (
                          <tr key={t.id} className="border-b hover:bg-amber-50/40">
                            <td className="px-4 py-2">#{t.id}</td>
                            <td className="px-4 py-2">{formatTanggal(t.order_date, true)}</td>
                            <td className="px-4 py-2">{t.project_status || '-'}</td>
                            <td className="px-4 py-2 text-right">{formatRupiah(est)}</td>
                            <td className="px-4 py-2 text-right">{formatRupiah(paid)}</td>
                            <td className="px-4 py-2 text-right">{formatRupiah(remain)}</td>
                          </tr>
                        );
                      })
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Confirmation Export Dialog */}
      <Transition appear show={confirmExport} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setConfirmExport(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">Konfirmasi Ekspor CSV</Dialog.Title>
                  <div className="mt-2 text-sm text-gray-600">Anda akan mengekspor ringkasan transaksi periode <span className="font-semibold">{from}</span> s/d <span className="font-semibold">{to}</span>. Lanjutkan?</div>
                  <div className="mt-5 flex justify-end gap-3">
                    <button onClick={() => setConfirmExport(false)} className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-50">Batal</button>
                    <button onClick={doExportCSV} className="px-4 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700">Ekspor</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function KpiCard({ title, value, subtitle, accent }: { title: string; value: string | number; subtitle?: string; accent?: 'success' | 'warning' | 'info' }) {
  const accentClass = accent === 'success' ? 'from-emerald-50 to-white border-emerald-100' : accent === 'warning' ? 'from-amber-50 to-white border-amber-100' : accent === 'info' ? 'from-sky-50 to-white border-sky-100' : 'from-gray-50 to-white border-gray-100';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`p-4 rounded-2xl border bg-gradient-to-b ${accentClass} shadow-sm`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
    </motion.div>
  );
}
