export const useFeeStore = defineStore(
  'fee',
  () => {
    // États
    const fees = ref<Fee[]>([])
    const currentFee = ref<Fee | null>(null)
    const feeRules = ref<FeeRule[]>([])
    const currentFeeRule = ref<FeeRule | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // ========================================
    // Actions pour les frais (fees)
    // ========================================

    async function getFees() {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('fees')
          .select('*')
          .order('name', { ascending: true })

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        fees.value = data
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

    async function storeFee(fee: Omit<Fee, 'id' | 'created_at'>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('fees')
          .insert([fee])
          .select()
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        fees.value.push(data)
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

    async function updateFee(id: string, fee: Partial<Fee>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('fees')
          .update(fee)
          .eq('id', id)
          .select()
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        const index = fees.value.findIndex(f => f.id === id)
        if (index !== -1) {
          fees.value[index] = { ...fees.value[index], ...data }
        }

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

    async function destroyFee(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { error: supaError } = await supabase.from('fees').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        fees.value = fees.value.filter(f => f.id !== id)
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

    async function showFee(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('fees')
          .select('*')
          .eq('id', id)
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        currentFee.value = data
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

    // ========================================
    // Actions pour les règles de frais (fee_rules)
    // ========================================

    async function getFeeRules(feeId?: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        let query = supabase
          .from('fee_rules')
          .select('*, fee:fees(id, name, label)')
          .order('priority', { ascending: true })

        if (feeId) {
          query = query.eq('fee_id', feeId)
        }

        const { data, error: supaError } = await query

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        feeRules.value = data
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

    async function storeFeeRule(rule: Omit<FeeRule, 'id' | 'created_at'>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('fee_rules')
          .insert([rule])
          .select('*, fee:fees(id, name, label)')
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        feeRules.value.push(data)
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

    async function updateFeeRule(id: string, rule: Partial<FeeRule>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('fee_rules')
          .update(rule)
          .eq('id', id)
          .select('*, fee:fees(id, name, label)')
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        const index = feeRules.value.findIndex(r => r.id === id)
        if (index !== -1) {
          feeRules.value[index] = { ...feeRules.value[index], ...data }
        }

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

    async function destroyFeeRule(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { error: supaError } = await supabase.from('fee_rules').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        feeRules.value = feeRules.value.filter(r => r.id !== id)
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
      fees.value = []
      currentFee.value = null
      feeRules.value = []
      currentFeeRule.value = null
      loading.value = false
      error.value = null
    }

    return {
      // États
      fees,
      currentFee,
      feeRules,
      currentFeeRule,
      loading,
      error,

      // Actions - Fees
      getFees,
      storeFee,
      updateFee,
      destroyFee,
      showFee,

      // Actions - Fee Rules
      getFeeRules,
      storeFeeRule,
      updateFeeRule,
      destroyFeeRule,

      $reset,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
