import type { PaginationOptions } from '~/utils/models/filter'
import { CACHE_CONFIG } from '~/utils/constants/api'

export const usePaymentStore = defineStore(
  'payment',
  () => {
    // États
    const payments = ref<Payment[]>([])
    const currentPayment = ref<Payment | null>(null)
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

    // Obtenir tous les paiements avec pagination et cache
    async function getAll(
      options: PaginationOptions = {},
      filters?: {
        status?: string
        method?: string
        search?: string
      },
    ) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const cacheKey = `payments:${JSON.stringify({ ...options, ...filters })}`

        const result = await getFromCache(
          cacheKey,
          async () => {
            return await fetchPaginated<Payment>(
              'payments',
              {
                page: options.page || 1,
                pageSize: options.pageSize || 10,
                sortBy: options.sortBy || 'created_at',
                sortOrder: options.sortOrder || 'desc',
              },
              `
                *,
                order:orders(
                  id,
                  user_id
                )
              `,
              (query) => {
                let filteredQuery = query

                if (filters?.status) {
                  filteredQuery = filteredQuery.eq('status', filters.status)
                }
                if (filters?.method) {
                  filteredQuery = filteredQuery.eq('method', filters.method)
                }
                if (filters?.search) {
                  filteredQuery = filteredQuery.or(
                    `transaction_ref.ilike.%${filters.search}%,safe_reference.ilike.%${filters.search}%`,
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

        payments.value = result.data
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
        const { data, error: supaError } = await supabase
          .from('payments')
          .select(
            `
                    *,
                    order:orders(
                        id,
                        user_id
                    )
                `,
          )
          .order('created_at', { ascending: false })

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        payments.value = data
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
          .from('payments')
          .select(
            `
                    *,
                    order:orders(
                        id,
                        user_id
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

        currentPayment.value = data
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
            data: null,
          }
        }

        if (!data || data.length === 0) {
          return {
            success: false,
            error: { message: 'Paiement introuvable ou non autorisé' },
            data: null,
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
        const { error: supaError } = await supabase.from('payments').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        payments.value = payments.value.filter(p => p.id !== id)
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
      paginationInfo: readonly(paginationInfo),

      // Actions
      getAll,
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
