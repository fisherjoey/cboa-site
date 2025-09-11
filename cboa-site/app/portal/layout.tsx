'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessRoute } from '@/lib/auth/roles';
import Link from 'next/link';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/?auth=required');
    } else if (!isLoading && user && !canAccessRoute(user.role, pathname)) {
      router.push('/portal');
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Portal Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link href="/portal" className="flex items-center text-gray-900 hover:text-orange-600">
                Dashboard
              </Link>
              <Link href="/portal/documents" className="flex items-center text-gray-900 hover:text-orange-600">
                Documents
              </Link>
              <Link href="/portal/the-bounce" className="flex items-center text-gray-900 hover:text-orange-600">
                The Bounce
              </Link>
              <Link href="/portal/training" className="flex items-center text-gray-900 hover:text-orange-600">
                Training
              </Link>
              <Link href="/portal/profile" className="flex items-center text-gray-900 hover:text-orange-600">
                Profile
              </Link>
              
              {user?.role === 'executive' || user?.role === 'admin' ? (
                <Link href="/portal/executive" className="flex items-center text-gray-900 hover:text-orange-600">
                  Executive
                </Link>
              ) : null}
              
              {user?.role === 'admin' ? (
                <Link href="/portal/admin" className="flex items-center text-gray-900 hover:text-orange-600">
                  Admin
                </Link>
              ) : null}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.fullName || user?.email}
              </span>
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Portal Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}