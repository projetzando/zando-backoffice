/**
 * Middleware d'authentification global
 * Contrôle l'accès au backoffice selon les rôles
 *
 * Règles:
 * 1. Les utilisateurs non connectés sont redirigés vers la page de connexion
 * 2. Les buyers ne peuvent pas accéder au backoffice
 * 3. Seuls seller, admin et superadmin ont accès au dashboard
 *
 * Note: Le rôle est récupéré depuis la table `profiles` pour garantir
 * que les données sont toujours à jour
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
  if (!user.value && to.path !== "/") {
    return navigateTo("/");
  }

  // Fonction helper pour récupérer le rôle depuis la table profiles
  const getUserRole = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur récupération du rôle:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Erreur getUserRole:', error);
      return null;
    }
  };

  // Si l'utilisateur est connecté et sur la page de login
  if (user.value && to?.path === '/') {
    // Récupérer le rôle depuis la table profiles
    const userRole = await getUserRole(user.value.id);

    // Vérifier si l'utilisateur a le droit d'accéder au backoffice
    if (userRole === 'buyer' || !userRole) {
      // Les buyers ne peuvent pas accéder au backoffice
      // On les déconnecte et on affiche un message d'erreur
      await supabase.auth.signOut();
      return navigateTo('/?error=unauthorized');
    }

    // Rediriger vers le dashboard pour les rôles autorisés
    return navigateTo('/dashboard');
  }

  // Si l'utilisateur est connecté et navigue dans l'app
  if (user.value && to.path !== '/') {
    // Vérifier le rôle pour toutes les routes protégées
    const userRole = await getUserRole(user.value.id);

    // Si c'est un buyer ou si le rôle n'existe pas, on le redirige
    if (userRole === 'buyer' || !userRole) {
      await supabase.auth.signOut();
      return navigateTo('/not-authorized');
    }
  }
});
