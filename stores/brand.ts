export const useBrandStore = defineStore('brand', () => {
    // États
    const brands = ref<Brand[]>([])
    const currentBrand = ref<Brand | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .select('*')

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            brands.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function store(brand: Omit<Brand, 'id' | 'created_at'>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .insert([brand])
                .select()
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            brands.value.push(data)
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function update(id: string, brand: Partial<Brand>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .update(brand)
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

            const index = brands.value.findIndex(b => b.id === id)
            if (index !== -1) {
                brands.value[index] = { ...brands.value[index], ...data }
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
                .from('brands')
                .delete()
                .eq('id', id)

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            brands.value = brands.value.filter(b => b.id !== id)
            return { success: true }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function show(id: string) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .select('*')
                .eq('id', id)
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            currentBrand.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        brands.value = []
        currentBrand.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        brands,
        currentBrand,
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