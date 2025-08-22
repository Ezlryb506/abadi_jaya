'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from "next/navigation";

type MaybeAuthError = { status?: number; name?: string; message?: string };
const hasStatusName = (e: unknown): e is MaybeAuthError =>
  typeof e === 'object' && e !== null && ('status' in e || 'name' in e || 'message' in e);

// Validator helpers
const isValidEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((v || '').trim());
const isStrongPassword = (v: string) => (v || '').length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
const normalizePhone = (v: string) => (v || '').replace(/[^\d+]/g, '');
const isValidPhone = (v: string) => /^(?:\+62|62|0)8\d{7,13}$/.test(normalizePhone(v));
const isValidRTRW = (v: string) => (v || '').trim() === '' || /^\d{1,3}\/\d{1,3}$/.test((v || '').trim());
const isValidHouseNumber = (v: string) => /^[-A-Za-z0-9\/]{1,10}$/.test((v || '').trim());

export default function CustomerLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    // alamat terstruktur
    province: '',
    city: '',
    district: '',
    subdistrict: '',
    street: '',
    alley: '',
    rt_rw: '',
    house_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // reset password
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // HIBP state (client-side UX)
  const [pwdBreachedCount, setPwdBreachedCount] = useState<number | null>(null);
  const [pwdCheckLoading, setPwdCheckLoading] = useState(false);
  const [pwdCheckError, setPwdCheckError] = useState('');
  const [pwdDebounced, setPwdDebounced] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.replace("/user-dashboard");
      }
    })();
  }, [router]);

  // Debounce password input for HIBP check
  useEffect(() => {
    const t = setTimeout(() => setPwdDebounced(formData.password), 450);
    return () => clearTimeout(t);
  }, [formData.password]);

  // Check HIBP when password is reasonably strong length-wise to avoid noisy calls
  useEffect(() => {
    const shouldCheck = (pwdDebounced || '').length >= 8;
    if (!shouldCheck) {
      setPwdBreachedCount(null);
      setPwdCheckError('');
      return;
    }
    let aborted = false;
    (async () => {
      try {
        setPwdCheckLoading(true);
        setPwdCheckError('');
        const res = await fetch('/api/password/hibp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwdDebounced })
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HIBP api error: ${res.status}`);
        }
        const json = await res.json();
        if (!aborted) setPwdBreachedCount(typeof json.breachedCount === 'number' ? json.breachedCount : 0);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Gagal memeriksa kebocoran password';
        if (!aborted) setPwdCheckError(msg);
      } finally {
        if (!aborted) setPwdCheckLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [pwdDebounced]);

  // Helper untuk cek HIBP on-demand saat submit
  const checkPasswordLeaked = async (password: string): Promise<number> => {
    try {
      const res = await fetch('/api/password/hibp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) throw new Error(`HIBP api error: ${res.status}`);
      const json = await res.json();
      const cnt = typeof json.breachedCount === 'number' ? json.breachedCount : 0;
      return cnt;
    } catch {
      return 0; // soft-fail: jangan blokir jika API bermasalah
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Default: biarkan spasi untuk field teks umum (name, street, dsb.)
    let nextVal: string = typeof value === 'string' ? value : String(value ?? '');

    if (name === 'email') {
      // Email: trim penuh untuk mencegah spasi tak sengaja
      nextVal = nextVal.trim();
    } else if (name === 'phone') {
      // Phone: normalisasi — hapus spasi/simbol, izinkan '+' hanya di awal
      const original = nextVal;
      nextVal = nextVal.replace(/\s+/g, '');
      nextVal = nextVal.replace(/\+/g, '');
      if (original.startsWith('+')) nextVal = `+${nextVal}`;
      nextVal = nextVal.replace(/(?!^)[^\d]/g, '');
    } else if (name === 'rt_rw') {
      // RT/RW: normalisasi ke format NN/RR (hapus spasi, karakter non-digit/non-slash, kompres slash)
      nextVal = nextVal.replace(/\s+/g, '');
      nextVal = nextVal.replace(/[^\d\/]/g, '');
      nextVal = nextVal.replace(/\/+/g, '/');
    } else if (name === 'house_number') {
      // No. Rumah: trim tepi saja
      nextVal = nextVal.trim();
    }

    setFormData(prev => ({ ...prev, [name]: nextVal }));
    setError('');
    setSuccess('');
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetInfo('');
    try {
      const email = (resetEmail || formData.email).trim();
      if (!email) {
        setResetInfo('Mohon isi email terlebih dahulu.');
        return;
      }
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setResetInfo(error.message || 'Gagal mengirim tautan reset password.');
        return;
      }
      setResetInfo('Tautan reset password sudah dikirim ke email Anda. Periksa inbox/spam.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat reset password.';
      setResetInfo(msg);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setError('Email dan password harus diisi');
          return;
        }
        if (!isValidEmail(formData.email)) {
          setError('Format email tidak valid');
          return;
        }
        if (!isStrongPassword(formData.password)) {
          setError('Password minimal 8 karakter dan kombinasi huruf & angka');
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setError(error.message || 'Email atau password salah');
          return;
        }

        setSuccess('Login berhasil!');
        const redirectUrl = searchParams.get('redirect') || '/user-dashboard';
        router.replace(redirectUrl);
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
          setError('Semua field harus diisi');
          return;
        }
        // Validasi minimal untuk alamat terstruktur
        if (!formData.province || !formData.city || !formData.district || !formData.subdistrict || !formData.street || !formData.house_number) {
          setError('Mohon lengkapi alamat: Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan, Nama Jalan, dan No. Rumah wajib diisi');
          return;
        }
        // Validasi format tambahan
        if (!isValidEmail(formData.email)) {
          setError('Format email tidak valid');
          return;
        }
        if (!isStrongPassword(formData.password)) {
          setError('Password minimal 8 karakter dan kombinasi huruf & angka');
          return;
        }
        // Cek password bocor via HIBP (blocking sebelum sign up)
        const leakedCount = await checkPasswordLeaked(formData.password);
        if (leakedCount > 0) {
          setError('Password ini telah muncul dalam kebocoran data. Mohon gunakan password lain yang lebih kuat dan unik.');
          return;
        }
        if (!isValidPhone(formData.phone)) {
          setError('Nomor telepon tidak valid (gunakan format 08xxxx / 62xxxx / +62xxxx)');
          return;
        }
        if (!isValidRTRW(formData.rt_rw)) {
          setError('Format RT/RW harus NN/RR, contoh 03/07');
          return;
        }
        if (!isValidHouseNumber(formData.house_number)) {
          setError('Nomor rumah tidak valid');
          return;
        }
        // Susun alamat gabungan sesuai pola:
        // Provinsi, Kab./Kota, Kecamatan, Kelurahan, Jl. <Nama Jalan>, <Gang>, RT/RW <xx/yy>, No. <zz>
        // Helpers normalisasi
        const stripPrefix = (val: string, patterns: RegExp[]) => {
          let out = (val || '').trim();
          patterns.forEach((re) => { out = out.replace(re, '').trim(); });
          return out;
        };
        
        // Kota/Kabupaten: gunakan persis seperti input user (tanpa auto-format)
        const cityValue = (formData.city || '').trim();

        // District (Kecamatan) tanpa prefix
        const districtName = stripPrefix(formData.district || '', [/^kec\.?\s*/i, /^kecamatan\s*/i]);
        // Subdistrict (Kelurahan/Desa) tanpa prefix
        const subdistrictName = stripPrefix(formData.subdistrict || '', [/^kel\.?\s*/i, /^kelurahan\s*/i, /^desa\s*/i]);
        // Street: pastikan "Jl." di awal, tapi hilangkan prefix beragam lebih dulu
        const streetBase = stripPrefix(formData.street || '', [/^jl\.?\s*/i, /^jalan\s*/i]);
        const streetFormatted = `Jl. ${streetBase}`.trim();
        // Alley: tanpa prefix (Gg./Gang)
        const gangName = stripPrefix(formData.alley || '', [/^gg\.?\s*/i, /^gang\s*/i]);
        const rtRwPart = formData.rt_rw ? `RT/RW ${formData.rt_rw}` : '';
        const gangPart = gangName ? gangName : '';

        const combinedAddress = [
          formData.province?.trim(),
          cityValue,
          districtName, // Kecamatan
          subdistrictName, // Kelurahan
          streetFormatted,
          gangPart,
          rtRwPart,
          `No. ${String(formData.house_number).trim()}`,
        ].filter(Boolean).join(', ');

        // Logging sementara untuk debugging (akan dihapus setelah uji coba berhasil)
        // debug logs removed

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone: formData.phone,
              address: combinedAddress,
              address_structured: {
                province: formData.province,
                city: formData.city,
                district: formData.district,
                subdistrict: formData.subdistrict,
                street: formData.street,
                alley: formData.alley,
                rt_rw: formData.rt_rw,
                house_number: formData.house_number,
              },
            },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          },
        });

        // Logging dihapus setelah uji berhasil

        if (signUpError) {
          const msg = (signUpError.message || '').toLowerCase();
          const status = hasStatusName(signUpError) ? signUpError.status : undefined;
          const name = hasStatusName(signUpError) ? (signUpError.name || '') : '';
          // Tangani email sudah terdaftar (berbagai kemungkinan pesan/status)
          if (
            msg.includes('registered') ||
            msg.includes('exists') ||
            msg.includes('already') ||
            msg.includes('taken') ||
            msg.includes('email address is already registered') ||
            status === 400 || status === 422 || name === 'AuthApiError'
          ) {
            setError('Email sudah terdaftar. Silakan cek email, login atau reset password jika lupa.');
          } else {
            setError(signUpError.message || 'Registrasi gagal');
          }
          return;
        }

        // Supabase behavior: terkadang email sudah terdaftar -> tidak error, tetapi identities kosong
        if (signUpData?.user) {
          const identities = (signUpData.user as { identities?: unknown[] } | undefined)?.identities;
          if (Array.isArray(identities) && identities.length === 0) {
            setError('Email sudah terdaftar. Silakan cek email, login atau reset password jika lupa.');
            return;
          }
        }

        // Kasus langka: tidak ada error tapi user/session tidak ada (misal throttling/konfigurasi)
        if (!signUpData?.user) {
          setError('Registrasi belum berhasil diproses. Silakan cek email Anda atau coba beberapa saat lagi.');
          return;
        }

        setSuccess('Registrasi berhasil! Silakan cek email untuk verifikasi (jika diperlukan), lalu login.');
        setIsLogin(true);
        setFormData({
          email: '',
          password: '',
          name: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          subdistrict: '',
          street: '',
          alley: '',
          rt_rw: '',
          house_number: ''
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl text-white">👤</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Customer Login' : 'Customer Registration'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Masuk ke akun customer Anda untuk akses penuh'
              : 'Daftar sebagai customer baru untuk memulai perjalanan'
            }
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              isLogin 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              !isLogin 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field (Registration only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                    autoComplete="name"
                    placeholder="Masukkan nama lengkap"
                    style={{
                      color: '#111827',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    👤
                  </span>
                </div>
              </div>
            )}

            {/* Phone Field (Registration only) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required={!isLogin}
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={16}
                    placeholder="Masukkan nomor telepon"
                    style={{
                      color: '#111827',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    📱
                  </span>
                </div>
              </div>
            )}

            {/* Address Fields (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Provinsi */}
                  <div className="relative">
                    <input
                      id="province"
                      name="province"
                      type="text"
                      required={!isLogin}
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Provinsi"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🗺️</span>
                  </div>
                  {/* Kota/Kabupaten */}
                  <div className="relative">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required={!isLogin}
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Kota/Kabupaten"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏙️</span>
                  </div>
                  {/* Kecamatan */}
                  <div className="relative">
                    <input
                      id="district"
                      name="district"
                      type="text"
                      required={!isLogin}
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Kecamatan"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                  </div>
                  {/* Kelurahan */}
                  <div className="relative">
                    <input
                      id="subdistrict"
                      name="subdistrict"
                      type="text"
                      required={!isLogin}
                      value={formData.subdistrict}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Kelurahan"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏠</span>
                  </div>
                  {/* Nama Jalan */}
                  <div className="relative sm:col-span-2">
                    <input
                      id="street"
                      name="street"
                      type="text"
                      required={!isLogin}
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Nama Jalan"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🛣️</span>
                  </div>
                  {/* Gang (opsional) */}
                  <div className="relative">
                    <input
                      id="alley"
                      name="alley"
                      type="text"
                      value={formData.alley}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Gang (opsional)"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">➡️</span>
                  </div>
                  {/* RT/RW (opsional) */}
                  <div className="relative">
                    <input
                      id="rt_rw"
                      name="rt_rw"
                      type="text"
                      value={formData.rt_rw}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="RT/RW (opsional)"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                  </div>
                  {/* No. Rumah */}
                  <div className="relative">
                    <input
                      id="house_number"
                      name="house_number"
                      type="text"
                      required={!isLogin}
                      value={formData.house_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="No. Rumah"
                      inputMode="numeric"
                      pattern="^[-A-Za-z0-9\\/]{1,10}$"
                      title="Maks 10 karakter, huruf/angka/tanda - atau /"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔢</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  autoComplete="email"
                  placeholder="Masukkan email"
                  style={{
                    color: '#111827',
                    backgroundColor: '#ffffff'
                  }}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ✉️
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 pr-12 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="Masukkan password"
                  style={{
                    color: '#111827',
                    backgroundColor: '#ffffff'
                  }}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password helper: strength + leak indicator */}
              <div className="mt-2 space-y-2">
                {/* Strength bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-500 ${
                      formData.password.length >= 12 && /[A-Z]/.test(formData.password) && /[^A-Za-z0-9]/.test(formData.password) && /\d/.test(formData.password) && /[a-z]/.test(formData.password)
                        ? 'w-full bg-green-500'
                        : isStrongPassword(formData.password)
                        ? 'w-2/3 bg-yellow-500'
                        : formData.password
                        ? 'w-1/3 bg-red-500'
                        : 'w-0'
                    }`}
                  />
                </div>
                {/* Leak status */}
                {!isLogin && (
                  <div className="text-xs flex items-center gap-2">
                    {pwdCheckLoading ? (
                      <span className="text-gray-500 animate-pulse">Memeriksa kebocoran password…</span>
                    ) : pwdCheckError ? (
                      <span className="text-gray-500">Tidak dapat memeriksa kebocoran saat ini</span>
                    ) : typeof pwdBreachedCount === 'number' ? (
                      pwdBreachedCount > 0 ? (
                        <span className="text-red-600 font-medium">⚠️ Password terdeteksi dalam {pwdBreachedCount.toLocaleString()} kebocoran</span>
                      ) : (
                        formData.password ? <span className="text-green-600 font-medium">✅ Password tidak ditemukan dalam kebocoran publik</span> : null
                      )
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            {/* Lupa Password (Login only) */}
            {isLogin && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setResetEmail(formData.email); setResetInfo(''); }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Lupa password?
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert" aria-live="polite">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">❌</span>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                  {/* CTA khusus jika email sudah terdaftar */}
                  {error.toLowerCase().includes('email sudah terdaftar') && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold underline"
                        onClick={() => setIsLogin(true)}
                      >
                        Ke halaman Login
                      </button>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold underline"
                        onClick={() => { setShowReset(true); setResetEmail(formData.email); setResetInfo(''); }}
                      >
                        Reset password
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4" role="alert" aria-live="polite">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  {isLogin ? 'Masuk' : 'Daftar'}
                </>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-3">
            <Link
              href="/"
              className="block text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
            <div className="text-gray-500 text-xs">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? 'Daftar di sini' : 'Login di sini'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2024 Bengkel Las Abadi Jaya. Customer Portal.</p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full mix-blend-multiply filter blur-2xl animate-float-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full mix-blend-multiply filter blur-2xl animate-float-medium pointer-events-none"></div>

      {/* Modal Reset Password */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowReset(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reset Password</h3>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setShowReset(false)} aria-label="Tutup">✖️</button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Masukkan email terdaftar"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
              </div>
              {resetInfo && (
                <div className="text-sm p-3 rounded-lg border bg-gray-50 text-gray-700">{resetInfo}</div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowReset(false)} className="px-4 py-2 rounded-xl border hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={resetLoading} className={`px-4 py-2 rounded-xl text-white ${resetLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}>
                  {resetLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
