export const useAuthStore = defineStore('auth', () => {
    // États
    const user = ref<Auth>({ name: '' })
    const connected_user = ref<Auth>({ name: '' })
    const token = ref<string>('')
    const loading = ref<boolean>(false)

    // Méthodes
    async function login(payload: Auth) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: payload.email!,
                password: payload.password!
            })

            if (error) {
                return {
                    success: false,
                    error: error,
                    data: null
                }
            }

            // Récupérer le profil depuis la table profiles pour avoir le rôle à jour
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single()

            if (profileError) {
                console.error('Erreur récupération profil:', profileError)
            }

            connected_user.value = {
                name: data.user?.user_metadata?.name || profileData?.first_name || '',
                email: data.user?.email,
                id: data.user?.id,
                role: profileData?.role || 'buyer' // Utiliser le rôle depuis profiles
            }

            token.value = data.session?.access_token || ''

            return { data: { user: user.value }, success: true }
        } catch (error) {
            return { error: error.message, success: false }
        } finally {
            loading.value = false
        }
    }

    async function changePassword(payload: NewPassword) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { error } = await supabase.auth.updateUser({
                password: payload.password
            })

            if (error) {
                return {
                    success: false,
                    error: error,
                    data: null
                }
            }
            
            return { success: true, data: [] }
        } catch (error) {
            return { error: error.message, success: false }
        } finally {
            loading.value = false
        }
    }

    async function update(payload: Auth) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase.auth.updateUser({
                data: {
                    name: payload.name,
                    // autres champs à mettre à jour
                }
            })

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            connected_user.value = {
                name: data.user.user_metadata.name,
                email: data.user.email,
                id: data.user.id,
                role: data.user.user_metadata?.role || data.user.app_metadata?.role
            }

            return { success: true, data: [] }
        } catch (error) {
            return { error: error.message, success: false }
        } finally {
            loading.value = false
        }
    }

    async function connectedUser() {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data: { user: currentUser }, error } = await supabase.auth.getUser()

            if (error) {
                return {
                    success: false,
                    error: error,
                    data: null
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

            connected_user.value = {
                name: currentUser?.user_metadata?.name || profileData?.first_name || '',
                email: currentUser?.email,
                id: currentUser?.id,
                role: profileData?.role || 'buyer' // Utiliser le rôle depuis profiles
            }

            return { success: true }
        } catch (error) {
            return { error: error.message, success: false }
        } finally {
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
                    data: null
                }
            }

            // Réinitialiser le store auth
            // Note: Les autres stores seront réinitialisés par useLogout via $ResetPinia
            $reset()

            return { success: true }
        } catch (error) {
            return { error: error.message, success: false }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        user.value = { name: '' }
        connected_user.value = { name: '' }
        token.value = ''
        loading.value = false
    }

    // Retourne les états et méthodes
    return {
        loading,
        user,
        $reset,
        login,
        logout,
        update,
        changePassword,
        connectedUser,
        connected_user,
        token,
    }
}, {
    persist: {  
        storage: piniaPluginPersistedstate.localStorage(),
    }
})