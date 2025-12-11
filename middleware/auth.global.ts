/**
 * Middleware d'authentification global
 * Contrôle l'accès au backoffice selon les rôles
 *
 * Règles:
 * 1. Les utilisateurs non connectés sont redirigés vers la page de connexion
 * 2. Les buyers ne peuvent pas accéder au backoffice
 * 3. Seuls seller, admin et superadmin ont accès au dashboard
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  /**
   * Helper pour récupérer le rôle depuis la table profiles
   */
  const getUserRole = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erreur récupération du rôle:', error)
        return null
      }

      return data?.role || null
    }
    catch (error) {
      console.error('Erreur getUserRole:', error)
      return null
    }
  }

  /**
   * Vérifie si un rôle peut accéder au backoffice
   */
  const canAccessBackoffice = (role: string | null): boolean => {
    if (!role) return false
    return ['seller', 'admin', 'superadmin'].includes(role)
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
  if (!user.value && to.path !== '/') {
    return navigateTo('/')
  }

  // Si l'utilisateur est connecté et sur la page de login
  if (user.value && to?.path === '/') {
    const userRole = await getUserRole(user.value.id)

    if (!canAccessBackoffice(userRole)) {
      await supabase.auth.signOut()
      return navigateTo('/?error=unauthorized')
    }

    return navigateTo('/dashboard')
  }

  // Si l'utilisateur est connecté et navigue dans l'app
  if (user.value && to.path !== '/') {
    const userRole = await getUserRole(user.value.id)

    if (!canAccessBackoffice(userRole)) {
      await supabase.auth.signOut()
      return navigateTo('/not-authorized')
    }
  }
})
