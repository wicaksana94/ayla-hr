'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useSignOut() {
  const { signOut, isLoaded } = useAuth();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    if (!isLoaded) {
      // If auth is not loaded yet, just redirect to home
      router.push('/');
      return;
    }
    
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/');
    }
  }, [signOut, isLoaded, router]);

  return handleSignOut;
}
