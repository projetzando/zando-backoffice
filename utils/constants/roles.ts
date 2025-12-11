/**
 * Rôles utilisateurs du système
 */
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

/**
 * Vérifie si un rôle est autorisé à accéder au backoffice
 */
export function canAccessBackoffice(role: string | undefined | null): boolean {
  if (!role) return false
  return [UserRole.SELLER, UserRole.ADMIN, UserRole.SUPERADMIN].includes(role as UserRole)
}

/**
 * Vérifie si un rôle a les permissions admin
 */
export function isAdmin(role: string | undefined | null): boolean {
  if (!role) return false
  return [UserRole.ADMIN, UserRole.SUPERADMIN].includes(role as UserRole)
}

/**
 * Vérifie si un rôle est superadmin
 */
export function isSuperAdmin(role: string | undefined | null): boolean {
  return role === UserRole.SUPERADMIN
}

/**
 * Liste des rôles pouvant accéder au backoffice
 */
export const BACKOFFICE_ROLES = [UserRole.SELLER, UserRole.ADMIN, UserRole.SUPERADMIN]

/**
 * Liste des rôles admin
 */
export const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN]
