'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import CustomerAuth from '@/components/sections/CustomerAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'admin' | 'customer'>('admin');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  // Init tab via query (?tab=customer)
  useEffect(() => {
    const tab = (searchParams?.get('tab') || '').toLowerCase();
    if (tab === 'customer') setActiveTab('customer');
  }, [searchParams]);
  // Reset password state (admin)
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!formData.email || !formData.password) {
        setError('Email dan password harus diisi');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) {
        setError(signInError.message || 'Email atau password salah');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Gagal mendapatkan data user');
        return;
      }

      const { data: adminRow, error: adminErr } = await supabase
        .from('admin_users')
        .select('auth_user_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (adminErr) {
        setError('Gagal memverifikasi admin');
        return;
      }
      if (!adminRow) {
        setError('Akun ini bukan admin');
        await supabase.auth.signOut();
        return;
      }

      router.replace('/admin-dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password (Admin)
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
      setResetInfo('Tautan reset password telah dikirim. Periksa inbox/spam email Anda.');
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) : undefined;
      setResetInfo(msg || 'Terjadi kesalahan saat reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-red-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium"></div>
      </div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Tabs */}
        <div className="w-full bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setError(''); }}
              className={`py-3 rounded-xl font-semibold transition-all ${activeTab === 'admin' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🔐 Admin
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('customer'); setError(''); }}
              className={`py-3 rounded-xl font-semibold transition-all ${activeTab === 'customer' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              👤 Customer
            </button>
          </div>
        </div>

        {/* Panels */}
        {activeTab === 'admin' ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-white">🔐</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Admin Login</h2>
            <p className="text-gray-600">Masuk ke dashboard admin Bengkel Las Abadi Jaya</p>
          </div>
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Masukkan email"
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
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pl-10 pr-12 bg-white text-gray-900 placeholder-gray-500 font-medium"
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
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Lupa Password */}
            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={() => { setShowReset(true); setResetEmail(formData.email); setResetInfo(''); }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Lupa password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
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
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
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
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Info Login Admin:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Gunakan email & password akun yang sudah didaftarkan dan diberi hak admin.</p>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <CustomerAuth />
          </div>
        )}
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 right-20 w-32 h-32 bg-gradient-to-r from-orange-300/20 to-red-300/20 rounded-full mix-blend-multiply filter blur-2xl animate-float-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full mix-blend-multiply filter blur-2xl animate-float-medium pointer-events-none"></div>

      {/* Modal Reset Password (Admin) */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowReset(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reset Password Admin</h3>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setShowReset(false)} aria-label="Tutup">✖️</button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Masukkan email admin"
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
