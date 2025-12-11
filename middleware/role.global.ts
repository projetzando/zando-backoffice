/**
 * Middleware de vérification des rôles basé sur les métadonnées des pages
 *
 * Utilisation dans les pages:
 * definePageMeta({
 *   roles: ['admin', 'superadmin'], // Rôles autorisés
 *   // ou
 *   requireRole: 'admin', // Un seul rôle requis
 * })
 *
 * Ce middleware vérifie que l'utilisateur connecté a le rôle nécessaire
 * pour accéder à la page. Si ce n'est pas le cas, il est redirigé.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Si l'utilisateur n'est pas connecté, laisser le middleware auth.global.ts gérer
  if (!user.value) {
    return
  }

  // Récupérer les métadonnées de rôle de la page
  const requiredRoles = to.meta.roles as string[] | undefined
  const requireRole = to.meta.requireRole as string | undefined

  // Si aucun rôle n'est requis, autoriser l'accès
  if (!requiredRoles && !requireRole) {
    return
  }

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

  // Récupérer le rôle actuel de l'utilisateur
  const userRole = await getUserRole(user.value.id)

  if (!userRole) {
    console.warn('Rôle utilisateur non trouvé')
    return navigateTo('/not-authorized')
  }

  // Vérifier si l'utilisateur a l'un des rôles requis
  let hasAccess = false

  if (requiredRoles && Array.isArray(requiredRoles)) {
    // Cas 1: Tableau de rôles (OU logique)
    hasAccess = requiredRoles.includes(userRole)
  }
  else if (requireRole) {
    // Cas 2: Un seul rôle requis
    hasAccess = userRole === requireRole
  }

  // Si l'utilisateur n'a pas accès, rediriger
  if (!hasAccess) {
    console.warn(`Accès refusé: rôle "${userRole}" non autorisé pour cette page`)
    return navigateTo('/not-authorized')
  }
})
