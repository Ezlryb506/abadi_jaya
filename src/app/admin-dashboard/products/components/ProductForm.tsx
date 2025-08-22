'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
            <Image
              src={previewUrl}
              alt="Preview"
              width={640}
              height={160}
              className="w-full max-w-sm h-40 object-cover rounded-lg border"
              unoptimized
              sizes="(min-width: 640px) 640px, 100vw"
              loading="eager"
              decoding="async"
            />
          ) : selectedExistingUrl ? (
            <Image
              src={selectedExistingUrl}
              alt="Selected from storage"
              width={640}
              height={160}
              className="w-full max-w-sm h-40 object-cover rounded-lg border"
              sizes="(min-width: 640px) 640px, 100vw"
              loading="lazy"
              decoding="async"
            />
          ) : (
            file && (
              <p className="text-sm text-gray-500">File dipilih: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            )
          )}
        </div>
      </div>

      {/* Modal Image Picker dari Storage */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto overscroll-contain">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseImagePicker} />
          <div
            className="relative z-10 w-full max-w-3xl mx-0 sm:mx-4 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[90svh] md:max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Pilih Gambar dari Storage"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-white/95 supports-[backdrop-filter]:backdrop-blur">
              <h3 className="text-lg font-semibold">Pilih Gambar dari Storage</h3>
              <button onClick={onCloseImagePicker} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Tutup">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto">
              {loadingImages ? (
                <div className="text-sm text-gray-500">Memuat gambar...</div>
              ) : existingImages.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada gambar di folder <code>products/</code>.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {existingImages.map(img => (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() => onSelectExistingImage(img.url)}
                      className="group rounded-xl border hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-orange-300 flex flex-col items-center p-2"
                      title={img.name}
                    >
                      <div className="relative w-full max-w-[170px] sm:max-w-full">
                        <Image
                          src={img.url}
                          alt={img.name}
                          width={300}
                          height={112}
                          className="w-full h-28 sm:h-24 md:h-24 object-cover group-hover:scale-[1.02] transition-transform mx-auto rounded-md"
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 rounded-b-md">
                          <p className="text-[11px] text-white truncate">{img.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 z-10 px-4 sm:px-5 py-3 sm:py-4 border-t flex justify-end bg-white/95 supports-[backdrop-filter]:backdrop-blur">
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
