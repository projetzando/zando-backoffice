export const usePayoutStore = defineStore(
  'payout',
  () => {
    // États
    const payouts = ref<Payout[]>([])
    const currentPayout = ref<Payout | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('payouts')
          .select(
            `
                    *,
                    wallet:wallets(
                        id,
                        owner_id,
                        owner_type,
                        balance
                    )
                `,
          )
          .order('requested_at', { ascending: false })

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        payouts.value = data
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function show(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('payouts')
          .select(
            `
                    *,
                    wallet:wallets(
                        id,
                        owner_id,
                        owner_type,
                        balance
                    )
                `,
          )
          .eq('id', id)
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        currentPayout.value = data
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function updateStatus(id: string, status: Payout['status']) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const updateData: any = {
          status,
          updated_at: new Date().toISOString(),
        }

        if (status === 'done' || status === 'failed') {
          updateData.processed_at = new Date().toISOString()
        }

        const { data, error: supaError } = await supabase
          .from('payouts')
          .update(updateData)
          .eq('id', id)
          .select()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        if (!data || data.length === 0) {
          return {
            success: false,
            error: { message: 'Retrait introuvable ou non autorisé' },
            data: null,
          }
        }

        // Update local state
        const index = payouts.value.findIndex(p => p.id === id)
        if (index !== -1) {
          payouts.value[index] = { ...payouts.value[index], ...data[0] }
        }

        if (currentPayout.value?.id === id) {
          currentPayout.value = { ...currentPayout.value, ...data[0] }
        }

        return { success: true, data: data[0] }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function destroy(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { error: supaError } = await supabase.from('payouts').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        payouts.value = payouts.value.filter(p => p.id !== id)
        return { success: true }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    function $reset() {
      payouts.value = []
      currentPayout.value = null
      loading.value = false
      error.value = null
    }

    return {
      // États
      payouts,
      currentPayout,
      loading,
      error,

      // Actions
      get,
      show,
      updateStatus,
      destroy,
      $reset,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
