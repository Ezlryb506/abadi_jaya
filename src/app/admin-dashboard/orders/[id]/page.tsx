'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import EditOrderModal from '../components/EditOrderModal';
import { formatTanggal } from '@/lib/format';

const OrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Form: Project Update
  const [updStatus, setUpdStatus] = useState('');
  const [updDesc, setUpdDesc] = useState('');
  const [updFile, setUpdFile] = useState<File | null>(null);
  const [addingUpdate, setAddingUpdate] = useState(false);

  // Form: Payment History
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState<string>('');
  const [payNotes, setPayNotes] = useState('');
  const [payFile, setPayFile] = useState<File | null>(null);
  const [addingPayment, setAddingPayment] = useState(false);

  const BUCKET = 'Abadi Jaya';
  const MAX_PROOF_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  // Edit Payment Modal State
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [epAmount, setEpAmount] = useState<string>('');
  const [epDate, setEpDate] = useState<string>('');
  const [epNotes, setEpNotes] = useState<string>('');
  const [epFile, setEpFile] = useState<File | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const uploadToStorage = async (folder: string, f: File): Promise<string> => {
    const filePath = `${folder}/${Date.now()}_${f.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, f);
    if (uploadError) throw uploadError;
    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return publicUrl.publicUrl;
  };

  // Open Edit Payment Modal
  const openEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setEpAmount(String(payment.payment_amount ?? ''));
    // payment_date mungkin ISO, normalize ke input datetime-local
    const d = payment.payment_date ? new Date(payment.payment_date) : null;
    const isoLocal = d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16) : '';
    setEpDate(isoLocal);
    setEpNotes(payment.payment_notes ?? '');
    setEpFile(null);
  };

  // Update Payment
  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    // Validasi amount
    if (!epAmount) {
      setToast({ type: 'error', message: 'Jumlah pembayaran wajib diisi.' });
      return;
    }
    const newAmount = Number(epAmount);
    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      setToast({ type: 'error', message: 'Jumlah pembayaran harus lebih dari 0 dan valid.' });
      return;
    }
    // Validasi tanggal
    if (epDate) {
      const d = new Date(epDate);
      if (isNaN(d.getTime())) {
        setToast({ type: 'error', message: 'Format tanggal tidak valid.' });
        return;
      }
    }
    // Validasi file
    if (epFile) {
      if (!ALLOWED_PROOF_TYPES.includes(epFile.type)) {
        setToast({ type: 'error', message: 'Tipe file bukti harus JPG/PNG/PDF.' });
        return;
      }
      if (epFile.size > MAX_PROOF_SIZE) {
        setToast({ type: 'error', message: 'Ukuran file bukti maksimal 5MB.' });
        return;
      }
    }

    // Cegah melebihi sisa saat edit: izinkan hingga (remaining + originalAmount)
    const estLocal = typeof order?.estimated_price === 'number' ? order.estimated_price : null;
    const paidLocal = typeof order?.total_paid === 'number' ? order.total_paid : 0;
    const originalAmount = Number(editingPayment.payment_amount) || 0;
    if (estLocal !== null) {
      const remainingPlusOriginal = Math.max(0, estLocal - (paidLocal - originalAmount));
      if (newAmount > remainingPlusOriginal) {
        setToast({ type: 'error', message: `Jumlah baru melebihi batas. Maksimal: Rp${new Intl.NumberFormat('id-ID').format(remainingPlusOriginal)}.` });
        return;
      }
    }

    setUpdatingPayment(true);
    try {
      let payment_proof = editingPayment.payment_proof as string | null;
      if (epFile) {
        payment_proof = await uploadToStorage('payments', epFile);
      }
      const payload: any = {
        payment_amount: newAmount,
        payment_date: epDate ? new Date(epDate).toISOString() : editingPayment.payment_date,
        payment_notes: epNotes || null,
        payment_proof,
      };
      const { data: updated, error } = await supabase
        .from('payment_history')
        .update(payload)
        .eq('id', editingPayment.id)
        .select()
        .single();
      if (error) throw error;
      // Optimistic update: replace item pada state lokal
      setOrder((prev: any) => {
        if (!prev) return prev;
        const prevList = Array.isArray(prev.payment_history) ? prev.payment_history : [];
        const nextList = prevList.map((p: any) => (p.id === editingPayment.id ? { ...p, ...updated } : p));
        // Recompute total lokal agar header langsung update
        const nextTotal = nextList.reduce((sum: number, p: any) => sum + (Number(p?.payment_amount) || 0), 0);
        return { ...prev, payment_history: nextList, total_paid: nextTotal };
      });
      setToast({ type: 'success', message: 'Riwayat pembayaran berhasil diperbarui.' });
      setEditingPayment(null);
      setEpAmount(''); setEpDate(''); setEpNotes(''); setEpFile(null);
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memperbarui pembayaran.' });
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Delete Payment
  const handleDeletePayment = async (payment: any) => {
    const ok = window.confirm('Hapus riwayat pembayaran ini? Tindakan tidak dapat dibatalkan.');
    if (!ok) return;
    try {
      const { error } = await supabase.from('payment_history').delete().eq('id', payment.id);
      if (error) throw error;
      // Optimistic update: hapus dari state lokal
      setOrder((prev: any) => {
        if (!prev) return prev;
        const prevList = Array.isArray(prev.payment_history) ? prev.payment_history : [];
        const nextList = prevList.filter((p: any) => p.id !== payment.id);
        const nextTotal = nextList.reduce((sum: number, p: any) => sum + (Number(p?.payment_amount) || 0), 0);
        return { ...prev, payment_history: nextList, total_paid: nextTotal };
      });
      setToast({ type: 'success', message: 'Riwayat pembayaran berhasil dihapus.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menghapus pembayaran.' });
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetail = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customers (*),
          product_categories (*),
          products (*),
          payment_history (*),
          project_updates (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        setError('Gagal memuat detail pesanan.');
      } else {
        setOrder(data);
        setLastSyncedAt(new Date());
      }
      setLoading(false);
      setSyncing(false);
    };

    fetchOrderDetail();

    // Realtime untuk transactions, project_updates, payment_history
    const channel = supabase.channel(`realtime-order-detail-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `id=eq.${id}` }, () => { setSyncing(true); fetchOrderDetail(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates', filter: `transaction_id=eq.${id}` }, () => { setSyncing(true); fetchOrderDetail(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_history', filter: `transaction_id=eq.${id}` }, () => { setSyncing(true); fetchOrderDetail(); })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [id]);

  // Auto-dismiss toast setelah beberapa detik
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading) {
    return <div className="text-center py-10">Memuat detail pesanan...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-10">Pesanan tidak ditemukan.</div>;
  }

  const handleSaveOrder = (updatedOrder: any) => {
    setOrder((prevOrder: any) => ({ ...prevOrder, ...updatedOrder }));
  };

  // Derived: progress & sisa tagihan
  const est = typeof order?.estimated_price === 'number' ? order.estimated_price : 0;
  const paidFromHistory = Array.isArray(order?.payment_history)
    ? order.payment_history.reduce((sum: number, p: any) => sum + (Number(p?.payment_amount) || 0), 0)
    : 0;
  // Fallback ke kolom total_paid jika payment_history kosong (untuk kompatibilitas data lama)
  const paid = paidFromHistory > 0 ? paidFromHistory : (typeof order?.total_paid === 'number' ? order.total_paid : 0);
  const remaining = Math.max(0, est - paid);
  const pct = est > 0 ? Math.min(100, Math.round((paid / est) * 100)) : 0;

  // Estimated completion helpers (admin view)
  const dueDate = order?.estimated_completion ? new Date(order.estimated_completion) : null;
  const isCompleted = order?.project_status === 'Completed';
  const now = new Date();
  const endOfDue = dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59) : null;
  const isOverdue = !!(endOfDue && now > endOfDue && !isCompleted);
  const daysLate = isOverdue && endOfDue ? Math.ceil((now.getTime() - endOfDue.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const projectStatuses = ['Survey', 'Design', 'Production', 'Installation', 'Completed'];
    const descTrim = (updDesc || '').trim();
    // Validasi: status wajib dan harus salah satu enum, deskripsi wajib
    if (!updStatus || !projectStatuses.includes(updStatus)) {
      setToast({ type: 'error', message: 'Status proyek wajib diisi dan harus valid (Survey/Design/Production/Installation/Completed).' });
      return;
    }
    if (!descTrim) {
      setToast({ type: 'error', message: 'Deskripsi update proyek wajib diisi.' });
      return;
    }
    // Cegah duplikasi status berturut-turut (status terbaru sama dengan yang dipilih)
    if (Array.isArray(order?.project_updates) && order.project_updates.length > 0) {
      const latest = order.project_updates.reduce((acc: any, cur: any) => {
        const tAcc = new Date(acc?.created_at || 0).getTime();
        const tCur = new Date(cur?.created_at || 0).getTime();
        return tCur > tAcc ? cur : acc;
      }, order.project_updates[0]);
      const latestStatus = latest?.status as string | undefined;
      if (latestStatus && latestStatus === updStatus) {
        setToast({ type: 'info', message: `Status "${updStatus}" sudah menjadi update terbaru/terakhir. Pilih status lain / batalkan update.` });
        return;
      }
    }
    // Validasi: status tidak boleh mundur dari status transaksi saat ini
    const currentIdx = projectStatuses.indexOf(order.project_status as string);
    const newIdx = projectStatuses.indexOf(updStatus);
    if (newIdx < currentIdx) {
      setToast({ type: 'error', message: `Status baru tidak boleh lebih rendah dari status saat ini (${order.project_status}).` });
      return;
    }
    // Validasi file (opsional): hanya image dan maks 5MB
    if (updFile) {
      if (!updFile.type.startsWith('image/')) {
        setToast({ type: 'error', message: 'Foto update harus berupa gambar.' });
        return;
      }
      if (updFile.size > MAX_PROOF_SIZE) {
        setToast({ type: 'error', message: 'Ukuran foto maksimal 5MB.' });
        return;
      }
    }
    setAddingUpdate(true);
    try {
      // Ambil identitas pengguna untuk kolom updated_by (wajib jika NOT NULL)
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      const actor = (currentUser?.user_metadata?.name as string) || currentUser?.email || 'SYSTEM';

      let photo_url: string | null = null;
      if (updFile) {
        photo_url = await uploadToStorage('updates', updFile);
      }
      const payload: any = {
        transaction_id: Number(id),
        status: updStatus,
        description: descTrim,
        photo_url,
        updated_by: actor,
      };
      const { data: insertedUpdate, error } = await supabase
        .from('project_updates')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      // Sinkronkan status transaksi jika status baru tidak mundur
      try {
        const currentIdx = projectStatuses.indexOf(order.project_status as string);
        const newIdx = projectStatuses.indexOf(updStatus);
        if (newIdx >= currentIdx && updStatus !== order.project_status) {
          const { error: txErr } = await supabase
            .from('transactions')
            .update({ project_status: updStatus })
            .eq('id', id);
          if (txErr) throw txErr;
          // Optimistic update status transaksi di state lokal
          setOrder((prev: any) => prev ? { ...prev, project_status: updStatus } : prev);
        } else {
        }
      } catch (syncErr) {
        setToast({ type: 'error', message: 'Status transaksi gagal disinkronkan. Silakan refresh.' });
      }
      // Optimistic update ke daftar project_updates di state lokal
      setOrder((prev: any) => {
        if (!prev) return prev;
        const prevList = Array.isArray(prev.project_updates) ? prev.project_updates : [];
        const nextList = insertedUpdate ? [insertedUpdate, ...prevList] : prevList;
        return { ...prev, project_updates: nextList };
      });
      setUpdStatus('');
      setUpdDesc('');
      setUpdFile(null);
      setIsUpdateModalOpen(false);
      setToast({ type: 'success', message: 'Update proyek berhasil ditambahkan.' });
    } catch (err: any) {
      setError('Gagal menambahkan update proyek.');
      const msg = err?.message || 'Terjadi kesalahan saat menyimpan update proyek.';
      setToast({ type: 'error', message: msg });
    } finally {
      setAddingUpdate(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!payAmount) {
      setToast({ type: 'error', message: 'Jumlah pembayaran wajib diisi.' });
      return;
    }
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast({ type: 'error', message: 'Jumlah pembayaran harus lebih dari 0 dan valid.' });
      return;
    }
    // Cegah melebihi sisa tagihan jika ada estimated_price
    const est = typeof order?.estimated_price === 'number' ? order.estimated_price : null;
    const alreadyPaid = typeof order?.total_paid === 'number' ? order.total_paid : 0;
    if (est !== null) {
      const remaining = Math.max(0, est - alreadyPaid);
      if (amount > remaining) {
        setToast({ type: 'error', message: `Jumlah melebihi sisa tagihan. Sisa: Rp${new Intl.NumberFormat('id-ID').format(remaining)}.` });
        return;
      }
    }
    // Validasi tanggal (opsional: jika diisi harus valid)
    if (payDate) {
      const d = new Date(payDate);
      if (isNaN(d.getTime())) {
        setToast({ type: 'error', message: 'Format tanggal tidak valid.' });
        return;
      }
    }
    // Validasi file bukti (ukuran/tipe)
    if (payFile) {
      if (!ALLOWED_PROOF_TYPES.includes(payFile.type)) {
        setToast({ type: 'error', message: 'Tipe file bukti harus JPG/PNG/PDF.' });
        return;
      }
      if (payFile.size > MAX_PROOF_SIZE) {
        setToast({ type: 'error', message: 'Ukuran file bukti maksimal 5MB.' });
        return;
      }
    }
    setAddingPayment(true);
    try {
      // Ambil identitas pengguna untuk kolom recorded_by (wajib jika NOT NULL)
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      const actor = (currentUser?.user_metadata?.name as string) || currentUser?.email || 'SYSTEM';

      let payment_proof: string | null = null;
      if (payFile) {
        payment_proof = await uploadToStorage('payments', payFile);
      }
      const payload: any = {
        transaction_id: Number(id),
        payment_amount: amount,
        payment_date: payDate ? new Date(payDate).toISOString() : new Date().toISOString(),
        payment_notes: payNotes || null,
        payment_proof,
        recorded_by: actor,
      };
      const { data: inserted, error } = await supabase
        .from('payment_history')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      // (opsional) update total_paid di transactions sisi client
      // await supabase.from('transactions').update({ total_paid: (order?.total_paid || 0) + Number(payAmount) }).eq('id', id);
      setPayAmount('');
      setPayDate('');
      setPayNotes('');
      setPayFile(null);
      // Optimistic update: sinkronkan ke state lokal segera
      setOrder((prev: any) => {
        if (!prev) return prev;
        const prevList = Array.isArray(prev.payment_history) ? prev.payment_history : [];
        const nextList = inserted ? [...prevList, inserted] : prevList;
        const nextTotal = (typeof prev.total_paid === 'number' ? prev.total_paid : 0) + amount;
        return { ...prev, payment_history: nextList, total_paid: nextTotal };
      });
      setToast({ type: 'success', message: 'Pembayaran berhasil ditambahkan.' });
      setIsAddPaymentOpen(false);
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menambahkan pembayaran. Silakan coba lagi.' });
    } finally {
      setAddingPayment(false);
    }
  };

  return (
    <>
      {/* Global Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] rounded-lg border p-3 text-sm shadow-lg transition-all duration-300 ${
          toast.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : toast.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-sky-200 bg-sky-50 text-sky-700'
        }`}>
          {toast.message}
        </div>
      )}
      <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Detail Pesanan #{order.id}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/admin-dashboard/orders')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>

      {/* Informasi Pelanggan dan Pesanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4">Informasi Pelanggan</h2>
          <div className="space-y-2">
            <p><strong>Nama:</strong> {order.customers.name}</p>
            <p><strong>Telepon:</strong> {order.customers.phone}</p>
            <p><strong>Alamat:</strong> {order.customers.address}</p>
            <p><strong>Email:</strong> {order.customers.email}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-lg font-semibold">Informasi Pesanan</h2>
            <div>
              {syncing ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 px-3 py-1 text-xs animate-pulse">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
                  Sinkronisasi realtime...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 text-xs">
                  Terakhir sinkron: {lastSyncedAt ? formatTanggal(lastSyncedAt, true) : '-'}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p><strong>Tanggal Pesan:</strong> {formatTanggal(order.order_date, false)}</p>
            <p><strong>Status Proyek:</strong> {order.project_status}</p>
            <p className="flex items-center gap-2"><strong>Estimasi Selesai:</strong> <span className={`${isOverdue ? 'text-red-600 font-semibold' : ''}`}>{dueDate ? formatTanggal(dueDate.toISOString(), false) : '-'}</span>{isOverdue && (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs">Terlambat{daysLate > 0 ? ` ${daysLate}h` : ''}</span>)}</p>
            <p><strong>Harga:</strong> Rp {new Intl.NumberFormat('id-ID').format(order.estimated_price)}</p>
            <p><strong>Total Bayar:</strong> Rp {new Intl.NumberFormat('id-ID').format(order.total_paid)}</p>
            <p className="text-sm text-gray-600"><strong>Sisa Tagihan:</strong> Rp {new Intl.NumberFormat('id-ID').format(remaining)}</p>
            {/* Progress Pembayaran */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{pct}%</span>
                <span>Rp {new Intl.NumberFormat('id-ID').format(paid)} / Rp {new Intl.NumberFormat('id-ID').format(est)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <p><strong>Metode Pembayaran:</strong> {order.payment_method}</p>
            <div className="pt-3 flex flex-col sm:flex-row flex-wrap gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit Pesanan
              </button>
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Tambah Riwayat Pembayaran
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                Update Status Proyek
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Produk */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <h2 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4">Detail Produk</h2>
        <p><strong>Kategori:</strong> {order.product_categories.name}</p>
        {order.products && <p><strong>Nama Produk:</strong> {order.products.name}</p>}
        <p className="mt-2"><strong>Deskripsi Kustom:</strong></p>
        <p className="text-gray-600">{order.description}</p>
      </div>

      {/* Riwayat Proyek dan Pembayaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4">Update Proyek</h2>
          {/* Form dipindah ke modal. Bagian ini hanya menampilkan riwayat. */}
          <ul className="space-y-3 break-words">
            {Array.isArray(order.project_updates) && order.project_updates.length > 0 ? [...order.project_updates]
              .sort((a:any,b:any)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((update: any) => (
              <li key={update.id} className="border-b pb-2">
                <p><strong>Status:</strong> {update.status}</p>
                <p>{update.description}</p>
                <p className="text-sm text-gray-500">{formatTanggal(update.created_at, true)}</p>
                {update.photo_url && (
                  <img src={update.photo_url} alt="update" className="mt-2 w-full max-w-full h-auto aspect-video object-cover rounded" />
                )}
              </li>
            )) : <p>Belum ada update.</p>}
          </ul>
        </div>
        {/* Kolom Riwayat Pembayaran */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4">Riwayat Pembayaran</h2>
          <ul className="space-y-3">
            {Array.isArray(order.payment_history) && order.payment_history.length > 0 ? [...order.payment_history]
              .sort((a:any,b:any)=> new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
              .map((payment: any) => (
              <li key={payment.id} className="border-b pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p><strong>Jumlah:</strong> Rp{new Intl.NumberFormat('id-ID').format(payment.payment_amount)}</p>
                    <p className="text-sm text-gray-500">{formatTanggal(payment.payment_date, true)}</p>
                    {payment.payment_notes && (
                      <p className="text-sm text-gray-600">{payment.payment_notes}</p>
                    )}
                    {payment.payment_proof && (
                      <a href={payment.payment_proof} target="_blank" rel="noreferrer" className="inline-block text-sky-600 hover:underline text-sm mt-1">Lihat Bukti</a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditPayment(payment)}
                      className="px-3 py-1 text-xs rounded border border-sky-300 text-sky-700 hover:bg-sky-50 transition"
                    >Edit</button>
                    <button
                      onClick={() => handleDeletePayment(payment)}
                      className="px-3 py-1 text-xs rounded border border-rose-300 text-rose-700 hover:bg-rose-50 transition"
                    >Hapus</button>
                  </div>
                </div>
              </li>
            )) : <p>Belum ada pembayaran.</p>}
          </ul>

          {/* Modal Edit Pembayaran */}
          {editingPayment && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Edit Pembayaran</h3>
                <form onSubmit={handleUpdatePayment} className="grid grid-cols-1 gap-3">
                  <input
                    type="number"
                    value={epAmount}
                    onChange={(e) => setEpAmount(e.target.value)}
                    placeholder="Jumlah bayar (Rp)"
                    className="px-3 py-2 border rounded-lg"
                    min={1}
                    step={1}
                    required
                  />
                  <input
                    type="datetime-local"
                    value={epDate}
                    onChange={(e) => setEpDate(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    value={epNotes}
                    onChange={(e) => setEpNotes(e.target.value)}
                    placeholder="Catatan (opsional)"
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setEpFile(e.target.files?.[0] || null)}
                    className="block text-sm text-gray-600"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => { setEditingPayment(null); setEpAmount(''); setEpDate(''); setEpNotes(''); setEpFile(null); }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={updatingPayment}
                    >Batal</button>
                    <button
                      type="submit"
                      disabled={updatingPayment}
                      className={`px-4 py-2 rounded-lg text-white ${updatingPayment ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'} transition`}
                    >{updatingPayment ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <EditOrderModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      order={order}
      onSave={handleSaveOrder}
    />
    {/* Modal Update Proyek */}
    {isUpdateModalOpen && (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4">Update Status Proyek</h3>
          <form onSubmit={handleAddUpdate} className="grid grid-cols-1 gap-3">
            <select
              value={updStatus}
              onChange={(e) => setUpdStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="" disabled>Pilih Status Proyek</option>
              <option value="Survey" disabled={order.project_status && ['Design','Production','Installation','Completed'].includes(order.project_status)}>Survey</option>
              <option value="Design" disabled={order.project_status && ['Production','Installation','Completed'].includes(order.project_status)}>Design</option>
              <option value="Production" disabled={order.project_status && ['Installation','Completed'].includes(order.project_status)}>Production</option>
              <option value="Installation" disabled={order.project_status && ['Completed'].includes(order.project_status)}>Installation</option>
              <option value="Completed">Completed</option>
            </select>
            <textarea
              value={updDesc}
              onChange={(e) => setUpdDesc(e.target.value)}
              placeholder="Deskripsi update"
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUpdFile(e.target.files?.[0] || null)}
              className="block text-sm text-gray-600"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => { setIsUpdateModalOpen(false); setUpdStatus(''); setUpdDesc(''); setUpdFile(null); }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={addingUpdate}
              >Batal</button>
              <button
                type="submit"
                disabled={addingUpdate}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white ${addingUpdate ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'} transition`}
              >{addingUpdate ? 'Menyimpan...' : 'Simpan Update'}</button>
            </div>
          </form>
        </div>
      </div>
    )}
    {/* Modal Tambah Pembayaran */}
    {isAddPaymentOpen && (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4">Tambah Pembayaran</h3>
          <form onSubmit={handleAddPayment} className="grid grid-cols-1 gap-3">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="Jumlah bayar (Rp)"
              className="w-full px-3 py-2 border rounded-lg"
              min={1}
              step={1}
              required
            />
            <input
              type="datetime-local"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="Catatan (opsional)"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPayFile(e.target.files?.[0] || null)}
              className="block text-sm text-gray-600"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => { setIsAddPaymentOpen(false); setPayAmount(''); setPayDate(''); setPayNotes(''); setPayFile(null); }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={addingPayment}
              >Batal</button>
              <button
                type="submit"
                disabled={addingPayment}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white ${addingPayment ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'} transition`}
              >{addingPayment ? 'Menyimpan...' : 'Simpan Pembayaran'}</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default OrderDetailPage;
