'use client'

import PortalHeader from '@/components/layout/PortalHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import AuthGuard from '@/components/AuthGuard';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard requireAuth={true}>
        <RoleProvider>
          <div className="min-h-screen bg-gray-50">
            <PortalHeader />
            
            {/* Portal Content */}
            <main className="container mx-auto px-4 py-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </RoleProvider>
      </AuthGuard>
    </AuthProvider>
  );
}