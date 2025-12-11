import type { PaginationOptions } from '~/utils/models/filter'
import { CACHE_CONFIG } from '~/utils/constants/api'

export const useSellerStore = defineStore(
  'seller',
  () => {
    // États
    const sellers = ref<Seller[]>([])
    const currentSeller = ref<Seller | null>(null)
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

    // Obtenir tous les vendeurs avec pagination et cache
    async function getAll(
      options: PaginationOptions = {},
      filters?: {
        search?: string
        is_approved?: boolean
      },
    ) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const cacheKey = `sellers:${JSON.stringify({ ...options, ...filters })}`

        const result = await getFromCache(
          cacheKey,
          async () => {
            return await fetchPaginated<Seller>(
              'sellers',
              {
                page: options.page || 1,
                pageSize: options.pageSize || 10,
                sortBy: options.sortBy || 'created_at',
                sortOrder: options.sortOrder || 'desc',
              },
              '*',
              (query) => {
                let filteredQuery = query

                if (filters?.is_approved !== undefined) {
                  filteredQuery = filteredQuery.eq('is_approved', filters.is_approved)
                }
                if (filters?.search) {
                  filteredQuery = filteredQuery.or(
                    `company_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
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

        sellers.value = result.data
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
        const { data, error: supaError } = await supabase.from('sellers').select('*')

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        sellers.value = data
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

    async function store(seller: Omit<Seller, 'id' | 'created_at'>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('sellers')
          .insert([seller])
          .select()
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        sellers.value.push(data)
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

    async function update(id: string, seller: Partial<Seller>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('sellers')
          .update(seller)
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

        const index = sellers.value.findIndex(c => c.id === id)
        if (index !== -1) {
          sellers.value[index] = { ...sellers.value[index], ...data }
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
        const { error: supaError } = await supabase.from('sellers').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        sellers.value = sellers.value.filter(c => c.id !== id)
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
          .from('sellers')
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

        currentSeller.value = data
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

    async function updateApprovalStatus(id: string, isApproved: boolean) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        // Mettre à jour sans utiliser .single() pour éviter l'erreur PGRST116
        const { data, error: supaError } = await supabase
          .from('sellers')
          .update({ is_approved: isApproved })
          .eq('id', id)
          .select()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        // Vérifier si la mise à jour a affecté une ligne
        if (!data || data.length === 0) {
          return {
            success: false,
            error: { message: 'Vendeur introuvable ou non autorisé' },
            data: null,
          }
        }

        const updatedSeller = data[0]

        // Mettre à jour le vendeur courant si c'est celui-ci
        if (currentSeller.value?.id === id) {
          currentSeller.value = { ...currentSeller.value, is_approved: isApproved }
        }

        // Mettre à jour dans la liste
        const index = sellers.value.findIndex(s => s.id === id)
        if (index !== -1) {
          sellers.value[index] = { ...sellers.value[index], is_approved: isApproved }
        }

        return { success: true, data: updatedSeller }
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
      sellers.value = []
      currentSeller.value = null
      loading.value = false
      error.value = null
    }

    return {
      // États
      sellers,
      currentSeller,
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
      updateApprovalStatus,
      $reset,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
