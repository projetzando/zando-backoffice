/**
 * Composable pour gérer le profil utilisateur depuis la table profiles
 * Récupère les informations utilisateur incluant le rôle
 */

export const useUserProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  /**
   * Récupère le profil de l'utilisateur connecté depuis la table profiles
   * @returns Profile de l'utilisateur ou null
   */
  const getUserProfile = async (): Promise<Profile | null> => {
    if (!user.value?.id) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error)
        return null
      }

      return data as Profile
    }
    catch (error) {
      console.error('Erreur getUserProfile:', error)
      return null
    }
  }

  /**
   * Récupère uniquement le rôle de l'utilisateur connecté
   * @returns Le rôle de l'utilisateur ou null
   */
  const getUserRole = async (): Promise<'buyer' | 'seller' | 'admin' | 'superadmin' | null> => {
    if (!user.value?.id) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération du rôle:', error)
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
   * Met à jour le profil de l'utilisateur
   * @param updates - Les champs à mettre à jour
   */
  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user.value?.id) {
      return {
        success: false,
        error: 'Utilisateur non connecté',
      }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data: data as Profile,
      }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  return {
    getUserProfile,
    getUserRole,
    updateUserProfile,
  }
}
