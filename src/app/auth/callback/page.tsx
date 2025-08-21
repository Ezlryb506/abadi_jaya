'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'loading' | 'recovery' | 'done'>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      const qsType = searchParams.get('type');
      const code = searchParams.get('code');
      // Parse hash fragment (Supabase sering kirim token dan type di hash)
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const hashParams = new URLSearchParams((hash || '').replace(/^#/, ''));
      const hashType = hashParams.get('type');
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      try {
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
        // Jika token ada di hash, set session secara langsung
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
        const finalType = hashType || qsType;
        if (finalType === 'recovery') {
          setMode('recovery');
          return;
        }
        // default: verification / sign-in redirect
        setMode('done');
        router.replace('/');
      } catch (e: any) {
        setError(e?.message || 'Terjadi kesalahan saat memproses tautan.');
      }
    })();
  }, [router, searchParams]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (!password || password.length < 6) {
        setError('Password minimal 6 karakter.');
        return;
      }
      if (password !== confirm) {
        setError('Konfirmasi password tidak sama.');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message || 'Gagal memperbarui password.');
        return;
      }
      setSuccess('Password berhasil diperbarui.');
      setTimeout(() => {
        router.replace('/customer-login');
      }, 1200);
    } catch (e: any) {
      setError(e?.message || 'Terjadi kesalahan saat memperbarui password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'recovery') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-6">
          <h1 className="text-xl font-semibold mb-1">Atur Ulang Password</h1>
          <p className="text-sm text-gray-600 mb-4">Masukkan password baru Anda.</p>
          {error && (
            <div className="mb-3 text-sm p-3 rounded-lg border bg-red-50 text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-3 text-sm p-3 rounded-lg border bg-green-50 text-green-700">{success}</div>
          )}
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password baru</label>
              <input
                type="password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konfirmasi password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => router.replace('/customer-login')}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-xl text-white ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {submitting ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // default loading/redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">Memproses...</p>
    </div>
  );
}


