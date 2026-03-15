'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Role } from '@/config/navigation';

// Debug logging
const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) console.log('[useUserRole]', ...args);
};

interface UseUserRoleReturn {
  role: Role;
  isLoading: boolean;
}

// Role priority: check Clerk metadata first, then fallback
export function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<Role>('employee');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      log('User not loaded yet');
      return;
    }

    log('User loaded', { 
      hasUser: !!user, 
      metadata: user?.publicMetadata,
      email: user?.primaryEmailAddress?.emailAddress
    });

    // Method 1: Get role from Clerk publicMetadata
    const publicRole = user?.publicMetadata?.role as Role | undefined;
    
    if (publicRole && ['admin', 'hr_manager', 'manager', 'employee'].includes(publicRole)) {
      log('Using role from publicMetadata:', publicRole);
      setRole(publicRole);
      setIsLoading(false);
      return;
    }

    // Method 2: Check for organization role (if using Clerk Organizations)
    const orgRole = user?.organizationMemberships?.[0]?.role;
    if (orgRole) {
      log('Organization role:', orgRole);
      // Map Clerk org roles to our roles
      if (orgRole === 'org_admin') {
        setRole('admin');
        setIsLoading(false);
        return;
      }
    }

    // Method 3: Default based on email pattern (temporary - remove in production)
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
    
    // For development: give hr_manager access to test accounts
    if (email.includes('hr') || email.includes('admin') || email.includes('manager')) {
      log('Inferring hr_manager role from email:', email);
      setRole('hr_manager');
    } else {
      log('No role found, defaulting to employee');
      setRole('employee');
    }
    
    setIsLoading(false);
  }, [isLoaded, user]);

  return { role, isLoading };
}
