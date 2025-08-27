'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CategoryRow, ProductFormData } from '../types';
import { toast } from 'sonner';

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
  addTag: (raw: string) => void;
  removeTag: (tag: string) => void;
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
  addTag,
  removeTag,
}: ProductFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModel, setAiModel] = useState<string>('gemini-1.5-flash');
  const [tagInput, setTagInput] = useState('');

  // Lock body scroll when modal open; compensate scrollbar width to avoid layout shift and phantom space
  useEffect(() => {
    if (!imagePickerOpen) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [imagePickerOpen]);

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
    <form onSubmit={onSubmit} className="space-y-6 p-5 md:p-6 bg-white rounded-2xl shadow border border-gray-100 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-gray-800">{editing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <p className="text-sm text-gray-500">Lengkapi detail produk di bawah ini.</p>
        </div>
        <div className="flex gap-2 items-stretch flex-wrap w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
            <label htmlFor="ai-model" className="text-sm text-gray-600 sm:whitespace-nowrap">Model</label>
            <select
              id="ai-model"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 w-full sm:w-auto min-w-0 max-w-full"
              title="Pilih model AI"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash (cepat)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (kualitas)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (baru)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (terbaru cepat)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (terbaru kualitas)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                setAiLoading(true);
                console.log('[AI Assist] Meminta saran ke endpoint...', {
                  hintName: form.name,
                  hasDesc: Boolean(form.description),
                });
                // Tentukan nama gambar dari pilihan user (URL storage atau file upload)
                let hintImageName = '';
                if (selectedExistingUrl) {
                  try {
                    const u = new URL(selectedExistingUrl);
                    const pathLast = u.pathname.split('/').filter(Boolean).pop() || '';
                    // Jika path mengandung dot, anggap itu nama file
                    hintImageName = pathLast;
                  } catch (e) {
                    console.warn('[AI Assist] Gagal parse URL gambar terpilih', e);
                  }
                }
                if (!hintImageName && file?.name) {
                  hintImageName = file.name;
                }
                const res = await fetch('/api/ai/product-suggest', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    hintName: form.name,
                    hintDescription: form.description,
                    categoryOptions: categories.map((c) => c.name),
                    hintImageName,
                    model: aiModel,
                  }),
                });
                if (!res.ok) {
                  const j = await res.json().catch(() => ({}));
                  console.error('[AI Assist] Gagal', j);
                  toast.error('Gagal mendapatkan saran AI');
                  return;
                }
                const data = (await res.json()) as { name: string; categoryName?: string; description: string; tags?: string[] };
                console.log('[AI Assist] Respons', data);

                // Helper untuk memicu onChange tanpa mengubah kontrak props
                const callChange = (name: keyof ProductFormData, value: string) => {
                  onChange({
                    target: { name, value },
                  } as unknown as ChangeEvent<HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement>);
                };

                if (data.name) callChange('name', data.name);
                if (data.description) callChange('description', data.description);
                if (data.categoryName) {
                  const match = categories.find((c) => c.name.toLowerCase().trim() === data.categoryName!.toLowerCase().trim());
                  if (match) {
                    callChange('category_id', String(match.id));
                  }
                }
                if (Array.isArray(data.tags) && data.tags.length) {
                  // Terapkan tags (dedupe di handler)
                  data.tags.forEach(t => addTag(t));
                }

                toast.success('Saran AI diterapkan');
              } catch (e) {
                console.error('[AI Assist] Error', e);
                toast.error('Terjadi kesalahan saat memproses AI');
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading || submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 transition disabled:opacity-60 w-full sm:w-auto"
          >
            {aiLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.728 6.728-1.414-1.414M8.686 8.686 7.272 7.272m9.9 0-1.414 1.414M8.686 15.314l-1.414 1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Meminta Saran...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Bantu Isi Otomatis (AI)</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (maks 8)</label>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border p-2">
            {(form.tags || []).map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-xs">
                #{t}
                <button type="button" onClick={() => removeTag(t)} className="p-0.5 rounded hover:bg-orange-100" aria-label={`Hapus tag ${t}`}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',' ) {
                  e.preventDefault();
                  if (tagInput.trim()) {
                    addTag(tagInput.trim());
                    setTagInput('');
                  }
                }
                if (e.key === 'Backspace' && !tagInput && (form.tags?.length || 0) > 0) {
                  // hapus tag terakhir
                  const last = (form.tags || [])[ (form.tags || []).length - 1 ];
                  if (last) removeTag(last);
                }
              }}
              placeholder="ketik lalu Enter atau koma"
              className="flex-1 min-w-0 px-3 py-1.5 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { if (tagInput.trim()) { addTag(tagInput.trim()); setTagInput(''); } }}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-sky-600 text-white hover:bg-sky-700"
            >Tambah</button>
            <button
              type="button"
              onClick={async () => {
                try {
                  setAiLoading(true);
                  const res = await fetch('/api/ai/product-suggest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      hintName: form.name,
                      hintDescription: form.description,
                      categoryOptions: categories.map((c) => c.name),
                      model: aiModel,
                    }),
                  });
                  if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    console.error('[AI Tags] Gagal', j);
                    toast.error('Gagal mendapatkan saran tag AI');
                    return;
                  }
                  const data = (await res.json()) as { tags?: string[] };
                  if (Array.isArray(data.tags) && data.tags.length) {
                    data.tags.forEach(t => addTag(t));
                    toast.success('Tags AI ditambahkan');
                  } else {
                    toast.message('AI tidak mengembalikan tags yang relevan');
                  }
                } catch (e) {
                  console.error('[AI Tags] Error', e);
                  toast.error('Terjadi kesalahan saat meminta saran tag');
                } finally {
                  setAiLoading(false);
                }
              }}
              disabled={aiLoading || submitting}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >Sarankan Tag (AI)</button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Aturan: huruf kecil, otomatis normalisasi, panjang 1-20, duplikat diabaikan.</p>
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
            <span className="text-sm text-gray-600 truncate max-w-full sm:max-w-xs" title={file.name}>
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">Format: JPG/PNG, disarankan &lt; 1MB. Preview akan muncul jika file dipilih.</p>
        <div className="mt-4">
          {previewUrl ? (
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-lg border overflow-hidden">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
                sizes="(min-width: 640px) 640px, 100vw"
                loading="eager"
                decoding="async"
              />
            </div>
          ) : selectedExistingUrl ? (
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-lg border overflow-hidden">
              <Image
                src={selectedExistingUrl}
                alt="Selected from storage"
                fill
                className="object-cover"
                sizes="(min-width: 640px) 640px, 100vw"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            file && (
              <p className="text-sm text-gray-500">File dipilih: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            )
          )}
        </div>
      </div>

      {/* Modal Image Picker dari Storage */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 box-border flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto overflow-x-hidden overscroll-contain [touch-action:pan-y]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseImagePicker} />
          <div
            className="relative z-10 w-full max-w-3xl mx-0 sm:mx-4 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[100svh] md:max-h-[85vh] flex flex-col overflow-x-hidden"
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
                <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {existingImages
                    .filter(img => !img.name.startsWith('.') && !img.path.includes('.emptyFolderPlaceholder'))
                    .map(img => (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() => onSelectExistingImage(img.url)}
                      className="group rounded-xl border hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-orange-300 flex flex-col items-center p-2"
                      title={img.name}
                    >
                      <div className="relative w-full aspect-[4/3]">
                        <Image
                          src={img.url}
                          alt={img.name}
                          fill
                          className="object-cover group-hover:scale-[1.02] transition-transform rounded-md"
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
