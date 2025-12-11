// composables/useDashboardStats.ts
export const useDashboardStats = () => {
  const stats = ref({
    revenue: {
      current: 0,
      previous: 0,
      growth: 0,
    },
    orders: {
      current: 0,
      previous: 0,
      growth: 0,
    },
    products: {
      current: 0,
      previous: 0,
      growth: 0,
    },
    customers: {
      current: 0,
      previous: 0,
      growth: 0,
    },
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Calculer les statistiques pour une période donnée
  async function calculateStats(
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    sellerId?: string,
  ) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const now = new Date()
      let currentStart: Date
      let previousStart: Date
      let previousEnd: Date

      // Définir les périodes selon le filtre
      switch (period) {
        case 'day':
          currentStart = new Date(now.setHours(0, 0, 0, 0))
          previousEnd = new Date(currentStart.getTime() - 1)
          previousStart = new Date(previousEnd.getTime() - 24 * 60 * 60 * 1000)
          break
        case 'week':
          const weekStart = now.getDate() - now.getDay()
          currentStart = new Date(now.setDate(weekStart))
          currentStart.setHours(0, 0, 0, 0)
          previousEnd = new Date(currentStart.getTime() - 1)
          previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
          previousEnd = new Date(currentStart.getTime() - 1)
          previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1)
          break
        case 'year':
          currentStart = new Date(now.getFullYear(), 0, 1)
          previousEnd = new Date(currentStart.getTime() - 1)
          previousStart = new Date(previousEnd.getFullYear(), 0, 1)
          break
      }

      // Récupérer les commandes pour la période courante
      let currentOrdersQuery = supabase
        .from('orders')
        .select('total_amount, created_at, user_id')
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', now.toISOString())

      if (sellerId) {
        currentOrdersQuery = currentOrdersQuery.eq('seller_id', sellerId)
      }

      const { data: currentOrders, error: currentError } = await currentOrdersQuery
      if (currentError) throw currentError

      // Récupérer les commandes pour la période précédente
      let previousOrdersQuery = supabase
        .from('orders')
        .select('total_amount, created_at, user_id')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString())

      if (sellerId) {
        previousOrdersQuery = previousOrdersQuery.eq('seller_id', sellerId)
      }

      const { data: previousOrders, error: previousError } = await previousOrdersQuery
      if (previousError) throw previousError

      // Récupérer les produits
      let productsQuery = supabase.from('products').select('created_at, is_active')

      if (sellerId) {
        productsQuery = productsQuery.eq('seller_id', sellerId)
      }

      const { data: products, error: productsError } = await productsQuery
      if (productsError) throw productsError

      // Récupérer les profils utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at, role')
        .eq('role', 'buyer')

      if (profilesError) throw profilesError

      // Calculer les statistiques
      const currentRevenue = currentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const previousRevenue
        = previousOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const revenueGrowth
        = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

      const currentOrdersCount = currentOrders?.length || 0
      const previousOrdersCount = previousOrders?.length || 0
      const ordersGrowth
        = previousOrdersCount > 0
          ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
          : 0

      // Produits actifs
      const activeProducts = products?.filter(p => p.is_active === true).length || 0
      const totalProducts = products?.length || 0

      // Nouveaux clients
      const newCustomers
        = profiles?.filter((p) => {
          const createdAt = new Date(p.created_at)
          return createdAt >= currentStart && createdAt <= now
        }).length || 0

      const previousCustomers
        = profiles?.filter((p) => {
          const createdAt = new Date(p.created_at)
          return createdAt >= previousStart && createdAt <= previousEnd
        }).length || 0

      const customersGrowth
        = previousCustomers > 0 ? ((newCustomers - previousCustomers) / previousCustomers) * 100 : 0

      // Mettre à jour les stats
      stats.value = {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
        },
        orders: {
          current: currentOrdersCount,
          previous: previousOrdersCount,
          growth: ordersGrowth,
        },
        products: {
          current: activeProducts,
          previous: totalProducts - activeProducts,
          growth: totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0,
        },
        customers: {
          current: newCustomers,
          previous: previousCustomers,
          growth: customersGrowth,
        },
      }

      return { success: true, data: stats.value }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Récupérer les données de tendance pour les graphiques
  async function getTrendData(
    period: 'day' | 'week' | 'month' = 'week',
    days: number = 7,
    sellerId?: string,
  ) {
    const supabase = useSupabaseClient()

    try {
      const trends = []
      const labels = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        let startDate: Date
        let endDate: Date

        if (period === 'day') {
          startDate = new Date(date.setHours(0, 0, 0, 0))
          endDate = new Date(date.setHours(23, 59, 59, 999))
          labels.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }))
        }
        else {
          startDate = new Date(date.setHours(0, 0, 0, 0))
          endDate = new Date(date.setHours(23, 59, 59, 999))
          labels.push(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))
        }

        let dayOrdersQuery = supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        if (sellerId) {
          dayOrdersQuery = dayOrdersQuery.eq('seller_id', sellerId)
        }

        const { data: dayOrders } = await dayOrdersQuery

        const dayRevenue = dayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
        trends.push(dayRevenue)
      }

      return { labels, data: trends }
    }
    catch (err) {
      console.error('Erreur lors de la récupération des tendances:', err)
      return { labels: [], data: [] }
    }
  }

  // Récupérer les alertes du dashboard
  async function getAlerts(sellerId?: string) {
    const supabase = useSupabaseClient()
    const alerts = []

    try {
      // Vérifier les produits en stock faible
      let lowStockQuery = supabase
        .from('products')
        .select('title, stock')
        .lt('stock', 10)
        .eq('is_active', true)

      if (sellerId) {
        lowStockQuery = lowStockQuery.eq('seller_id', sellerId)
      }

      const { data: lowStockProducts } = await lowStockQuery

      if (lowStockProducts && lowStockProducts.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Stock faible',
          message: `${lowStockProducts.length} produits ont un stock inférieur à 10 unités`,
          action: 'Voir les produits',
          link: '/dashboard/products?filter=low-stock',
        })
      }

      // Vérifier les commandes en attente
      let pendingOrdersQuery = supabase.from('orders').select('id').eq('status', 'pending')

      if (sellerId) {
        pendingOrdersQuery = pendingOrdersQuery.eq('seller_id', sellerId)
      }

      const { data: pendingOrders } = await pendingOrdersQuery

      if (pendingOrders && pendingOrders.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Commandes en attente',
          message: `${pendingOrders.length} commandes attendent votre attention`,
          action: 'Voir les commandes',
          link: '/dashboard/orders?status=pending',
        })
      }

      // Vérifier les commandes anciennes non traitées
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      let oldOrdersQuery = supabase
        .from('orders')
        .select('id')
        .in('status', ['pending', 'confirmed'])
        .lt('created_at', threeDaysAgo.toISOString())

      if (sellerId) {
        oldOrdersQuery = oldOrdersQuery.eq('seller_id', sellerId)
      }

      const { data: oldOrders } = await oldOrdersQuery

      if (oldOrders && oldOrders.length > 0) {
        alerts.push({
          type: 'error',
          title: 'Commandes anciennes',
          message: `${oldOrders.length} commandes datent de plus de 3 jours`,
          action: 'Traiter maintenant',
          link: '/dashboard/orders?filter=old',
        })
      }

      return alerts
    }
    catch (err) {
      console.error('Erreur lors de la récupération des alertes:', err)
      return []
    }
  }

  return {
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error),
    calculateStats,
    getTrendData,
    getAlerts,
  }
}
