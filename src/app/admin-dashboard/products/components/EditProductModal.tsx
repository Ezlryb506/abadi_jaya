'use client';

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { CategoryRow, ProductFormData } from '../types';

interface EditProductModalProps {
  open: boolean;
  form: ProductFormData;
  categories: CategoryRow[];
  submitting: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onClose: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  currentImageUrl?: string | null;
}

export default function EditProductModal({ open, form, categories, submitting, onChange, onSubmit, onClose, onFileChange, currentImageUrl }: EditProductModalProps) {
  if (!open) return null;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLocalFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (f) {
      const url = URL.createObjectURL(f);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    onFileChange(e);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 md:p-7 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Edit Produk</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 pb-2 sm:pb-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
            <input name="name" value={form.name} onChange={onChange} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select name="category_id" value={form.category_id} onChange={onChange} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">(Tidak diubah)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Harga (Rp)</label>
            <input name="price" type="number" min="0" step="1000" value={form.price} onChange={onChange} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea name="description" rows={3} value={form.description} onChange={onChange} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="border rounded-xl p-3 bg-gray-50">
                <div className="text-xs text-gray-500 mb-2">Saat ini</div>
                {currentImageUrl ? (
                  <img src={currentImageUrl} alt="Current" className="w-full h-40 object-cover rounded-lg border" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-gray-400 border rounded-lg bg-white">Tidak ada gambar</div>
                )}
              </div>
              <div className="border rounded-xl p-3 bg-gray-50">
                <div className="text-xs text-gray-500 mb-2">Preview baru</div>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg border" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-gray-400 border rounded-lg bg-white">Belum dipilih</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih gambar baru (opsional)</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLocalFileChange} className="sr-only" id="edit-image-input" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0-9l3 3m-3-3l-3 3M16 8a4 4 0 10-8 0"/></svg>
                Pilih Gambar
              </button>
              <p className="mt-2 text-xs text-gray-500">Format: JPG/PNG, disarankan &lt; 1MB.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-300">Batal</button>
            <button disabled={submitting} className="px-5 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-60">
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
