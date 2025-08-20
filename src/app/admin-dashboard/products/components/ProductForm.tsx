'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { CategoryRow, ProductFormData } from '../types';

interface ProductFormProps {
  form: ProductFormData;
  categories: CategoryRow[];
  editing: boolean;
  submitting: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  onCancel: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  // Image picker dari Storage
  existingImages: Array<{ name: string; url: string; path: string }>;
  loadingImages: boolean;
  imagePickerOpen: boolean;
  selectedExistingUrl: string | null;
  onOpenImagePicker: () => void;
  onCloseImagePicker: () => void;
  onSelectExistingImage: (url: string) => void;
  onClearSelectedExisting: () => void;
}

export default function ProductForm({
  form,
  categories,
  editing,
  submitting,
  onSubmit,
  onCancel,
  onChange,
  onFileChange,
  file,
  existingImages,
  loadingImages,
  imagePickerOpen,
  selectedExistingUrl,
  onOpenImagePicker,
  onCloseImagePicker,
  onSelectExistingImage,
  onClearSelectedExisting,
}: ProductFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    // cleanup when unmount
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [file]);

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-6 md:p-8 bg-white rounded-2xl shadow border border-gray-100">
      <h2 className="text-2xl font-bold mb-1 text-gray-800">{editing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
      <p className="text-sm text-gray-500">Lengkapi detail produk di bawah ini.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="cth. Pipa PVC 1/2"
          className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <select
          name="category_id"
          value={form.category_id}
          onChange={onChange}
          className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
          required
        >
          <option value="">Pilih Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={onChange}
          placeholder="cth. 250000"
          className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        </div>

        <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={3}
          placeholder="Tulis deskripsi singkat produk..."
          className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {editing ? 'Gambar Produk (Biarkan kosong jika tidak ingin mengubah)' : 'Gambar Produk'}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="sr-only"
          required={!editing && !selectedExistingUrl}
          id="product-image-input"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0-9l3 3m-3-3l-3 3M16 8a4 4 0 10-8 0"/></svg>
            Pilih Gambar
          </button>
          <button
            type="button"
            onClick={onOpenImagePicker}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
            Pilih dari Storage
          </button>
          {selectedExistingUrl && (
            <button
              type="button"
              onClick={onClearSelectedExisting}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition"
              title="Hapus pilihan gambar dari Storage"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              Bersihkan Pilihan
            </button>
          )}
          {file && (
            <span className="text-sm text-gray-600 truncate max-w-xs" title={file.name}>
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">Format: JPG/PNG, disarankan &lt; 1MB. Preview akan muncul jika file dipilih.</p>
        <div className="mt-4">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full max-w-sm h-40 object-cover rounded-lg border" />
          ) : selectedExistingUrl ? (
            <img src={selectedExistingUrl} alt="Selected from storage" className="w-full max-w-sm h-40 object-cover rounded-lg border" />
          ) : (
            file && (
              <p className="text-sm text-gray-500">File dipilih: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            )
          )}
        </div>
      </div>

      {/* Modal Image Picker dari Storage */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseImagePicker} />
          <div className="relative z-10 w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Pilih Gambar dari Storage</h3>
              <button onClick={onCloseImagePicker} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Tutup">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-5">
              {loadingImages ? (
                <div className="text-sm text-gray-500">Memuat gambar...</div>
              ) : existingImages.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada gambar di folder <code>products/</code>.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map(img => (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() => onSelectExistingImage(img.url)}
                      className="group relative rounded-xl overflow-hidden border hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-orange-300"
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-28 object-cover group-hover:scale-[1.02] transition-transform" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                        <p className="text-xs text-white truncate">{img.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t flex justify-end">
              <button onClick={onCloseImagePicker} type="button" className="px-4 py-2 rounded-xl border hover:bg-gray-50">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-100"
          disabled={submitting}
        >
          Batal
        </button>
        <button
          type="submit"
          className={"px-5 py-2.5 rounded-xl text-white disabled:opacity-50 " + (submitting ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700')}
          disabled={submitting}
        >
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
