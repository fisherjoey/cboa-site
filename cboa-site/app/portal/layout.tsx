'use client'

import PortalHeader from '@/components/layout/PortalHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { MemberProvider } from '@/contexts/MemberContext';
import { ToastProvider } from '@/contexts/ToastContext';
import AuthGuard from '@/components/AuthGuard';
import MemberGuard from '@/components/portal/MemberGuard';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard requireAuth={true}>
        <RoleProvider>
          <MemberProvider>
            <ToastProvider>
              <MemberGuard>
                <div className="min-h-screen bg-gray-50">
                  <PortalHeader />

                  {/* Portal Content */}
                  <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
                    <div className="max-w-7xl mx-auto">
                      {children}
                    </div>
                  </main>
                </div>
              </MemberGuard>
            </ToastProvider>
          </MemberProvider>
        </RoleProvider>
      </AuthGuard>
    </AuthProvider>
  );
}