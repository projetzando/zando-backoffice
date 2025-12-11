export const useSellerDomainStore = defineStore(
  'sellerDomain',
  () => {
    // États
    const domains = ref<SellerDomain[]>([])
    const currentDomain = ref<SellerDomain | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get() {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('seller_domains')
          .select('*')
          .order('domain', { ascending: true })

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        domains.value = data
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

    async function store(domain: Omit<SellerDomain, 'id' | 'created_at'>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('seller_domains')
          .insert([domain])
          .select()
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        domains.value.push(data)
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

    async function update(id: string, domain: Partial<SellerDomain>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('seller_domains')
          .update({ ...domain, updated_at: new Date().toISOString() })
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

        const index = domains.value.findIndex(d => d.id === id)
        if (index !== -1) {
          domains.value[index] = { ...domains.value[index], ...data }
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

    async function destroy(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { error: supaError } = await supabase.from('seller_domains').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        domains.value = domains.value.filter(d => d.id !== id)
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

    async function show(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('seller_domains')
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

        currentDomain.value = data
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

    function $reset() {
      domains.value = []
      currentDomain.value = null
      loading.value = false
      error.value = null
    }

    return {
      // États
      domains,
      currentDomain,
      loading,
      error,

      // Actions
      get,
      store,
      update,
      destroy,
      show,
      $reset,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
