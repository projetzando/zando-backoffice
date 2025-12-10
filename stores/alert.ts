export const useAlertStore = defineStore('alert', () => {
    // États
    const alerts = ref<Alert[]>([])
    const currentAlert = ref<Alert | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const { data, error: supaError } = await supabase
                .from('alerts')
                .select(`
                    *,
                    conversation:conversations(id),
                    message:messages(id, content),
                    sender:profiles!alerts_sender_id_fkey(id, first_name, last_name)
                `)
                .order('created_at', { ascending: false })

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            alerts.value = data
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
                .from('alerts')
                .select(`
                    *,
                    conversation:conversations(id),
                    message:messages(id, content),
                    sender:profiles!alerts_sender_id_fkey(id, first_name, last_name)
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

            currentAlert.value = data
            return { success: true, data }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function updateStatus(id: string, status: Alert['status'], reviewedBy?: string) {
        const supabase = useSupabaseClient()
        loading.value = true
        error.value = null

        try {
            const updateData: any = {
                status,
                updated_at: new Date().toISOString()
            }

            if (status === 'reviewed' || status === 'resolved') {
                updateData.reviewed_at = new Date().toISOString()
                if (reviewedBy) {
                    updateData.reviewed_by = reviewedBy
                }
            }

            const { data, error: supaError } = await supabase
                .from('alerts')
                .update(updateData)
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
                    error: { message: 'Alerte introuvable ou non autorisée' },
                    data: null
                }
            }

            // Update local state
            const index = alerts.value.findIndex(a => a.id === id)
            if (index !== -1) {
                alerts.value[index] = { ...alerts.value[index], ...data[0] }
            }

            if (currentAlert.value?.id === id) {
                currentAlert.value = { ...currentAlert.value, ...data[0] }
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
                .from('alerts')
                .delete()
                .eq('id', id)

            if (supaError) {
                return {
                    success: false,
                    error: supaError,
                    data: null
                }
            }

            alerts.value = alerts.value.filter(a => a.id !== id)
            return { success: true }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    function $reset() {
        alerts.value = []
        currentAlert.value = null
        loading.value = false
        error.value = null
    }

    return {
        // États
        alerts,
        currentAlert,
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
