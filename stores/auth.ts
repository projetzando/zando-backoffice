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

            if (error) throw error

            user.value = {
                name: data.user?.user_metadata?.name || '',
                email: data.user?.email,
                id: data.user?.id
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

            if (error) throw error
            
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
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    name: payload.name,
                    // autres champs à mettre à jour
                }
            })

            if (error) throw error

            user.value = {
                name: data.user.user_metadata.name,
                email: data.user.email,
                id: data.user.id
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

            if (error) throw error

            console.log(currentUser)

            connected_user.value = {
                name: currentUser?.user_metadata?.name || '',
                email: currentUser?.email,
                id: currentUser?.id
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
            const { error } = await supabase.auth.signOut()
            
            if (error) throw error

            // Réinitialiser le store
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