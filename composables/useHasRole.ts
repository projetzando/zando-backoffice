/**
 * Vérifie si l'utilisateur connecté possède un rôle spécifique
 * Compatible avec Supabase user_metadata et app_metadata
 *
 * @param get_role - Le rôle à vérifier (buyer, seller, admin, superadmin)
 * @returns true si l'utilisateur a le rôle, false sinon
 *
 * @example
 * // Vérifier un rôle simple
 * useHasRole('admin') // true si l'utilisateur est admin
 *
 * // Utilisation dans un template
 * v-if="useHasRole('seller')"
 */
export const useHasRole = (get_role: string): boolean => {
  const auth = useAuthStore()

  // Vérification avec le nouveau système de rôle unique (Supabase)
  if (auth.connected_user?.role) {
    return auth.connected_user.role === get_role
  }

  // Fallback vers l'ancien système de rôles multiples (si encore utilisé)
  if (auth.connected_user?.roles) {
    return auth.connected_user.roles.some((role: Group) => role.name === get_role)
  }

  return false
}

/**
 * Vérifie si l'utilisateur a l'un des rôles parmi une liste
 *
 * @param roles - Tableau de rôles à vérifier
 * @returns true si l'utilisateur a au moins un des rôles
 *
 * @example
 * useHasAnyRole(['admin', 'superadmin']) // true si admin OU superadmin
 */
export const useHasAnyRole = (roles: string[]): boolean => {
  return roles.some(role => useHasRole(role))
}

/**
 * Vérifie si l'utilisateur a tous les rôles d'une liste
 * (Utile pour systèmes multi-rôles futurs)
 *
 * @param roles - Tableau de rôles requis
 * @returns true si l'utilisateur a tous les rôles
 */
export const useHasAllRoles = (roles: string[]): boolean => {
  return roles.every(role => useHasRole(role))
}

/**
 * Vérifie si l'utilisateur est autorisé à accéder au backoffice
 * Seuls seller, admin et superadmin sont autorisés
 *
 * @returns true si l'utilisateur peut accéder au backoffice
 */
export const useCanAccessBackoffice = (): boolean => {
  const auth = useAuthStore()
  const userRole = auth.connected_user?.role

  return userRole === 'seller' || userRole === 'admin' || userRole === 'superadmin'
}
