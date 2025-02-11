export const useCurrencyStore = defineStore('currency', () => {
    // États
    const currencies = ref<Currency[]>([])
    const currentCurrency = ref<Currency | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('currencies')
                .select('*')

            if (supaError) throw supaError

            currencies.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function store(currency: Omit<Currency, 'id' | 'created_at'>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('currencies')
                .insert([currency])
                .select()
                .single()

            if (supaError) throw supaError

            currencies.value.push(data)
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function update(id: string, currency: Partial<Currency>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('currencies')
                .update(currency)
                .eq('id', id)
                .select()
                .single()

            if (supaError) throw supaError

            const index = currencies.value.findIndex(c => c.id === id)
            if (index !== -1) {
                currencies.value[index] = { ...currencies.value[index], ...data }
            }

            return { success: true, data }
        } catch (err) {
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
                .from('currencies')
                .delete()
                .eq('id', id)

            if (supaError) throw supaError

            currencies.value = currencies.value.filter(c => c.id !== id)
            return { success: true }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function show(slug: string) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('currencies')
                .select('*')
                .eq('slug', slug)
                .single()

            if (supaError) throw supaError

            currentCurrency.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        currencies.value = []
        currentCurrency.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        currencies,
        currentCurrency,
        loading,
        error,
        
        // Actions
        get,
        store,
        update,
        destroy,
        show,
        $reset
    }
}, {
    persist: {  
        storage: piniaPluginPersistedstate.localStorage(),
    }
})