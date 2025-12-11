import type { PaginationOptions } from '~/utils/models/filter'
import { CACHE_CONFIG } from '~/utils/constants/api'

export const useCustomerStore = defineStore(
  'customer',
  () => {
    // États
    const customers = ref<Customer[]>([])
    const currentCustomer = ref<Customer | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // Pagination info
    const paginationInfo = ref({
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    })

    // Composables
    const { get: getFromCache, invalidatePattern } = useCache()
    const { fetchPaginated } = usePagination()
    const notification = useNotification()

    // Obtenir tous les clients avec pagination et cache
    async function getAll(
      options: PaginationOptions = {},
      filters?: {
        search?: string
      },
    ) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const cacheKey = `customers:${JSON.stringify({ ...options, ...filters })}`

        const result = await getFromCache(
          cacheKey,
          async () => {
            return await fetchPaginated<Customer>(
              'profiles',
              {
                page: options.page || 1,
                pageSize: options.pageSize || 10,
                sortBy: options.sortBy || 'created_at',
                sortOrder: options.sortOrder || 'desc',
              },
              '*',
              (query) => {
                let filteredQuery = query.eq('role', 'buyer')

                if (filters?.search) {
                  filteredQuery = filteredQuery.or(
                    `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
                  )
                }

                return filteredQuery
              },
            )
          },
          CACHE_CONFIG.DEFAULT_TTL,
        )

        paginationInfo.value = {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPreviousPage,
        }

        customers.value = result.data
        return { success: true, data: result.data, pagination: paginationInfo.value }
      }
      catch (err: any) {
        error.value = err.message
        notification.error('Erreur de chargement', err.message)
        return { success: false, error: err }
      }
      finally {
        loading.value = false
      }
    }

    // Actions
    async function get() {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase.from('profiles').select('*')

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        customers.value = data
        return { success: true, data }
      }
      catch (err) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
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
            data: null,
          }
        }

        customers.value.push(data)
        return { success: true, data }
      }
      catch (err) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
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
            data: null,
          }
        }

        const index = customers.value.findIndex(c => c.id === id)
        if (index !== -1) {
          customers.value[index] = { ...customers.value[index], ...data }
        }

        return { success: true, data }
      }
      catch (err) {
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
        const { error: supaError } = await supabase.from('profiles').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        customers.value = customers.value.filter(c => c.id !== id)
        return { success: true }
      }
      catch (err) {
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
          .from('profiles')
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

        currentCustomer.value = data
        return { success: true, data }
      }
      catch (err) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
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
      paginationInfo: readonly(paginationInfo),

      // Actions
      getAll,
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
