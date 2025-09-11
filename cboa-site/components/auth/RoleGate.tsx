'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/auth/types';
import { hasPermission } from '@/lib/auth/roles';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

export default function RoleGate({ 
  children, 
  allowedRoles, 
  fallback = null,
  requireAll = false 
}: RoleGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const hasAccess = requireAll
    ? allowedRoles.every(role => hasPermission(user?.role, role))
    : allowedRoles.some(role => hasPermission(user?.role, role));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}