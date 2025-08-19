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

  const [form, setForm] = useState<ProductFormData>({ name: '', category_id: '', price: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<null | ProductRow>(null);
  const [file, setFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  const BUCKET = 'Abadi Jaya';

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
      } catch (e) {
        console.error(e);
        setError('Gagal memuat data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, is_active, image_url, product_categories ( name )')
      .order('id', { ascending: false });
    if (error) throw error;

    // Normalisasi shape relasi category (array vs object)
    const normalized: ProductRow[] = (data || []).map((p: any) => ({
      id: Number(p.id),
      name: String(p.name),
      description: p.description === null ? null : String(p.description),
      price: p.price === null ? null : Number(p.price),
      is_active: p.is_active === null ? null : Boolean(p.is_active),
      image_url: p.image_url ?? null,
      product_categories: Array.isArray(p.product_categories)
        ? (p.product_categories[0] ? { name: String(p.product_categories[0].name) } : null)
        : (p.product_categories ? { name: String(p.product_categories.name) } : null),
    }));
    setProducts(normalized);
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
    setForm({ name: '', category_id: '', price: '', description: '' });
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
      if (file) imageUrl = await uploadImage(file);
      const { error } = await supabase.from('products').insert({
        name: form.name,
        description: form.description || null,
        price: priceNum,
        category_id: Number(form.category_id),
        image_url: imageUrl,
        is_active: true,
      });
      if (error) throw error;
      await fetchProducts();
      setForm({ name: '', category_id: '', price: '', description: '' });
      setFile(null);
    } catch (e) {
      console.error(e);
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
      const payload: any = {};
      if (form.name) payload.name = form.name;
      if (form.description !== undefined) payload.description = form.description;
      if (form.price) payload.price = Number(form.price);
      if (form.category_id) payload.category_id = Number(form.category_id);
      if (imageUrl !== undefined) payload.image_url = imageUrl;

      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) throw error;

      await fetchProducts();
      setEditing(null);
      setEditFile(null);
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
      setError('Gagal mengubah status produk.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
      setError('Gagal menghapus produk.');
    }
  };

  return {
    // state
    loading,
    error,
    products,
    categories,
    form,
    submitting,
    editing,
    file,
    editFile,
    // setters
    setEditing,
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
  };
}
