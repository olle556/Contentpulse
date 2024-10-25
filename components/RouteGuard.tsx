'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get the current path
      const path = window.location.pathname;

      if (!session && path.startsWith('/dashboard')) {
        router.push('/auth/login');
      }

      if (session && (path === '/auth/login' || path === '/auth/signup')) {
        router.push('/dashboard');
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <>{children}</>;
}