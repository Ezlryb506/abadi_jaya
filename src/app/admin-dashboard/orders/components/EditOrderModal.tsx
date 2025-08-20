'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  id: number;
  project_status: string;
  estimated_price: number;
  total_paid?: number;
  description?: string;
}

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

const EditOrderModal = ({ order, isOpen, onClose, onSave }: EditOrderModalProps) => {
  const [formData, setFormData] = useState({ project_status: '', estimated_price: 0, description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setFormData({
        project_status: order.project_status,
        estimated_price: order.estimated_price,
        description: order.description ?? '',
      });
    }
  }, [order]);

  // Tutup modal dengan tombol Escape saat modal terbuka
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'estimated_price' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setWarning(null);

    const projectStatuses = ['Survey', 'Design', 'Production', 'Installation', 'Completed'];

    // Validasi: status harus valid
    if (!projectStatuses.includes(formData.project_status)) {
      setIsSaving(false);
      setError('Status proyek tidak valid.');
      return;
    }
    // Validasi: estimated_price harus > 0 (schema: CHECK (estimated_price > 0))
    if (!Number.isFinite(formData.estimated_price) || formData.estimated_price <= 0) {
      setIsSaving(false);
      setError('Estimasi harga harus angka > 0.');
      return;
    }
    // Validasi: estimated_price tidak boleh kurang dari total_paid (schema: check_total_paid)
    const totalPaid = order.total_paid ?? 0;
    if (formData.estimated_price < totalPaid) {
      setIsSaving(false);
      setError(`Estimasi harga tidak boleh lebih kecil dari total dibayar (Rp${new Intl.NumberFormat('id-ID').format(totalPaid)}).`);
      return;
    }
    // Cegah Completed jika belum lunas
    const isCompleting = formData.project_status === 'Completed';
    if (isCompleting && totalPaid < formData.estimated_price) {
      setIsSaving(false);
      setError('Tidak dapat menyelesaikan proyek karena belum lunas.');
      return;
    }
    // Larang penurunan status (DB trigger validate_project_status akan menolak)
    const indexOf = (s: string) => projectStatuses.indexOf(s);
    if (indexOf(formData.project_status) < indexOf(order.project_status)) {
      setIsSaving(false);
      setError('Status proyek tidak dapat diturunkan (sesuai aturan sistem).');
      return;
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        project_status: formData.project_status,
        estimated_price: formData.estimated_price,
        description: (formData.description || '').trim() || null,
      })
      .eq('id', order.id);

    setIsSaving(false);

    if (updateError) {
      console.error('Error updating order:', updateError);
      // Mapping pesan error Supabase/DB ke pesan ramah
      const msg = String(updateError.message || '').toLowerCase();
      if (msg.includes('check_total_paid') || msg.includes('total_paid') && msg.includes('estimated_price')) {
        setError('Gagal: Estimasi harga tidak boleh kurang dari total dibayar.');
      } else if (msg.includes('project status') && msg.includes('backwards')) {
        setError('Gagal: Status proyek tidak dapat diturunkan.');
      } else if (msg.includes('estimated_price') && (msg.includes('violates') || msg.includes('check'))) {
        setError('Gagal: Estimasi harga harus > 0.');
      } else {
        setError('Gagal menyimpan perubahan.');
      }
    } else {
      onSave({ ...order, ...formData });
      onClose();
    }
  };

  const projectStatuses = ['Survey', 'Design', 'Production', 'Installation', 'Completed'];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-order-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-order-title" className="text-2xl font-bold mb-6">Edit Pesanan #{order.id}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label htmlFor="project_status" className="block text-base font-medium text-gray-800">Status Proyek</label>
            <div className="relative mt-2">
              <select
                id="project_status"
                name="project_status"
                value={formData.project_status}
                onChange={handleChange}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-base px-4 py-3 pr-12 bg-white"
                disabled={isSaving}
              >
                {projectStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-span-1">
            <label htmlFor="estimated_price" className="block text-base font-medium text-gray-800">Estimasi Harga</label>
            <input
              type="number"
              id="estimated_price"
              name="estimated_price"
              value={formData.estimated_price}
              onChange={handleChange}
              min={0}
              className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-base px-4 py-3"
              disabled={isSaving}
            />
            <p className="mt-2 text-sm text-gray-600">Total dibayar saat ini: Rp{new Intl.NumberFormat('id-ID').format(order.total_paid ?? 0)}</p>
          </div>
          <div className="md:col-span-2 col-span-1">
            <label htmlFor="description" className="block text-base font-medium text-gray-800">Deskripsi Kustom</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tuliskan deskripsi kustom pesanan..."
              className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-base px-4 py-3"
              disabled={isSaving}
            />
            <p className="mt-1 text-xs text-gray-500">Opsional. Gunakan untuk catatan teknis, spesifikasi, atau permintaan khusus.</p>
          </div>
          {error && <p className="text-red-600 text-sm -mt-2 md:col-span-2 col-span-1">{error}</p>}
          {warning && <p className="text-amber-600 text-sm -mt-2 md:col-span-2 col-span-1">{warning}</p>}
          <div className="flex justify-end gap-3 pt-2 md:col-span-2 col-span-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition disabled:opacity-60"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:bg-sky-300 transition"
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
