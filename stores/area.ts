export const useAreaStore = defineStore(
  'area',
  () => {
    // États
    const areas = ref<Area[]>([])
    const currentArea = ref<Area | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Actions
    async function get(cityId?: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        let query = supabase
          .from('areas')
          .select('*, city:cities(id, name)')
          .order('name', { ascending: true })

        if (cityId) {
          query = query.eq('city_id', cityId)
        }

        const { data, error: supaError } = await query

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        areas.value = data
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

    async function getPaginated(options: PaginationOptions = {}, cityId?: string) {
      const { fetchPaginated } = usePagination()
      loading.value = true
      error.value = null

      try {
        const result = await fetchPaginated<Area>(
          'areas',
          options,
          '*, city:cities(id, name)',
          (query) => {
            if (cityId) {
              query = query.eq('city_id', cityId)
            }
            return query
          },
        )

        areas.value = result.data
        return {
          success: true,
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            totalPages: result.totalPages,
          },
        }
      }
      catch (err: any) {
        error.value = err.message
        return {
          success: false,
          error: err.message,
          data: [],
          pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
        }
      }
      finally {
        loading.value = false
      }
    }

    async function store(area: Omit<Area, 'id' | 'created_at'>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('areas')
          .insert([area])
          .select('*, city:cities(id, name)')
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        areas.value.push(data)
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

    async function update(id: string, area: Partial<Area>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('areas')
          .update(area)
          .eq('id', id)
          .select('*, city:cities(id, name)')
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        const index = areas.value.findIndex(a => a.id === id)
        if (index !== -1) {
          areas.value[index] = { ...areas.value[index], ...data }
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
        const { error: supaError } = await supabase.from('areas').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        areas.value = areas.value.filter(a => a.id !== id)
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
          .from('areas')
          .select('*, city:cities(id, name)')
          .eq('id', id)
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        currentArea.value = data
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
      areas.value = []
      currentArea.value = null
      loading.value = false
      error.value = null
    }

    return {
      // États
      areas,
      currentArea,
      loading,
      error,

      // Actions
      get,
      getPaginated,
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
