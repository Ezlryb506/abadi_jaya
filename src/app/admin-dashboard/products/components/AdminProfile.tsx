'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UserMetadata {
  name?: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  namaJalan?: string;
  gang?: string;
  rtRw?: string;
  noRumah?: string;
  address?: string;
}

interface FormState {
  name: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  namaJalan: string;
  gang: string;
  rtRw: string;
  noRumah: string;
}

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    namaJalan: '',
    gang: '',
    rtRw: '',
    noRumah: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const user = data.user;
      const meta: Partial<UserMetadata> = (user?.user_metadata ?? {}) as Partial<UserMetadata>;
      setForm((f) => ({
        ...f,
        name: meta?.name || '',
        email: user?.email || '',
        provinsi: meta?.provinsi || '',
        kota: meta?.kota || '',
        kecamatan: meta?.kecamatan || '',
        kelurahan: meta?.kelurahan || '',
        namaJalan: meta?.namaJalan || '',
        gang: meta?.gang || '',
        rtRw: meta?.rtRw || '',
        noRumah: meta?.noRumah || '',
      }));
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (form.newPassword && form.newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setSaving(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const currentEmail = userData.user?.email || '';

      const payload: {
        data?: Record<string, string>;
        email?: string;
        password?: string;
      } = {};

      // Build formatted address and update profile + address metadata
      const rtRwStr = form.rtRw ? `RT/RW ${form.rtRw}` : '';
      const noRumahStr = form.noRumah ? `No. ${form.noRumah}` : '';
      const formattedAddress = [
        form.provinsi,
        form.kota,
        form.kecamatan,
        form.kelurahan,
        form.namaJalan,
        form.gang,
        rtRwStr,
        noRumahStr,
      ].filter(Boolean).join(', ');

      payload.data = {
        name: form.name,
        provinsi: form.provinsi,
        kota: form.kota,
        kecamatan: form.kecamatan,
        kelurahan: form.kelurahan,
        namaJalan: form.namaJalan,
        gang: form.gang,
        rtRw: form.rtRw,
        noRumah: form.noRumah,
        address: formattedAddress,
      };

      // 1) Update metadata first (most reliable)
      const { data: metaUpd, error: metaErr } = await supabase.auth.updateUser({ data: payload.data });
      if (metaErr) throw metaErr;

      // 1b) Persist to public.customers table like user-dashboard does
      const authUserId = userData.user?.id;
      if (authUserId) {
        // First, get the customer ID like user-dashboard does
        const { data: customerData } = await supabase
          .from('customers')
          .select('id')
          .eq('auth_user_id', authUserId)
          .maybeSingle();
        
        if (customerData?.id) {
          // Update existing customer record
          const { error: custErr } = await supabase
            .from('customers')
            .update({
              name: form.name,
              email: form.email || currentEmail,
              address: formattedAddress,
            })
            .eq('id', customerData.id);
          if (custErr) throw custErr;
        } else {
          // Create new customer record if doesn't exist
          const { error: createErr } = await supabase
            .from('customers')
            .insert({
              auth_user_id: authUserId,
              name: form.name,
              email: form.email || currentEmail,
              address: formattedAddress,
            });
          if (createErr) throw createErr;
        }
      }
      
      // 2) Update email if changed (may trigger verification and fail due to settings)
      if (form.email && form.email !== currentEmail) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: form.email });
        if (emailErr) throw emailErr;
      }

      // 3) Update password if provided
      if (form.newPassword) {
        const { error: passErr } = await supabase.auth.updateUser({ password: form.newPassword });
        if (passErr) throw passErr;
      }

      // Prefer the returned user from metadata update; fallback to refetch if missing
      const u = metaUpd?.user ?? (await supabase.auth.getUser()).data?.user;
      if (u) {
        const meta2: Partial<UserMetadata> = (u.user_metadata ?? {}) as Partial<UserMetadata>;
        setForm((f) => ({
          ...f,
          name: meta2?.name ?? f.name,
          provinsi: meta2?.provinsi ?? f.provinsi,
          kota: meta2?.kota ?? f.kota,
          kecamatan: meta2?.kecamatan ?? f.kecamatan,
          kelurahan: meta2?.kelurahan ?? f.kelurahan,
          namaJalan: meta2?.namaJalan ?? f.namaJalan,
          gang: meta2?.gang ?? f.gang,
          rtRw: meta2?.rtRw ?? f.rtRw,
          noRumah: meta2?.noRumah ?? f.noRumah,
        }));
      }

      setMessage('Profil berhasil diperbarui.');
      setForm((f) => ({ ...f, newPassword: '', confirmPassword: '' }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui profil';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card: Pengaturan Akun */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Pengaturan Akun</h2>
          <p className="text-sm text-gray-500">Ubah nama tampilan, email, atau password akun admin Anda.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-5 max-w-xl">
            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-2">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Nama tampilan"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="email@contoh.com"
              />
              <p className="text-xs text-gray-500 mt-1">Perubahan email mungkin memerlukan verifikasi melalui email.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 pr-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-pressed={showNewPassword}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword((v) => !v)}
                  >
                    {showNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 pr-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-pressed={showConfirmPassword}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  setForm((f) => ({ ...f, newPassword: '', confirmPassword: '' }));
                  setMessage(null);
                  setError(null);
                }}
              >
                Reset
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="px-5 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Card: Alamat (mirror user-dashboard) */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Alamat</h2>
          <p className="text-sm text-gray-500">Atur alamat admin/toko. Field mengikuti format di dashboard pelanggan.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
              <input name="provinsi" value={form.provinsi} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: Jawa Barat" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota/Kabupaten</label>
              <input name="kota" value={form.kota} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: Kab. Bekasi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
              <input name="kecamatan" value={form.kecamatan} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: Cibitung" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelurahan</label>
              <input name="kelurahan" value={form.kelurahan} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: Wanasari" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jalan</label>
              <input name="namaJalan" value={form.namaJalan} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: Jl. Bosih Raya" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gang</label>
              <input name="gang" value={form.gang} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: Bunga" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RT/RW</label>
              <input name="rtRw" value={form.rtRw} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: 001/017" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Rumah</label>
              <input name="noRumah" value={form.noRumah} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="contoh: 5" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50" onClick={() => setMessage(null)}>Bersihkan Notif</button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60">
                {saving ? 'Menyimpan...' : 'Simpan Alamat'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
