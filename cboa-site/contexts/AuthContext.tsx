'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { User, AuthState, UserRole } from '@/lib/auth/types';
import { hasPermission } from '@/lib/auth/roles';
import Cookies from 'js-cookie';

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const extractUserRole = (netlifyUser: any): UserRole => {
    const roles = netlifyUser?.app_metadata?.roles || [];
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('executive')) return 'executive';
    if (roles.includes('official')) return 'official';
    return 'public';
  };

  const mapNetlifyUser = useCallback((netlifyUser: any): User | null => {
    if (!netlifyUser) return null;

    return {
      id: netlifyUser.id,
      email: netlifyUser.email,
      role: extractUserRole(netlifyUser),
      fullName: netlifyUser.user_metadata?.full_name,
      phone: netlifyUser.user_metadata?.phone,
      certificationLevel: netlifyUser.user_metadata?.certification_level,
      memberSince: netlifyUser.user_metadata?.member_since 
        ? new Date(netlifyUser.user_metadata.member_since) 
        : undefined,
      lastLogin: new Date(),
    };
  }, []);

  const saveAuthToken = (token: string) => {
    Cookies.set('auth_token', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  };

  const clearAuthToken = () => {
    Cookies.remove('auth_token');
  };

  const initializeAuth = useCallback(() => {
    if (typeof window === 'undefined') return;

    netlifyIdentity.on('init', (user: any) => {
      if (user) {
        const mappedUser = mapNetlifyUser(user);
        setAuthState({
          user: mappedUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        if (user.token?.access_token) {
          saveAuthToken(user.token.access_token);
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    });

    netlifyIdentity.on('login', (user: any) => {
      const mappedUser = mapNetlifyUser(user);
      setAuthState({
        user: mappedUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      if (user.token?.access_token) {
        saveAuthToken(user.token.access_token);
      }
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      clearAuthToken();
    });

    netlifyIdentity.on('error', (err: Error) => {
      setAuthState(prev => ({
        ...prev,
        error: err.message,
        isLoading: false,
      }));
    });

    netlifyIdentity.init({
      APIUrl: process.env.NEXT_PUBLIC_NETLIFY_IDENTITY_URL || '',
    });
  }, [mapNetlifyUser]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(() => {
    netlifyIdentity.open('login');
  }, []);

  const logout = useCallback(() => {
    netlifyIdentity.logout();
  }, []);

  const hasRole = useCallback((role: UserRole): boolean => {
    return hasPermission(authState.user?.role, role);
  }, [authState.user?.role]);

  const refreshUser = useCallback(async () => {
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      try {
        await currentUser.jwt();
        const mappedUser = mapNetlifyUser(currentUser);
        setAuthState({
          user: mappedUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  }, [mapNetlifyUser]);

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    hasRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}