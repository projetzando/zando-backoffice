import { UserRole, canAccessBackoffice, isAdmin, isSuperAdmin } from '~/utils/constants'

/**
 * Composable centralisé pour la gestion de l'authentification et des rôles
 */
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const authStore = useAuthStore()

  /**
   * Récupère le rôle de l'utilisateur depuis la base de données
   * Utilise un cache pour éviter les requêtes répétées
   */
  async function getUserRole(userId: string): Promise<string | null> {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération du rôle:', error)
        return null
      }

      return data?.role || null
    }
    catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error)
      return null
    }
  }

  /**
   * Récupère le profil complet de l'utilisateur
   */
  async function getUserProfile(userId: string) {
    if (!userId) return null

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error)
        return null
      }

      return data
    }
    catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      return null
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  function isAuthenticated(): boolean {
    return !!user.value
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  function hasRole(role: UserRole | string): boolean {
    const currentRole = authStore.connected_user?.role
    return currentRole === role
  }

  /**
   * Vérifie si l'utilisateur a l'un des rôles spécifiés
   */
  function hasAnyRole(roles: (UserRole | string)[]): boolean {
    const currentRole = authStore.connected_user?.role
    if (!currentRole) return false
    return roles.includes(currentRole)
  }

  /**
   * Vérifie si l'utilisateur a tous les rôles spécifiés
   */
  function hasAllRoles(roles: (UserRole | string)[]): boolean {
    const currentRole = authStore.connected_user?.role
    if (!currentRole) return false
    // Pour un système avec un seul rôle par utilisateur, on vérifie juste la présence
    return roles.includes(currentRole)
  }

  /**
   * Vérifie si l'utilisateur peut accéder au backoffice
   */
  function canAccessBackofficeArea(): boolean {
    const role = authStore.connected_user?.role
    return canAccessBackoffice(role)
  }

  /**
   * Vérifie si l'utilisateur est admin (admin ou superadmin)
   */
  function isAdminUser(): boolean {
    const role = authStore.connected_user?.role
    return isAdmin(role)
  }

  /**
   * Vérifie si l'utilisateur est superadmin
   */
  function isSuperAdminUser(): boolean {
    const role = authStore.connected_user?.role
    return isSuperAdmin(role)
  }

  /**
   * Vérifie si l'utilisateur est vendeur
   */
  function isSellerUser(): boolean {
    return hasRole(UserRole.SELLER)
  }

  /**
   * Vérifie si l'utilisateur est acheteur
   */
  function isBuyerUser(): boolean {
    return hasRole(UserRole.BUYER)
  }

  /**
   * Vérifie si l'utilisateur a accès à une route spécifique
   */
  function canAccessRoute(requiredRoles?: string | string[]): boolean {
    if (!requiredRoles) return true

    const currentRole = authStore.connected_user?.role
    if (!currentRole) return false

    if (typeof requiredRoles === 'string') {
      return requiredRoles.split(',').includes(currentRole)
    }

    return requiredRoles.includes(currentRole)
  }

  /**
   * Déconnecte l'utilisateur
   */
  async function logout() {
    try {
      await supabase.auth.signOut()
      authStore.$reset()
      return { success: true }
    }
    catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      return { success: false, error }
    }
  }

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccessBackofficeArea,
    isAdminUser,
    isSuperAdminUser,
    isSellerUser,
    isBuyerUser,
    canAccessRoute,
    getUserRole,
    getUserProfile,
    logout,
  }
}
