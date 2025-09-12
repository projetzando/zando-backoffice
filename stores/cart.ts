export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<CartItem[]>([])
  const currentCart = ref<CartWithDetails[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtenir le panier de l'utilisateur (utilise la vue cart_with_details par défaut)
  async function getCart(userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('cart_with_details')
        .select('*')
        .eq('user_id', userId)

      if (supaError) throw supaError

      currentCart.value = data || []
      
      // Pour compatibilité, remplir aussi cartItems avec les données simplifiées
      cartItems.value = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        variant_id: item.variant_id, // Garder pour compatibilité vue
        variation_id: item.variation_id,
        quantity: item.quantity,
        created_at: item.created_at
      }))
      
      return { success: true, data: data || [] }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Obtenir le panier brut (pour manipulation des données)
  async function getCartRaw(userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          variation:product_variations(*)
        `)
        .eq('user_id', userId)

      if (supaError) throw supaError

      cartItems.value = data || []
      return { success: true, data: data || [] }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Ajouter un article au panier
  async function addItem(cartItem: Omit<CartItem, 'id' | 'created_at'>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Vérifier si l'article existe déjà
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', cartItem.user_id)
        .eq('product_id', cartItem.product_id)
        .eq('variation_id', cartItem.variation_id || null)
        .single()

      let result

      if (existingItem) {
        // Mettre à jour la quantité
        result = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + cartItem.quantity 
          })
          .eq('id', existingItem.id)
          .select()
          .single()
      } else {
        // Créer un nouvel article
        result = await supabase
          .from('cart_items')
          .insert([cartItem])
          .select()
          .single()
      }

      if (result.error) throw result.error

      // Recharger le panier
      await getCart(cartItem.user_id)

      return { success: true, data: result.data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour la quantité d'un article
  async function updateQuantity(itemId: string, quantity: number, userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single()

      if (supaError) throw supaError

      // Recharger le panier
      await getCart(userId)

      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Supprimer un article du panier
  async function removeItem(itemId: string, userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { error: supaError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (supaError) throw supaError

      // Recharger le panier
      await getCart(userId)

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Vider le panier
  async function clearCart(userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { error: supaError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (supaError) throw supaError

      cartItems.value = []
      currentCart.value = []

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Calculer le total du panier
  const cartTotal = computed(() => {
    return currentCart.value.reduce((total, item) => {
      return total + (item.total_price || 0)
    }, 0)
  })

  // Compteur d'articles
  const cartItemsCount = computed(() => {
    return cartItems.value.reduce((count, item) => count + item.quantity, 0)
  })

  function $reset() {
    cartItems.value = []
    currentCart.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    cartItems: readonly(cartItems),
    currentCart: readonly(currentCart),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    cartTotal,
    cartItemsCount,

    // Actions
    getCart,
    getCartRaw,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    $reset
  }
})