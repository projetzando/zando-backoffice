export const useCustomerStore = defineStore('customer', () => {
    // États
    const customers = ref<Customer[]>([])
    const currentCustomer = ref<Customer | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('profiles')
                .select('*')

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            customers.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function store(customer: Omit<Customer, 'id' | 'created_at'>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('profiles')
                .insert([customer])
                .select()
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            customers.value.push(data)
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function update(id: string, customer: Partial<Customer>) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('profiles')
                .update(customer)
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

            const index = customers.value.findIndex(c => c.id === id)
            if (index !== -1) {
                customers.value[index] = { ...customers.value[index], ...data }
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
                .from('profiles')
                .delete()
                .eq('id', id)

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            customers.value = customers.value.filter(c => c.id !== id)
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
                .from('profiles')
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

            currentCustomer.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        customers.value = []
        currentCustomer.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        customers,
        currentCustomer,
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