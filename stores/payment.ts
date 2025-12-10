export const usePaymentStore = defineStore('payment', () => {
    // États
    const payments = ref<Payment[]>([])
    const currentPayment = ref<Payment | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('payments')
                .select(`
                    *,
                    order:orders(
                        id,
                        user_id
                    )
                `)
                .order('created_at', { ascending: false })

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            payments.value = data
            return { success: true, data }
        } catch (err: any) {
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
                .from('payments')
                .select(`
                    *,
                    order:orders(
                        id,
                        user_id
                    )
                `)
                .eq('id', id)
                .single()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            currentPayment.value = data
            return { success: true, data }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function updateStatus(id: string, status: Payment['status']) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('payments')
                .update({ status })
                .eq('id', id)
                .select()

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            if (!data || data.length === 0) {
                return {
                    success: false,
                    error: { message: 'Paiement introuvable ou non autorisé' },
                    data: null
                }
            }

            // Update local state
            const index = payments.value.findIndex(p => p.id === id)
            if (index !== -1) {
                payments.value[index] = { ...payments.value[index], ...data[0] }
            }

            if (currentPayment.value?.id === id) {
                currentPayment.value = { ...currentPayment.value, ...data[0] }
            }

            return { success: true, data: data[0] }
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
                .from('payments')
                .delete()
                .eq('id', id)

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            payments.value = payments.value.filter(p => p.id !== id)
            return { success: true }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        payments.value = []
        currentPayment.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        payments,
        currentPayment,
        loading,
        error,

        // Actions
        get,
        show,
        updateStatus,
        destroy,
        $reset
    }
}, {
    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
    }
})
