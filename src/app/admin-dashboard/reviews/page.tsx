"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatTanggal } from "@/lib/format";
import { Toaster, toast } from 'sonner';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

// --- ICONS ---
const StarIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const PublishIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>;
const EditIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const DeleteIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-8 0h8"/></svg>;
const SearchIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
const Spinner = ({ className }: { className?: string }) => <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const AlertTriangleIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const InfoIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

interface ReviewRow {
  id: number;
  transaction_id: number;
  customer_id: number;
  rating: number;
  comment: string | null;
  is_published: boolean | null;
  show_name: boolean | null;
  display_name: string | null;
  created_at: string;
}

// Komponen Read More berbasis jumlah baris untuk komentar panjang
const ReadMoreClamp = ({ text, lines = 5 }: { text: string; lines?: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const pRef = useRef<HTMLParagraphElement | null>(null);

  if (!text) return <span className="text-gray-400 italic">- tidak ada komentar -</span>;
  const cleanText = text.replace(/<br\s*\/?>(?=\n|\r|$)/gi, '').replace(/<br\s*\/?>(?!\n|\r|$)/gi, '');

  useEffect(() => {
    const el = pRef.current;
    if (!el) return;
    if (!expanded) {
      const need = el.scrollHeight > el.clientHeight + 2;
      setShowToggle(need);
    } else {
      setShowToggle(true);
    }
  }, [cleanText, expanded]);

  return (
    <div>
      <p
        ref={pRef}
        className="text-gray-700 max-w-md break-words whitespace-pre-wrap"
        style={expanded ? {} : { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {cleanText}
      </p>
      {showToggle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 mt-1"
        >
          {expanded ? 'Baca lebih sedikit' : 'Baca selengkapnya'}
        </button>
      )}
    </div>
  );
};

export default function AdminReviewsPage() {
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">("all");
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'publish', data: ReviewRow, onConfirm: () => void } | null>(null);

  const pageSize = 15;

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    let query = supabase
      .from("reviews")
      .select("id, transaction_id, customer_id, rating, comment, is_published, show_name, display_name, created_at")
      .order("created_at", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (filter === "published") query = query.eq("is_published", true);
    if (filter === "unpublished") query = query.eq("is_published", false);

    const { data, error } = await query;
    if (error) {
      setError("Gagal memuat ulasan. Coba lagi nanti.");
      toast.error('Gagal memuat ulasan.');
    } else {
      setItems((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((r) =>
      (r.comment || "").toLowerCase().includes(q) ||
      (r.display_name || "").toLowerCase().includes(q) ||
      String(r.transaction_id).includes(q)
    );
  }, [items, search]);

  const handleTogglePublish = (r: ReviewRow) => {
    setConfirmAction({ type: 'publish', data: r, onConfirm: () => executeTogglePublish(r) });
  }

  const executeTogglePublish = async (r: ReviewRow) => {
    setWorkingId(r.id);
    const prev = [...items];
    const newStatus = !r.is_published;
    setItems((list) => list.map((it) => (it.id === r.id ? { ...it, is_published: newStatus } : it)));
    const { error } = await supabase.from("reviews").update({ is_published: newStatus }).eq("id", r.id);
    if (error) {
      setItems(prev); // rollback
      toast.error("Gagal mengubah status publikasi.");
    } else {
      toast.success(`Ulasan telah ${newStatus ? 'dipublikasikan' : 'disembunyikan'}.`);
    }
    setWorkingId(null);
    setConfirmAction(null);
  };

  const handleDeleteReview = (r: ReviewRow) => {
    setConfirmAction({ type: 'delete', data: r, onConfirm: () => executeDeleteReview(r) });
  }

  const executeDeleteReview = async (r: ReviewRow) => {
    setWorkingId(r.id);
    const prev = [...items];
    setItems((list) => list.filter((it) => it.id !== r.id));
    const { error } = await supabase.from("reviews").delete().eq("id", r.id);
    if (error) {
      setItems(prev); // rollback
      toast.error("Gagal menghapus ulasan.");
    } else {
      toast.success("Ulasan berhasil dihapus.");
    }
    setWorkingId(null);
    setConfirmAction(null);
  };

  const onOpenEdit = (r: ReviewRow) => {
    setEditing({ ...r });
  };

  const onSaveEdit = async () => {
    if (!editing) return;
    if (!editing.rating || editing.rating < 1 || editing.rating > 5) {
      toast.error("Rating harus antara 1 dan 5.");
      return;
    }
    setSaving(true);
    const payload = {
      rating: editing.rating,
      comment: editing.comment || null,
      show_name: !!editing.show_name,
      display_name: editing.show_name ? (editing.display_name || null) : null,
    };
    const { error } = await supabase.from("reviews").update(payload).eq("id", editing.id);
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan perubahan.");
      return;
    }
    setItems((list) => list.map((it) => (it.id === editing.id ? { ...it, ...payload } : it)));
    setEditing(null);
    toast.success("Perubahan berhasil disimpan.");
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <main className="min-h-screen px-4 py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Moderasi Ulasan</h1>
            <p className="text-gray-500 mt-1">Kelola ulasan pelanggan: publikasi, edit, dan hapus.</p>
          </header>

          {/* Toolbar */}
          <div className="mb-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex flex-1 gap-3">
              <select
                value={filter}
                onChange={(e) => { setPage(0); setFilter(e.target.value as any); }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-200 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50"
              >
                <option value="all">Semua Ulasan</option>
                <option value="published">Terpublikasi</option>
                <option value="unpublished">Belum Publik</option>
              </select>
              <div className="relative w-full max-w-sm">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari ulasan..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-200 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">Halaman {page + 1}</div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
            {loading ? <SkeletonLoader /> : error ? <ErrorState message={error} /> : filtered.length === 0 ? <EmptyState /> : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filtered.map((r, index) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 bg-white"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-gray-500">{formatTanggal(r.created_at, true)}</div>
                        <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${r.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{r.is_published ? 'Terpublikasi' : 'Draf'}</span>
                      </div>
                      <div className="mt-1">
                        <div className="font-medium text-gray-800">{r.show_name && r.display_name ? r.display_name : <span className="text-gray-400 italic">(anonim)</span>}</div>
                        <div className="text-[11px] text-gray-500 font-mono">Trx ID: #{r.transaction_id}</div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-300 fill-current'}`} />)}
                        </div>
                        <ReadMoreClamp text={r.comment || ''} lines={4} />
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <ActionButton icon={PublishIcon} label={r.is_published ? 'Sembunyikan' : 'Publikasikan'} onClick={() => handleTogglePublish(r)} working={workingId === r.id} className="text-sky-600 hover:bg-sky-100" />
                        <ActionButton icon={EditIcon} label="Edit" onClick={() => onOpenEdit(r)} working={workingId === r.id} className="text-gray-600 hover:bg-gray-200" />
                        <ActionButton icon={DeleteIcon} label="Hapus" onClick={() => handleDeleteReview(r)} working={workingId === r.id} className="text-red-600 hover:bg-red-100" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 min-w-[1024px]">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/70 border-b border-gray-200">
                      <tr>
                        <th scope="col" className="px-6 py-3">Tanggal</th>
                        <th scope="col" className="px-6 py-3">Detail</th>
                        <th scope="col" className="px-6 py-3">Komentar</th>
                        <th scope="col" className="px-6 py-3 text-center">Status</th>
                        <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, index) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white border-b border-gray-200 hover:bg-amber-50/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatTanggal(r.created_at, true)}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{r.show_name && r.display_name ? r.display_name : <span className="text-gray-400 italic">(anonim)</span>}</div>
                            <div className="text-xs text-gray-500 font-mono">Trx ID: #{r.transaction_id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-300 fill-current'}`} />)}
                            </div>
                            <ReadMoreClamp text={r.comment || ''} lines={4} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${r.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                              {r.is_published ? 'Terpublikasi' : 'Draf'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <ActionButton icon={PublishIcon} label={r.is_published ? 'Sembunyikan' : 'Publikasikan'} onClick={() => handleTogglePublish(r)} working={workingId === r.id} className="text-sky-600 hover:bg-sky-100" />
                              <ActionButton icon={EditIcon} label="Edit" onClick={() => onOpenEdit(r)} working={workingId === r.id} className="text-gray-600 hover:bg-gray-200" />
                              <ActionButton icon={DeleteIcon} label="Hapus" onClick={() => handleDeleteReview(r)} working={workingId === r.id} className="text-red-600 hover:bg-red-100" />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-5">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading} className="w-full sm:w-auto px-5 py-2 border border-gray-300 rounded-lg bg-white font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sebelumnya</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={loading || items.length < pageSize} className="w-full sm:w-auto px-5 py-2 border border-gray-300 rounded-lg bg-white font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Berikutnya</button>
          </div>
        </div>

        <EditModal editing={editing} setEditing={setEditing} onSave={onSaveEdit} saving={saving} />
        <ConfirmationModal action={confirmAction} setAction={setConfirmAction} />
      </main>
    </>
  );
}

// --- SUB-COMPONENTS ---

const ActionButton = ({ icon: Icon, label, onClick, working, className = '' }: { icon: React.FC<{className?: string}>, label: string, onClick: () => void, working: boolean, className?: string }) => (
  <button onClick={onClick} disabled={working} className={`p-2 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait ${className}`}>
    {working ? <Spinner className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
    <span className="sr-only">{label}</span>
  </button>
);

const SkeletonLoader = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm min-w-[1024px]">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50/70">
        <tr>
          <th scope="col" className="px-6 py-3 w-1/6"><div className="h-4 bg-gray-200 rounded-full w-3/4"></div></th>
          <th scope="col" className="px-6 py-3 w-1/6"><div className="h-4 bg-gray-200 rounded-full w-1/2"></div></th>
          <th scope="col" className="px-6 py-3 w-2/6"><div className="h-4 bg-gray-200 rounded-full w-1/3"></div></th>
          <th scope="col" className="px-6 py-3 w-1/6 text-center"><div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto"></div></th>
          <th scope="col" className="px-6 py-3 w-1/6 text-right"><div className="h-4 bg-gray-200 rounded-full w-1/4 ml-auto"></div></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 7 }).map((_, i) => (
          <tr key={i} className="bg-white border-b animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-full w-5/6"></div></td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-3 bg-gray-200 rounded-full w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-full w-5/6"></div>
            </td>
            <td className="px-6 py-4 text-center"><div className="h-6 w-20 bg-gray-200 rounded-full mx-auto"></div></td>
            <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-8 w-8 bg-gray-200 rounded-full"></div></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EmptyState = () => (
  <div className="text-center p-10 md:p-16 border-t">
    <InfoIcon className="mx-auto h-12 w-12 text-gray-300" />
    <h3 className="mt-4 text-lg font-semibold text-gray-800">Tidak Ada Ulasan</h3>
    <p className="mt-1 text-sm text-gray-500">Belum ada ulasan yang cocok dengan filter Anda.</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="text-center p-10 md:p-16 border-t bg-red-50">
    <AlertTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
    <h3 className="mt-4 text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
    <p className="mt-1 text-sm text-red-600">{message}</p>
  </div>
);

const EditModal = ({ editing, setEditing, onSave, saving }: { editing: ReviewRow | null, setEditing: (r: ReviewRow | null) => void, onSave: () => void, saving: boolean }) => (
  <Transition appear show={!!editing} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={() => setEditing(null)}>
      <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">Edit Ulasan</Dialog.Title>
              {editing && <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className={`h-6 w-6 transition-colors ${i < (editing.rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-300 fill-current'}`} />)}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Komentar</label>
                  <textarea rows={4} value={editing.comment || ''} onChange={(e) => setEditing({ ...editing, comment: e.target.value.slice(0, 500) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <div className="mt-1 text-xs text-right text-gray-500">{(editing.comment?.length || 0)}/500</div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="show_name" type="checkbox" checked={!!editing.show_name} onChange={(e) => setEditing({ ...editing, show_name: e.target.checked, display_name: e.target.checked ? (editing.display_name || '') : null })} className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="show_name" className="font-medium text-gray-700">Tampilkan nama di publik</label>
                  </div>
                </div>
                <Transition show={!!editing.show_name} enter="transition-opacity duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="pl-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Publik</label>
                    <input value={editing.display_name || ''} onChange={(e) => setEditing({ ...editing, display_name: e.target.value.slice(0, 100) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Contoh: Budi S." />
                  </div>
                </Transition>
              </div>}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">Batal</button>
                <button type="button" onClick={onSave} disabled={saving} className="inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-wait">
                  {saving && <Spinner className="-ml-1 mr-2 h-5 w-5" />} {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

const ConfirmationModal = ({ action, setAction }: { action: { type: 'delete' | 'publish', data: ReviewRow, onConfirm: () => void } | null, setAction: (a: any) => void }) => {
  const isOpen = !!action;
  const isDelete = action?.type === 'delete';
  const title = isDelete ? 'Hapus Ulasan?' : `Ubah Status Publikasi?`;
  const message = isDelete ? `Anda yakin ingin menghapus ulasan untuk transaksi #${action?.data.transaction_id}? Tindakan ini tidak dapat dibatalkan.` : `Anda yakin ingin ${action?.data.is_published ? 'membatalkan publikasi' : 'mempublikasikan'} ulasan ini?`;
  const buttonClass = isDelete ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500';
  const Icon = isDelete ? AlertTriangleIcon : PublishIcon;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setAction(null)}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isDelete ? 'bg-red-100' : 'bg-sky-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                    <Icon className={`h-6 w-6 ${isDelete ? 'text-red-600' : 'text-sky-600'}`} aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-bold text-gray-900">{title}</Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{message}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                  <button type="button" onClick={action?.onConfirm} className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${buttonClass}`}>Konfirmasi</button>
                  <button type="button" onClick={() => setAction(null)} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
