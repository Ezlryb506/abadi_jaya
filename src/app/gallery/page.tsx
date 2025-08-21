'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GalleryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect halus ke halaman testimoni, menjaga UX mobile/desktop
    router.replace('/testimoni');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-orange-50 to-white p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
          <span className="text-orange-600 text-xl">⭐</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Mengalihkan ke Testimoni...</h1>
        <p className="text-sm text-gray-500 mt-2">Jika tidak otomatis, <a href="/testimoni" className="text-orange-600 hover:underline">klik di sini</a>.</p>
      </div>
    </main>
  );
}
