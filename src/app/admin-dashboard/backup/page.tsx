'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface ProductRow {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean | null;
  image_url?: string | null;
  product_categories: { name: string } | null;
}

interface CategoryRow {
  id: number;
  name: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  // Form state
  const [form, setForm] = useState<{ name: string; category_id: string; price: string; description: string }>(
    { name: '', category_id: '', price: '', description: '' }
  );
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

      const { data: adminRow, error: adminErr } = await supabase
        .from('admin_users')
        .select('auth_user_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (adminErr || !adminRow) {
        setError('Akses ditolak. Akun ini bukan admin.');
        return;
      }

      await Promise.all([fetchCategories(), fetchProducts()]);
      setLoading(false);
    })();
  }, [router]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('product_categories').select('id,name').order('name');
    if (!error && data) setCategories(data as CategoryRow[]);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,description,price,is_active,image_url,product_categories(name)')
      .order('id', { ascending: false });
    if (error) {
      setError('Gagal memuat produk');
      return;
    }
    const normalized: ProductRow[] = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      is_active: p.is_active,
      image_url: p.image_url ?? null,
      product_categories: Array.isArray(p.product_categories)
        ? (p.product_categories[0] ? { name: String(p.product_categories[0].name) } : null)
        : (p.product_categories ? { name: String(p.product_categories.name) } : null),
    }));
    setProducts(normalized);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category_id) return;
    setSubmitting(true);
    setError('');
    const priceNum = form.price ? Number(form.price) : null;
    let imageUrl: string | null = null;
    try {
      if (file) {
        const filePath = `products/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        imageUrl = pub.publicUrl;
      }
    } catch (err: any) {
      setError(err?.message || 'Upload gambar gagal');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('products').insert({
      name: form.name,
      category_id: Number(form.category_id),
      price: priceNum,
      description: form.description || null,
      is_active: true,
      image_url: imageUrl,
    });
    if (error) {
      setError(error.message || 'Gagal menambah produk');
    } else {
      setForm({ name: '', category_id: '', price: '', description: '' });
      setFile(null);
      await fetchProducts();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setError(error.message || 'Gagal menghapus produk');
    } else {
      await fetchProducts();
    }
  };

  const handleStartEdit = (row: ProductRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      category_id: '',
      price: row.price ? String(row.price) : '',
      description: row.description || ''
    });
    setEditFile(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError('');
    const priceNum = form.price ? Number(form.price) : null;
    const payload: any = { name: form.name, price: priceNum, description: form.description || null };
    try {
      if (editFile) {
        const filePath = `products/${Date.now()}_${editFile.name}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, editFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: editFile.type,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        payload.image_url = pub.publicUrl;
      }
    } catch (err: any) {
      setError(err?.message || 'Upload gambar gagal');
      setSubmitting(false);
      return;
    }
    if (form.category_id) payload.category_id = Number(form.category_id);
    const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
    if (error) {
      setError(error.message || 'Gagal mengubah produk');
    } else {
      setEditing(null);
      setForm({ name: '', category_id: '', price: '', description: '' });
      setEditFile(null);
      await fetchProducts();
    }
    setSubmitting(false);
  };

  const toggleActive = async (id: number, nextActive: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: nextActive }).eq('id', id);
    if (error) setError(error.message || 'Gagal mengubah status');
    else await fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Memuat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-600">Kelola produk katalog</p>
        </div>

        {/* Form tambah produk */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tambah Produk</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" placeholder="Nama produk" required />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" required>
                <option value="">Pilih kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Harga (Rp)</label>
              <input name="price" type="number" min="0" step="1000" value={form.price} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" placeholder="cth: 2500000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" placeholder="Deskripsi singkat" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button disabled={submitting} className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition disabled:opacity-60">
                {submitting ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel produk */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Daftar Produk</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Gambar</th>
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Kategori</th>
                  <th className="py-2 pr-4">Harga</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-3 pr-4">{p.id}</td>
                    <td className="py-3 pr-4">{p.image_url ? (<img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded" />) : (<span className="text-gray-400">—</span>)}</td>
                    <td className="py-3 pr-4 font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 pr-4">{p.product_categories?.name || '-'}</td>
                    <td className="py-3 pr-4">{typeof p.price === 'number' ? `Rp ${p.price.toLocaleString('id-ID')}` : '-'}</td>
                    <td className="py-3 pr-4">{p.is_active ? 'Aktif' : 'Nonaktif'}</td>
                    <td className="py-3 pr-4 flex gap-2">
                      <button onClick={() => handleStartEdit(p)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                      <button onClick={() => toggleActive(p.id, !p.is_active)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">{p.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                      <button onClick={() => handleDelete(p.id)} className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Edit */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Produk</h3>
                <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
              </div>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl">
                    <option value="">(Tidak diubah)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga (Rp)</label>
                  <input name="price" type="number" min="0" step="1000" value={form.price} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditing(null)} className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200">Batal</button>
                  <button disabled={submitting} className="px-5 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60">
                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


