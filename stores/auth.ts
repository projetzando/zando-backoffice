export const useAuthStore = defineStore(
  'auth',
  () => {
    // États
    const user = ref<Auth>({ name: '' })
    const connected_user = ref<Auth>({ name: '' })
    const profile = ref<Profile | null>(null)
    const token = ref<string>('')
    const loading = ref<boolean>(false)

    // Méthodes
    async function login(payload: Auth) {
      const supabase = useSupabaseClient()
      loading.value = true

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email!,
          password: payload.password!,
        })

        if (error) {
          return {
            success: false,
            error: error,
            data: null,
          }
        }

        // Récupérer le profil depuis la table profiles pour avoir toutes les infos
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Erreur récupération profil:', profileError)
        }

        // Stocker le profil complet
        profile.value = profileData

        connected_user.value = {
          name:
            `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim()
            || data.user?.email?.split('@')[0]
            || '',
          email: data.user?.email,
          id: data.user?.id,
          role: profileData?.role || 'buyer',
        }

        token.value = data.session?.access_token || ''

        return { data: { user: user.value }, success: true }
      }
      catch (error: any) {
        return { error: error.message, success: false }
      }
      finally {
        loading.value = false
      }
    }

    async function changePassword(payload: NewPassword) {
      const supabase = useSupabaseClient()
      loading.value = true

      try {
        const { error } = await supabase.auth.updateUser({
          password: payload.password,
        })

        if (error) {
          return {
            success: false,
            error: error,
            data: null,
          }
        }

        return { success: true, data: [] }
      }
      catch (error: any) {
        return { error: error.message, success: false }
      }
      finally {
        loading.value = false
      }
    }

    async function updateProfile(updates: Partial<Profile>) {
      const supabase = useSupabaseClient()
      loading.value = true

      try {
        if (!connected_user.value.id) {
          throw new Error('Utilisateur non connecté')
        }

        // Mettre à jour le profil dans la table profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: updates.first_name,
            last_name: updates.last_name,
            phone: updates.phone,
            avatar_url: updates.avatar_url,
          })
          .eq('id', connected_user.value.id)
          .select()
          .single()

        if (profileError) throw profileError

        // Mettre à jour le state
        profile.value = profileData
        connected_user.value = {
          ...connected_user.value,
          name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        }

        return { success: true, data: profileData }
      }
      catch (error: any) {
        return { error: error.message, success: false }
      }
      finally {
        loading.value = false
      }
    }

    // Ancienne méthode update pour compatibilité
    async function update(payload: Auth) {
      return updateProfile({
        first_name: payload.name?.split(' ')[0],
        last_name: payload.name?.split(' ').slice(1).join(' '),
      })
    }

    async function connectedUser() {
      const supabase = useSupabaseClient()
      loading.value = true

      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          return {
            success: false,
            error: error,
            data: null,
          }
        }

        // Récupérer le profil depuis la table profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser?.id)
          .single()

        if (profileError) {
          console.error('Erreur récupération profil:', profileError)
        }

        // Stocker le profil complet
        profile.value = profileData

        connected_user.value = {
          name:
            `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim()
            || currentUser?.email?.split('@')[0]
            || '',
          email: currentUser?.email,
          id: currentUser?.id,
          role: profileData?.role || 'buyer',
        }

        return { success: true }
      }
      catch (error: any) {
        return { error: error.message, success: false }
      }
      finally {
        loading.value = false
      }
    }

    // Nouvelle méthode logout
    async function logout() {
      const supabase = useSupabaseClient()
      loading.value = true

      try {
        const { error: supaError } = await supabase.auth.signOut()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        // Réinitialiser le store auth
        // Note: Les autres stores seront réinitialisés par useLogout via $ResetPinia
        $reset()

        return { success: true }
      }
      catch (error: any) {
        return { error: error.message, success: false }
      }
      finally {
        loading.value = false
      }
    }

    function $reset() {
      user.value = { name: '' }
      connected_user.value = { name: '' }
      profile.value = null
      token.value = ''
      loading.value = false
    }

    // Retourne les états et méthodes
    return {
      loading,
      user,
      profile,
      $reset,
      login,
      logout,
      update,
      updateProfile,
      changePassword,
      connectedUser,
      connected_user,
      token,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
