'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type HeaderAuthButtonsBaseProps = {
  isLoginActive: boolean;
  pathname: string;
};

type MobileProps = HeaderAuthButtonsBaseProps & {
  onNavigate?: () => void;
};

type SessionState = {
  userEmail: string | null;
  isAdmin: boolean;
};

function useHeaderSession() {
  const [sessionState, setSessionState] = useState<SessionState>({ userEmail: null, isAdmin: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (user) {
        const { data } = await supabase
          .from('admin_users')
          .select('auth_user_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        setSessionState({ userEmail: user.email ?? null, isAdmin: Boolean(data) });
      } else {
        setSessionState({ userEmail: null, isAdmin: false });
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    void init();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      void init();
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { ...sessionState, isLoading };
}

export function DesktopAuthButtons({ isLoginActive, pathname }: HeaderAuthButtonsBaseProps) {
  const { userEmail, isAdmin, isLoading } = useHeaderSession();

  if (isLoading) {
    return (
      <div className="h-10 w-40 rounded-lg bg-gray-100 animate-pulse border-2 border-gray-200" aria-hidden />
    );
  }

  if (!userEmail) {
    return (
      <Link
        href="/login"
        className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md border-2 ${
          isLoginActive
            ? 'bg-orange-600 text-white border-orange-600 shadow-lg'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
        }`}
      >
        🔐 Masuk atau Daftar
      </Link>
    );
  }

  return (
    <>
      {isAdmin && (
        <Link
          href="/admin-dashboard"
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium border-2 border-gray-200 shadow-md"
        >
          Dashboard
        </Link>
      )}
      {!isAdmin && (
        <Link
          href="/user-dashboard"
          className={`px-3 py-2 rounded-lg font-medium transition-all border-2 shadow-md ${
            pathname === '/user-dashboard'
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
              : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:border-blue-300'
          }`}
        >
          Dashboard Saya
        </Link>
      )}
    </>
  );
}

export function MobileAuthButtons({ isLoginActive, pathname, onNavigate }: MobileProps) {
  const { userEmail, isAdmin, isLoading } = useHeaderSession();

  if (isLoading) {
    return (
      <div className="inline-flex w-11/12 max-w-xs h-10 rounded-lg bg-gray-100 animate-pulse border-2 border-gray-200" aria-hidden />
    );
  }

  const handleNavigate = () => {
    onNavigate?.();
  };

  if (!userEmail) {
    return (
      <Link
        href="/login"
        className={`inline-flex w-11/12 max-w-xs justify-center text-center px-4 py-2 rounded-lg font-medium transition-all border-2 shadow-md ${
          isLoginActive
            ? 'bg-orange-600 text-white border-orange-600 shadow-lg'
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-300 shadow-md'
        }`}
        onClick={handleNavigate}
      >
        🔐 Masuk atau Daftar
      </Link>
    );
  }

  return (
    <div className="space-y-2 flex flex-col items-center w-full">
      {isAdmin && (
        <Link
          href="/admin-dashboard"
          className="inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium border-2 border-gray-200 shadow-md"
          onClick={handleNavigate}
        >
          Dashboard
        </Link>
      )}
      {!isAdmin && (
        <Link
          href="/user-dashboard"
          className={`inline-flex w-11/12 max-w-xs justify-center text-center px-3 py-2 rounded-lg font-medium transition-all border-2 shadow-md ${
            pathname === '/user-dashboard'
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
              : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:border-blue-300'
          }`}
          onClick={handleNavigate}
        >
          Dashboard Saya
        </Link>
      )}
    </div>
  );
}

export default DesktopAuthButtons;
