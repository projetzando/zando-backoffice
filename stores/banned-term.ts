export const useBannedTermStore = defineStore('bannedTerm', () => {
    // États
    const bannedTerms = ref<BannedTerm[]>([])
    const currentTerm = ref<BannedTerm | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('banned_terms')
                .select('*')
                .order('created_at', { ascending: false })

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            bannedTerms.value = data
            return { success: true, data }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function store(term: Omit<BannedTerm, 'id' | 'created_at' | 'updated_at'>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('banned_terms')
                .insert([term])
                .select()
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            bannedTerms.value.unshift(data)
            return { success: true, data }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function update(id: string, term: Partial<BannedTerm>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('banned_terms')
                .update(term)
                .eq('id', id)
                .select()
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            const index = bannedTerms.value.findIndex(t => t.id === id)
            if (index !== -1) {
                bannedTerms.value[index] = { ...bannedTerms.value[index], ...data }
            }

            return { success: true, data }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function destroy(id: string) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { error: supaError } = await supabase
                .from('banned_terms')
                .delete()
                .eq('id', id)

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            bannedTerms.value = bannedTerms.value.filter(t => t.id !== id)
            return { success: true }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function toggleActive(id: string, isActive: boolean) {
        return update(id, { is_active: isActive })
    }

    function $reset() {
        bannedTerms.value = []
        currentTerm.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        bannedTerms,
        currentTerm,
        loading,
        error,

        // Actions
        get,
        store,
        update,
        destroy,
        toggleActive,
        $reset
    }
}, {
    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
    }
})
