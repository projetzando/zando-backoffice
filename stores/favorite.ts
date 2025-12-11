export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref<Favorite[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtenir les favoris d'un utilisateur
  async function getByUser(userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('favorites')
        .select(
          `
          *,
          product:products(
            *,
            seller:sellers(*),
            category:categories(*)
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (supaError) throw supaError

      favorites.value = data || []
      return { success: true, data: data || [] }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Vérifier si un produit est en favoris
  async function isFavorite(userId: string, productId: string) {
    const supabase = useSupabaseClient()

    try {
      const { data, error: supaError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (supaError && supaError.code !== 'PGRST116') {
        throw supaError
      }

      return { success: true, isFavorite: !!data }
    }
    catch (err: any) {
      return { success: false, error: err }
    }
  }

  // Ajouter aux favoris
  async function add(userId: string, productId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: productId,
        })
        .select(
          `
          *,
          product:products(
            *,
            seller:sellers(*),
            category:categories(*)
          )
        `,
        )
        .single()

      if (supaError) throw supaError

      favorites.value.unshift(data)
      return { success: true, data }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Retirer des favoris
  async function remove(userId: string, productId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { error: supaError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (supaError) throw supaError

      favorites.value = favorites.value.filter(
        f => !(f.user_id === userId && f.product_id === productId),
      )

      return { success: true }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Toggle favori
  async function toggle(userId: string, productId: string) {
    const { isFavorite: isCurrentlyFavorite } = await isFavorite(userId, productId)

    if (isCurrentlyFavorite) {
      return await remove(userId, productId)
    }
    else {
      return await add(userId, productId)
    }
  }

  // Obtenir le nombre de favoris pour un produit
  async function getProductFavoriteCount(productId: string) {
    const supabase = useSupabaseClient()

    try {
      const { count, error: supaError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)

      if (supaError) throw supaError

      return { success: true, count: count || 0 }
    }
    catch (err: any) {
      return { success: false, error: err }
    }
  }

  // Computed pour vérifier si un produit est favori
  const isFavoriteProduct = computed(() => {
    return (productId: string) => {
      return favorites.value.some(f => f.product_id === productId)
    }
  })

  function $reset() {
    favorites.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    favorites: readonly(favorites),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    isFavoriteProduct,

    // Actions
    getByUser,
    isFavorite,
    add,
    remove,
    toggle,
    getProductFavoriteCount,
    $reset,
  }
})
