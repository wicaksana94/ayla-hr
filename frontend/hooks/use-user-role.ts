'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Role } from '@/config/navigation';

interface UseUserRoleReturn {
  role: Role;
  isLoading: boolean;
}

// Default role when not set - should be the least privileged
const DEFAULT_ROLE: Role = 'employee';

export function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    // Try to get role from Clerk's public metadata
    const publicRole = user?.publicMetadata?.role as Role | undefined;
    
    if (publicRole && ['admin', 'hr_manager', 'manager', 'employee'].includes(publicRole)) {
      setRole(publicRole);
    } else {
      // Default based on email domain or other logic - fallback to employee
      // In production, you'd want to fetch this from your backend
      setRole(DEFAULT_ROLE);
    }
    
    setIsLoading(false);
  }, [isLoaded, user]);

  return { role, isLoading };
}
