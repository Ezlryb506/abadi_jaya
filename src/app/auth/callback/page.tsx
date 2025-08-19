'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.exchangeCodeForSession();
      } catch (e) {
        // no-op
      } finally {
        router.replace('/');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">Memproses verifikasi...</p>
    </div>
  );
}


