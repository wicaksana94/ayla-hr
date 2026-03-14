'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useSignOut() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/');
  }, [signOut, router]);

  return handleSignOut;
}
