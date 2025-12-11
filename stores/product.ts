// stores/product.ts
import type { PaginationOptions } from '~/utils/models/filter'
import { CACHE_CONFIG } from '~/utils/constants/api'

export const useProductStore = defineStore('product', () => {
  const products = ref<ProductWithPrice[]>([])
  const currentProduct = ref<ProductWithPrice | null>(null)
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

  // Obtenir tous les produits avec pagination et cache
  async function getAll(
    options: PaginationOptions = {},
    filters?: {
      seller_id?: string
      category_id?: string
      is_active?: boolean
      search?: string
    },
  ) {
    loading.value = true
    error.value = null

    try {
      const cacheKey = `products:${JSON.stringify({ ...options, ...filters })}`

      const result = await getFromCache(
        cacheKey,
        async () => {
          return await fetchPaginated<ProductWithPrice>(
            'products_with_price',
            {
              page: options.page || 1,
              pageSize: options.pageSize || 10,
              sortBy: options.sortBy || 'created_at',
              sortOrder: options.sortOrder || 'desc',
            },
            `
              *,
              seller:sellers(id, company_name),
              category:categories(id, name)
            `,
            (query) => {
              let filteredQuery = query

              if (filters?.seller_id) {
                filteredQuery = filteredQuery.eq('seller_id', filters.seller_id)
              }
              if (filters?.category_id) {
                filteredQuery = filteredQuery.eq('category_id', filters.category_id)
              }
              if (
                filters?.is_active !== undefined
                && filters.is_active !== null
                && filters.is_active !== ('' as any)
              ) {
                filteredQuery = filteredQuery.eq('is_active', filters.is_active)
              }
              if (filters?.search) {
                filteredQuery = filteredQuery.or(
                  `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
                )
              }

              return filteredQuery
            },
          )
        },
        CACHE_CONFIG.DEFAULT_TTL,
      )

      products.value = result.data
      paginationInfo.value = {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      }

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

  // Obtenir un produit par ID avec cache et retry
  async function getById(id: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const cacheKey = `product:${id}`

      const data = await getFromCache(
        cacheKey,
        async () => {
          const result = await supabaseWithRetry(
            () =>
              supabase
                .from('products_with_price')
                .select(
                  `
                  *,
                  seller:sellers(id, company_name),
                  category:categories(id, name)
                `,
                )
                .eq('id', id)
                .single(),
            { maxRetries: 3 },
          )

          if (!result.success) throw result.error
          return result.data
        },
        CACHE_CONFIG.DEFAULT_TTL,
      )

      currentProduct.value = data
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

  // Créer un nouveau produit avec retry et notifications
  async function create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const result = await supabaseWithRetry(
        () =>
          supabase
            .from('products')
            .insert([productData])
            .select(
              `
                *,
                seller:sellers(*),
                category:categories(*)
              `,
            )
            .single(),
        { maxRetries: 2 },
      )

      if (!result.success) throw result.error

      products.value.unshift(result.data)
      invalidatePattern('products:*')
      notification.createdSuccessfully('Produit')

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

  // Mettre à jour un produit avec retry et notifications
  async function update(id: string, updates: Partial<Product>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Première requête : mise à jour simple avec retry
      const updateResult = await supabaseWithRetry(
        () => supabase.from('products').update(updates).eq('id', id),
        { maxRetries: 2 },
      )

      if (!updateResult.success) throw updateResult.error

      // Deuxième requête : récupération des données enrichies
      const selectResult = await supabaseWithRetry(
        () =>
          supabase
            .from('products')
            .select(
              `
                *,
                seller:sellers(*),
                category:categories(*),
                product_variations(*)
              `,
            )
            .eq('id', id)
            .single(),
        { maxRetries: 2 },
      )

      if (!selectResult.success) throw selectResult.error

      // Mettre à jour dans la liste
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = selectResult.data
      }

      // Mettre à jour le produit courant si c'est lui
      if (currentProduct.value?.id === id) {
        currentProduct.value = selectResult.data
      }

      // Invalider le cache
      invalidatePattern('products:*')
      invalidatePattern(`product:${id}`)
      notification.updatedSuccessfully('Produit')

      return { success: true, data: selectResult.data }
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

  // Supprimer un produit avec retry et notifications
  async function remove(id: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const result = await supabaseWithRetry(
        () => supabase.from('products').delete().eq('id', id),
        { maxRetries: 2 },
      )

      if (!result.success) throw result.error

      products.value = products.value.filter(p => p.id !== id)
      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }

      // Invalider le cache
      invalidatePattern('products:*')
      invalidatePattern(`product:${id}`)
      notification.deletedSuccessfully('Produit')

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

  // Upload d'images pour un produit avec retry
  async function uploadImages(files: File[], productId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${productId}/${Date.now()}_${index}.${fileExt}`
        const filePath = `products/${fileName}`

        // Upload du fichier avec retry
        const result = await supabaseWithRetry(
          () => supabase.storage.from('product-images').upload(filePath, file),
          { maxRetries: 2 },
        )

        if (!result.success) throw result.error

        // Obtenir l'URL publique
        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(filePath)

        return publicUrl
      })

      const imageUrls = await Promise.all(uploadPromises)
      notification.success('Images uploadées', `${imageUrls.length} image(s) uploadée(s)`)
      return { success: true, data: imageUrls }
    }
    catch (err: any) {
      error.value = err.message
      notification.error("Erreur d'upload", err.message)
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Gérer les variations d'un produit avec retry
  async function manageVariations(productId: string, variations: Partial<ProductVariation>[]) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Supprimer les anciennes variations avec retry
      const deleteResult = await supabaseWithRetry(
        () => supabase.from('product_variations').delete().eq('product_id', productId),
        { maxRetries: 2 },
      )

      if (!deleteResult.success) throw deleteResult.error

      // Ajouter les nouvelles variations
      if (variations.length > 0) {
        const insertResult = await supabaseWithRetry(
          () =>
            supabase
              .from('product_variations')
              .insert(variations.map(v => ({ ...v, product_id: productId })))
              .select(),
          { maxRetries: 2 },
        )

        if (!insertResult.success) throw insertResult.error

        invalidatePattern(`product:${productId}`)
        notification.success('Variations mises à jour', `${variations.length} variation(s)`)

        return { success: true, data: insertResult.data }
      }

      return { success: true, data: [] }
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

  // Obtenir les produits depuis la table brute (pour l'édition) avec retry
  async function getProductsRaw(filters?: {
    seller_id?: string
    category_id?: string
    is_active?: boolean
    search?: string
  }) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const result = await supabaseWithRetry(
        () => {
          let query = supabase
            .from('products')
            .select(
              `
                *,
                seller:sellers(*),
                category:categories(*),
                product_variations(*),
                product_attributes(*)
              `,
            )
            .order('created_at', { ascending: false })

          // Appliquer les filtres
          if (filters?.seller_id) {
            query = query.eq('seller_id', filters.seller_id)
          }
          if (filters?.category_id) {
            query = query.eq('category_id', filters.category_id)
          }
          if (
            filters?.is_active !== undefined
            && filters.is_active !== null
            && filters.is_active !== ('' as any)
          ) {
            query = query.eq('is_active', filters.is_active)
          }
          if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
          }

          return query
        },
        { maxRetries: 3 },
      )

      if (!result.success) throw result.error

      return { success: true, data: result.data || [] }
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

  // Obtenir les produits récents (optimisé pour le dashboard)
  async function getRecent(limit = 5, sellerId?: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('products_with_price')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      // Filtrer par vendeur si nécessaire
      if (sellerId) {
        query = query.eq('seller_id', sellerId)
      }

      // Filtrer uniquement les produits actifs pour le dashboard
      query = query.eq('is_active', true)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      return { success: true, data: (data || []) as ProductWithPrice[] }
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

  // Reset du store
  function $reset() {
    products.value = []
    currentProduct.value = null
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
    products: readonly(products),
    currentProduct: readonly(currentProduct),
    loading: readonly(loading),
    error: readonly(error),
    paginationInfo: readonly(paginationInfo),

    // Actions
    getAll,
    getById,
    getRecent,
    create,
    update,
    remove,
    uploadImages,
    manageVariations,
    getProductsRaw,
    $reset,
  }
})
