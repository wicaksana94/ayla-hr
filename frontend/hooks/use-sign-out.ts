'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useSignOut() {
  const { signOut, isLoaded } = useAuth();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    if (!isLoaded) {
      window.location.href = '/';
      return;
    }
    
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  }, [signOut, isLoaded, router]);

  return handleSignOut;
}
