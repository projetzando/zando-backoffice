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
    async function fetchCategories() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('categories')
                .select('*')
                .order('level', { ascending: true })
                .order('name', { ascending: true })

            if (supaError) throw supaError

            categories.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function createCategory(category: Omit<Category, 'id' | 'created_at'>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('categories')
                .insert([category])
                .select()
                .single()

            if (supaError) throw supaError

            categories.value.push(data)
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function updateCategory(id: string, category: Partial<Category>) {
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

            if (supaError) throw supaError

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

    async function deleteCategory(id: string) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { error: supaError } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (supaError) throw supaError

            categories.value = categories.value.filter(c => c.id !== id)
            return { success: true }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function getCategoryBySlug(slug: string) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('categories')
                .select('*')
                .eq('slug', slug)
                .single()

            if (supaError) throw supaError

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

            if (supaError) throw supaError

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
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryBySlug,
        getChildCategories,
        $reset
    }
}, {
    persist: {  
        storage: piniaPluginPersistedstate.localStorage(),
    }
})