import type { PaginationOptions } from '~/utils/models/filter'
import { CACHE_CONFIG } from '~/utils/constants/api'

export const usePayoutStore = defineStore(
  'payout',
  () => {
    // États
    const payouts = ref<Payout[]>([])
    const currentPayout = ref<Payout | null>(null)
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

    // Obtenir tous les payouts avec pagination et cache
    async function getAll(
      options: PaginationOptions = {},
      filters?: {
        status?: string
        search?: string
      },
    ) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const cacheKey = `payouts:${JSON.stringify({ ...options, ...filters })}`

        const result = await getFromCache(
          cacheKey,
          async () => {
            return await fetchPaginated<Payout>(
              'payouts',
              {
                page: options.page || 1,
                pageSize: options.pageSize || 10,
                sortBy: options.sortBy || 'requested_at',
                sortOrder: options.sortOrder || 'desc',
              },
              `
                *,
                wallet:wallets(
                  id,
                  owner_id,
                  owner_type,
                  balance
                )
              `,
              (query) => {
                let filteredQuery = query

                if (filters?.status) {
                  filteredQuery = filteredQuery.eq('status', filters.status)
                }
                if (filters?.search) {
                  filteredQuery = filteredQuery.or(
                    `reference.ilike.%${filters.search}%`,
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

        payouts.value = result.data
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
      paginationInfo,

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
