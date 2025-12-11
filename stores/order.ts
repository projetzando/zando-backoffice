// stores/order.ts
import type { PaginationOptions } from '~/utils/models/filter'
import { CACHE_CONFIG } from '~/utils/constants/api'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
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
  const { supabaseWithRetry } = useRetry()
  const notification = useNotification()

  // Obtenir toutes les commandes avec pagination et cache
  async function getAll(
    options: PaginationOptions = {},
    filters?: {
      status?: string
      user_id?: string
      date_from?: string
      date_to?: string
      search?: string
    },
  ) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const cacheKey = `orders:${JSON.stringify({ ...options, ...filters })}`

      const result = await getFromCache(
        cacheKey,
        async () => {
          return await fetchPaginated<Order>(
            'orders',
            {
              page: options.page || 1,
              pageSize: options.pageSize || 10,
            },
            '*',
            (query) => {
              let filteredQuery = query.order('created_at', { ascending: false })

              if (filters?.status) {
                filteredQuery = filteredQuery.eq('status', filters.status)
              }
              if (filters?.user_id) {
                filteredQuery = filteredQuery.eq('user_id', filters.user_id)
              }
              if (filters?.date_from) {
                filteredQuery = filteredQuery.gte('created_at', filters.date_from)
              }
              if (filters?.date_to) {
                filteredQuery = filteredQuery.lte('created_at', filters.date_to)
              }
              if (filters?.search) {
                filteredQuery = filteredQuery.or(`id.ilike.%${filters.search}%`)
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

      orders.value = result.data
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

  // Obtenir une commande par ID avec cache et retry
  async function getById(id: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const cacheKey = `order:${id}`

      const data = await getFromCache(
        cacheKey,
        async () => {
          const result = await supabaseWithRetry(
            () => supabase.from('orders').select('*').eq('id', id).single(),
            { maxRetries: 3 },
          )

          if (!result.success) throw result.error
          return result.data
        },
        CACHE_CONFIG.DEFAULT_TTL,
      )

      currentOrder.value = data
      return { success: true, data }
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

  // Créer une nouvelle commande avec retry et notifications
  async function create(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const result = await supabaseWithRetry(
        () => supabase.from('orders').insert([orderData]).select().single(),
        { maxRetries: 2 },
      )

      if (!result.success) throw result.error

      invalidatePattern('orders:*')
      notification.createdSuccessfully('Commande')

      return { success: true, data: result.data }
    }
    catch (err: any) {
      error.value = err.message
      notification.error('Erreur de création', err.message)
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Mettre à jour une commande avec retry et notifications
  async function update(id: string, updates: Partial<Order>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const result = await supabaseWithRetry(
        () =>
          supabase
            .from('orders')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single(),
        { maxRetries: 2 },
      )

      if (!result.success) throw result.error

      invalidatePattern('orders:*')
      invalidatePattern(`order:${id}`)
      notification.updatedSuccessfully('Commande')

      return { success: true, data: result.data }
    }
    catch (err: any) {
      error.value = err.message
      notification.error('Erreur de mise à jour', err.message)
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Mettre à jour le statut d'une commande
  async function updateStatus(id: string, newStatus: string) {
    return await update(id, { status: newStatus as any })
  }

  // Supprimer une commande avec retry et notifications
  async function remove(id: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const result = await supabaseWithRetry(() => supabase.from('orders').delete().eq('id', id), {
        maxRetries: 2,
      })

      if (!result.success) throw result.error

      orders.value = orders.value.filter(o => o.id !== id)
      if (currentOrder.value?.id === id) {
        currentOrder.value = null
      }

      invalidatePattern('orders:*')
      invalidatePattern(`order:${id}`)
      notification.deletedSuccessfully('Commande')

      return { success: true }
    }
    catch (err: any) {
      error.value = err.message
      notification.error('Erreur de suppression', err.message)
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Reset du store
  function $reset() {
    orders.value = []
    currentOrder.value = null
    loading.value = false
    error.value = null
    paginationInfo.value = {
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  }

  return {
    // State
    orders: readonly(orders),
    currentOrder: readonly(currentOrder),
    loading: readonly(loading),
    error: readonly(error),
    paginationInfo: readonly(paginationInfo),

    // Actions
    getAll,
    getById,
    create,
    update,
    updateStatus,
    remove,
    $reset,

    // Aliases pour la compatibilité
    get: getAll,
    show: getById,
  }
})
