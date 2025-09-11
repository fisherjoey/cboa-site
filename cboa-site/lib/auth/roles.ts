import { UserRole } from './types';

export const roleHierarchy: Record<UserRole, number> = {
  public: 0,
  official: 1,
  executive: 2,
  admin: 3,
};

export function hasPermission(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessRoute(userRole: UserRole | undefined, path: string): boolean {
  const routePermissions: Record<string, UserRole> = {
    '/portal': 'official',
    '/portal/documents': 'official',
    '/portal/the-bounce': 'official',
    '/portal/training': 'official',
    '/portal/profile': 'official',
    '/portal/directory': 'official',
    '/portal/assignments': 'official',
    '/portal/resources': 'official',
    '/portal/executive': 'executive',
    '/portal/executive/analytics': 'executive',
    '/portal/executive/finance': 'executive',
    '/portal/executive/minutes': 'executive',
    '/portal/executive/announcements': 'executive',
    '/portal/admin': 'admin',
    '/portal/admin/users': 'admin',
    '/portal/admin/roles': 'admin',
    '/portal/admin/settings': 'admin',
    '/portal/admin/audit': 'admin',
  };

  const requiredRole = Object.entries(routePermissions)
    .filter(([route]) => path.startsWith(route))
    .map(([, role]) => role)
    .sort((a, b) => roleHierarchy[b] - roleHierarchy[a])[0];

  if (!requiredRole) return true;
  return hasPermission(userRole, requiredRole);
}