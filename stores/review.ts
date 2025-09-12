import type { Review } from '~/utils/models/review'

export const useReviewStore = defineStore('review', () => {
  const reviews = ref<Review[]>([])
  const currentReview = ref<Review | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtenir toutes les avis
  async function getAll(filters?: {
    product_id?: string
    user_id?: string
    rating?: number
  }) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('reviews')
        .select('*, product:products(*), order:orders(*)')
        .order('created_at', { ascending: false })

      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id)
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters?.rating) {
        query = query.eq('rating', filters.rating)
      }

      const { data: reviewsData, error: supaError } = await query

      if (supaError) throw supaError

      // Enrichir avec les user profiles
      const enrichedReviews = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, phone, role, avatar_url')
            .eq('id', review.user_id)
            .single()

          return {
            ...review,
            user: userProfile
          }
        })
      )

      reviews.value = enrichedReviews
      return { success: true, data: enrichedReviews }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Obtenir les avis d'un produit
  async function getByProduct(productId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data: reviewsData, error: supaError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (supaError) throw supaError

      // Enrichir avec les user profiles
      const enrichedReviews = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, phone, role, avatar_url')
            .eq('id', review.user_id)
            .single()

          return {
            ...review,
            user: userProfile
          }
        })
      )

      return { success: true, data: enrichedReviews }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Créer un avis
  async function create(review: Omit<Review, 'id' | 'created_at'>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('reviews')
        .insert([review])
        .select('*, product:products(*), order:orders(*)')
        .single()

      if (supaError) throw supaError

      // Enrichir avec le user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, role, avatar_url')
        .eq('id', data.user_id)
        .single()

      const enrichedData = {
        ...data,
        user: userProfile
      }

      reviews.value.unshift(enrichedData)
      return { success: true, data: enrichedData }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour un avis
  async function update(id: string, updates: Partial<Review>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select('*, product:products(*), order:orders(*)')
        .single()

      if (supaError) throw supaError

      // Enrichir avec le user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, role, avatar_url')
        .eq('id', data.user_id)
        .single()

      const enrichedData = {
        ...data,
        user: userProfile
      }

      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reviews.value[index] = enrichedData
      }

      if (currentReview.value?.id === id) {
        currentReview.value = enrichedData
      }

      return { success: true, data: enrichedData }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Supprimer un avis
  async function remove(id: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { error: supaError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (supaError) throw supaError

      reviews.value = reviews.value.filter(r => r.id !== id)
      if (currentReview.value?.id === id) {
        currentReview.value = null
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Obtenir les statistiques des avis pour un produit
  async function getProductStats(productId: string) {
    const supabase = useSupabaseClient()

    try {
      const { data: reviews, error: supaError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)

      if (supaError) throw supaError

      const totalReviews = reviews.length
      const avgRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      }

      return {
        success: true,
        data: {
          totalReviews,
          avgRating: Math.round(avgRating * 10) / 10,
          ratingDistribution
        }
      }
    } catch (err: any) {
      return { success: false, error: err }
    }
  }

  function $reset() {
    reviews.value = []
    currentReview.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    reviews: readonly(reviews),
    currentReview: readonly(currentReview),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    getAll,
    getByProduct,
    create,
    update,
    remove,
    getProductStats,
    $reset
  }
})