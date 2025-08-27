'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProductRow, CategoryRow, ProductFormData } from '../../types';

export default function useProductsAdmin() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const [form, setForm] = useState<ProductFormData>({ name: '', category_id: '', price: '', description: '', tags: [] });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<null | ProductRow>(null);
  const [file, setFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  const BUCKET = 'Abadi Jaya';

  // Ekstrak {bucket, path} dari public image_url Supabase
  // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const parseStoragePath = (url: string): { bucket: string; path: string } | null => {
    try {
      const marker = '/object/public/';
      const idx = url.indexOf(marker);
      if (idx === -1) return null;
      const after = url.substring(idx + marker.length);
      const parts = after.split('/');
      const bucket = decodeURIComponent(parts.shift() || '');
      const path = decodeURIComponent(parts.join('/'));
      if (!bucket || !path) return null;
      return { bucket, path };
    } catch {
      return null;
    }
  };

  // Normalisasi dan validasi tag
  const normalizeTag = (raw: string): string => {
    const t = raw.toLowerCase().trim().replace(/\s+/g, '-');
    return t.slice(0, 20);
  };

  const addTag = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t) return;
    setForm(prev => {
      const current = Array.isArray(prev.tags) ? prev.tags : [];
      if (current.includes(t)) return prev; // dedupe
      if (current.length >= 8) return prev; // limit
      return { ...prev, tags: [...current, t] };
    });
  };

  const removeTag = (tag: string) => {
    setForm(prev => {
      const current = Array.isArray(prev.tags) ? prev.tags : [];
      return { ...prev, tags: current.filter(t => t !== tag) };
    });
  };

  // Helper guard object
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

  // State untuk memilih gambar yang sudah ada di Storage
  const [existingImages, setExistingImages] = useState<Array<{ name: string; url: string; path: string }>>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [selectedExistingUrl, setSelectedExistingUrl] = useState<string | null>(null);

  const openImagePicker = async () => {
    setImagePickerOpen(true);
    await fetchExistingImages();
  };

  const closeImagePicker = () => setImagePickerOpen(false);

  const fetchExistingImages = async () => {
    setLoadingImages(true);
    try {
      // List file di folder products/
      const { data, error } = await supabase.storage.from(BUCKET).list('products', { limit: 100, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      const files: Array<{ name: string; url: string; path: string }> = [];
      for (const item of data || []) {
        if (!item || !item.name) continue;
        const path = `products/${item.name}`;
        // Gunakan signed URL agar tetap bisa tampil jika bucket private
        const { data: signed, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
        if (signErr) {
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
          files.push({ name: item.name, url: pub.publicUrl, path });
        } else {
          files.push({ name: item.name, url: signed.signedUrl, path });
        }
      }
      setExistingImages(files);
    } catch {
      // silent fail: biarkan grid kosong jika gagal
    } finally {
      setLoadingImages(false);
    }
  };

  const selectExistingImage = (url: string) => {
    setSelectedExistingUrl(url);
    setFile(null); // pastikan tidak double sumber gambar
    setImagePickerOpen(false);
  };

  const clearSelectedExisting = () => setSelectedExistingUrl(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace('/login');
        return;
      }
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch {
        setError('Gagal memuat data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch ketika pagination berubah
  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const fetchProducts = async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    setListLoading(true);
    const { data, error, count } = await supabase
      .from('products')
      .select('id, name, description, price, is_active, image_url, tags, product_categories ( name )', { count: 'exact' })
      .order('id', { ascending: false })
      .range(from, to);
    if (error) throw error;
    setTotal(typeof count === 'number' ? count : 0);

    // Normalisasi shape relasi category (array vs object) dan tags dengan pengetikan aman
    type Raw = Record<string, unknown> & { product_categories?: unknown; tags?: unknown };
    const src: unknown[] = Array.isArray(data) ? data : [];
    const normalized: ProductRow[] = src.map((v): ProductRow => {
      const p = v as Raw;
      const catRaw = p.product_categories;
      let cat: { name: string } | null = null;
      if (Array.isArray(catRaw)) {
        const first = catRaw[0];
        if (isObj(first) && 'name' in first) {
          cat = { name: String((first as Record<string, unknown>).name) };
        }
      } else if (isObj(catRaw) && 'name' in catRaw) {
        cat = { name: String((catRaw as Record<string, unknown>).name) };
      }
      const desc = p.description === null ? null : (p.description === undefined ? null : String(p.description as unknown as string));
      const price = p.price === null ? null : (p.price === undefined ? null : Number(p.price as unknown as number));
      const active = p.is_active === null ? null : (p.is_active === undefined ? null : Boolean(p.is_active));
      const img = (p.image_url ?? null) as string | null;
      const rawTags = p.tags;
      const safeTags = Array.isArray(rawTags) ? rawTags.map(t => String(t)) : [];
      return {
        id: Number(p.id as unknown as number),
        name: String(p.name as unknown as string),
        description: desc,
        price: price,
        is_active: active,
        image_url: img,
        product_categories: cat,
        tags: safeTags,
      };
    });
    setProducts(normalized);
    setListLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('product_categories').select('id, name').order('name');
    if (error) throw error;
    setCategories((data || []).map(c => ({ id: Number(c.id), name: String(c.name) })));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setEditFile(f);
  };

  const handleCancelForm = () => {
    setForm({ name: '', category_id: '', price: '', description: '', tags: [] });
    setFile(null);
  };

  const uploadImage = async (f: File): Promise<string> => {
    const filePath = `products/${Date.now()}_${f.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, f);
    if (uploadError) throw uploadError;
    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return publicUrl.publicUrl;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category_id) return;
    setSubmitting(true);
    setError('');
    const priceNum = form.price ? Number(form.price) : null;
    let imageUrl: string | null = null;
    try {
      if (selectedExistingUrl) {
        // Cari item yang dipilih berdasarkan signed URL, lalu ambil public URL dari path untuk disimpan ke DB
        const picked = existingImages.find(i => i.url === selectedExistingUrl);
        if (picked) {
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(picked.path);
          imageUrl = pub.publicUrl;
        } else {
          // fallback: jika tidak ketemu, tetap simpan nilai yang ada
          imageUrl = selectedExistingUrl;
        }
      } else if (file) {
        imageUrl = await uploadImage(file);
      }
      const { error } = await supabase.from('products').insert({
        name: form.name,
        description: form.description || null,
        price: priceNum,
        category_id: Number(form.category_id),
        image_url: imageUrl,
        is_active: true,
        tags: (form.tags || []).slice(0, 8),
      });
      if (error) throw error;
      await fetchProducts();
      setForm({ name: '', category_id: '', price: '', description: '', tags: [] });
      setFile(null);
      setSelectedExistingUrl(null);
    } catch {
      setError('Gagal menambahkan produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (product: ProductRow) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      category_id: '', // biarkan kosong = tidak diubah kecuali dipilih
      price: product.price !== null ? String(product.price) : '',
      description: product.description || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
    });
    setEditFile(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError('');
    try {
      let imageUrl: string | undefined;
      if (editFile) {
        imageUrl = await uploadImage(editFile);
      }
      type UpdatePayload = Partial<{
        name: string;
        description: string | null;
        price: number;
        category_id: number;
        image_url: string;
        tags: string[];
      }>;
      const payload: UpdatePayload = {};
      if (form.name) payload.name = form.name;
      if (form.description !== undefined) payload.description = form.description;
      if (form.price) payload.price = Number(form.price);
      if (form.category_id) payload.category_id = Number(form.category_id);
      if (imageUrl !== undefined) payload.image_url = imageUrl;
      if (Array.isArray(form.tags)) payload.tags = form.tags.slice(0, 8);

      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) throw error;

      // Jika update sukses dan ada gambar baru, hapus gambar lama untuk menghindari orphan files
      if (imageUrl !== undefined && editing.image_url) {
        const info = parseStoragePath(editing.image_url);
        if (info) {
          await supabase.storage.from(info.bucket).remove([info.path]);
        }
      }

      await fetchProducts();
      setEditing(null);
      setEditFile(null);
    } catch {
      setError('Gagal memperbarui produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: number, newStatus: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ is_active: newStatus }).eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, is_active: newStatus } : p)));
    } catch {
      setError('Gagal mengubah status produk.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Ambil image_url terlebih dahulu untuk menghapus file storage
      const { data: prod, error: selErr } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', id)
        .single();
      if (selErr) throw selErr;

      // Hapus file storage jika ada
      if (prod?.image_url) {
        const info = parseStoragePath(prod.image_url);
        if (info) {
          await supabase.storage.from(info.bucket).remove([info.path]);
        }
      }

      // Hapus row produk di DB
      const { error: delErr } = await supabase.from('products').delete().eq('id', id);
      if (delErr) throw delErr;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Gagal menghapus produk.');
    }
  };

  return {
    // state
    loading,
    error,
    products,
    categories,
    page,
    pageSize,
    total,
    listLoading,
    form,
    submitting,
    editing,
    file,
    editFile,
    existingImages,
    loadingImages,
    imagePickerOpen,
    selectedExistingUrl,
    // setters
    setEditing,
    setPage,
    setPageSize,
    // handlers
    handleChange,
    handleFileChange,
    handleCancelForm,
    handleAddProduct,
    handleStartEdit,
    handleUpdateProduct,
    toggleActive,
    handleDelete,
    handleEditFileChange,
    openImagePicker,
    closeImagePicker,
    fetchExistingImages,
    selectExistingImage,
    clearSelectedExisting,
    addTag,
    removeTag,
  };
}
