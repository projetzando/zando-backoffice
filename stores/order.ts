export const useOrderStore = defineStore('order', () => {
    // États
    const orders = ref<Order[]>([])
    const currentOrder = ref<Order | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Getters
    const activeOrders = computed(() => 
        orders.value.filter(order => order.is_active)
    )

    const ordersByLevel = computed(() => 
        orders.value.reduce((acc, order) => {
            acc[order.level] = acc[order.level] || []
            acc[order.level].push(order)
            return acc
        }, {} as Record<number, Order[]>)
    )

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('orders')
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

            orders.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function store(order: Omit<Order, 'id' | 'created_at'>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('orders')
                .insert([order])
                .select()
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            orders.value.push(data)
            return { success: true, data }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function update(id: string, order: Partial<Order>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('orders')
                .update(order)
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

            const index = orders.value.findIndex(o => o.id === id)
            if (index !== -1) {
                orders.value[index] = { ...orders.value[index], ...data }
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
                .from('orders')
                .delete()
                .eq('id', id)

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            orders.value = orders.value.filter(o => o.id !== id)
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
                .from('orders')
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

            currentOrder.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        orders.value = []
        currentOrder.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        orders,
        currentOrder,
        loading,
        error,
        
        // Getters
        activeOrders,
        ordersByLevel,
        
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