import type { PaginationOptions } from '~/utils/models/filter'
import { CACHE_CONFIG } from '~/utils/constants/api'

export const useAdminStore = defineStore(
  'admin',
  () => {
    // États
    const admins = ref<Admin[]>([])
    const currentAdmin = ref<Admin | null>(null)
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

    // Obtenir tous les admins avec pagination et cache
    async function getAll(
      options: PaginationOptions = {},
      filters?: {
        search?: string
        role?: string
        is_active?: boolean
      },
    ) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const cacheKey = `admins:${JSON.stringify({ ...options, ...filters })}`

        const result = await getFromCache(
          cacheKey,
          async () => {
            return await fetchPaginated<Admin>(
              'profiles',
              {
                page: options.page || 1,
                pageSize: options.pageSize || 10,
                sortBy: options.sortBy || 'created_at',
                sortOrder: options.sortOrder || 'desc',
              },
              '*',
              (query) => {
                let filteredQuery = query.in('role', ['admin', 'superadmin'])

                if (filters?.role && filters.role !== 'all') {
                  filteredQuery = filteredQuery.eq('role', filters.role)
                }
                if (filters?.is_active !== undefined) {
                  filteredQuery = filteredQuery.eq('is_active', filters.is_active)
                }
                if (filters?.search) {
                  filteredQuery = filteredQuery.or(
                    `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
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

        admins.value = result.data
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
          .from('profiles')
          .select('*')
          .in('role', ['admin', 'superadmin'])
          .order('created_at', { ascending: false })

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        admins.value = data
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

    async function store(admin: Omit<Admin, 'id' | 'created_at'> & { password: string }) {
      loading.value = true
      error.value = null

      try {
        // Appeler l'API serveur pour créer l'admin
        const response = await $fetch('/api/admin/create', {
          method: 'POST',
          body: {
            email: admin.email,
            first_name: admin.first_name,
            last_name: admin.last_name,
            phone: admin.phone,
            role: admin.role || 'admin',
            avatar_url: admin.avatar_url,
            password: admin.password,
            is_active: admin.is_active !== false,
          },
        })

        if (response.success && response.data) {
          admins.value.unshift(response.data)
          return { success: true, data: response.data }
        }

        return {
          success: false,
          error: { message: 'Erreur lors de la création' },
          data: null,
        }
      }
      catch (err: any) {
        error.value = err.data?.message || err.message
        return {
          success: false,
          error: { message: err.data?.message || err.message },
          data: null,
        }
      }
      finally {
        loading.value = false
      }
    }

    async function update(id: string, admin: Partial<Admin>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('profiles')
          .update(admin)
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

        const index = admins.value.findIndex(a => a.id === id)
        if (index !== -1) {
          admins.value[index] = { ...admins.value[index], ...data }
        }

        if (currentAdmin.value?.id === id) {
          currentAdmin.value = { ...currentAdmin.value, ...data }
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
      loading.value = true
      error.value = null

      try {
        // Appeler l'API serveur pour supprimer l'admin
        const response = await $fetch(`/api/admin/${id}`, {
          method: 'DELETE',
        })

        if (response.success) {
          admins.value = admins.value.filter(a => a.id !== id)
          return { success: true }
        }

        return {
          success: false,
          error: { message: 'Erreur lors de la suppression' },
          data: null,
        }
      }
      catch (err: any) {
        error.value = err.data?.message || err.message
        return {
          success: false,
          error: { message: err.data?.message || err.message },
        }
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
          .in('role', ['admin', 'superadmin'])
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        currentAdmin.value = data
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

    async function toggleStatus(id: string) {
      const admin = admins.value.find(a => a.id === id)
      if (!admin) return { success: false, error: 'Admin not found' }

      return await update(id, { is_active: !admin.is_active })
    }

    async function updateRole(id: string, role: 'admin' | 'superadmin') {
      return await update(id, { role })
    }

    function $reset() {
      admins.value = []
      currentAdmin.value = null
      loading.value = false
      error.value = null
    }

    return {
      // États
      admins,
      currentAdmin,
      loading,
      error,
      paginationInfo,

      // Actions
      getAll,
      get,
      store,
      update,
      destroy,
      show,
      toggleStatus,
      updateRole,
      $reset,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
