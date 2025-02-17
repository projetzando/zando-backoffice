export const useCategoryStore = defineStore('category', () => {
    // États
    const categories = ref<Category[]>([])
    const currentCategory = ref<Category | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Getters
    const activeCategories = computed(() => 
        categories.value.filter(cat => cat.is_active)
    )

    const categoriesByLevel = computed(() => 
        categories.value.reduce((acc, cat) => {
            acc[cat.level] = acc[cat.level] || []
            acc[cat.level].push(cat)
            return acc
        }, {} as Record<number, Category[]>)
    )

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('categories')
                .select('*')
                .order('level', { ascending: true })
                .order('name', { ascending: true })

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            categories.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function store(category: Omit<Category, 'id' | 'created_at'>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('categories')
                .insert([category])
                .select()
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            categories.value.push(data)
            return { success: true, data }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function update(id: string, category: Partial<Category>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('categories')
                .update(category)
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

            const index = categories.value.findIndex(c => c.id === id)
            if (index !== -1) {
                categories.value[index] = { ...categories.value[index], ...data }
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
                .from('categories')
                .delete()
                .eq('id', id)

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            categories.value = categories.value.filter(c => c.id !== id)
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
                .from('categories')
                .select('*')
                .eq('slug', slug)
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            currentCategory.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function getChildCategories(parentId: string) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('categories')
                .select('*')
                .eq('parent_id', parentId)
                .order('name')

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        categories.value = []
        currentCategory.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        categories,
        currentCategory,
        loading,
        error,
        
        // Getters
        activeCategories,
        categoriesByLevel,
        
        // Actions
        get,
        store,
        update,
        destroy,
        show,
        getChildCategories,
        $reset
    }
}, {
    persist: {  
        storage: piniaPluginPersistedstate.localStorage(),
    }
})