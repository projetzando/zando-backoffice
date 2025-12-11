<script setup lang="ts">
definePageMeta({
  name: "Tableau de bord",
  layout: "dashboard",
});

const orderStore = useOrderStore();
const productStore = useProductStore();
const authStore = useAuthStore();
const walletStore = useWalletStore();
const supabase = useSupabaseClient();
const { calculateStats, getTrendData, getAlerts } = useDashboardStats();

// États réactifs
const { orders, loading: ordersLoading } = storeToRefs(orderStore);
const { products, loading: productsLoading } = storeToRefs(productStore);

// Récupérer le seller_id si l'utilisateur est un vendeur
const currentSellerId = ref<string | null>(null);
const isSellerUser = computed(() => authStore.connected_user?.role === 'seller');
const isSuperAdmin = computed(() => authStore.connected_user?.role === 'superadmin');
const sellerInfo = ref<any>(null);
const walletInfo = ref<any>(null);

// Modal des transactions du wallet système
const showSystemWalletTransactions = ref(false);

// Période sélectionnée pour les statistiques
const selectedPeriod = ref("month");
const periodOptions = [
  { value: "day", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "year", label: "Cette année" },
];

// Données pour les graphiques
const chartData = ref({ labels: [], data: [] });
const alerts = ref([]);
const statsData = ref({
  revenue: { current: 0, growth: 0 },
  orders: { current: 0, growth: 0 },
  products: { current: 0, growth: 0 },
  customers: { current: 0, growth: 0 },
});

// Loading states
const loadingStats = ref(false);
const loadingAlerts = ref(false);

// Charger les données initiales
onMounted(async () => {
  await loadDashboardData();
});

// Recharger quand la période change
watch(selectedPeriod, async () => {
  await loadDashboardData();
});

// Fonction principale pour charger toutes les données
async function loadDashboardData() {
  loadingStats.value = true;
  loadingAlerts.value = true;

  try {
    // Si l'utilisateur est un superadmin, récupérer le wallet système
    if (isSuperAdmin.value) {
      await walletStore.getSystemWallet();
    }

    // Si l'utilisateur est un vendeur, récupérer ses informations complètes
    if (isSellerUser.value && !currentSellerId.value) {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', authStore.connected_user.id)
        .single();

      if (sellerData) {
        currentSellerId.value = sellerData.id;
        sellerInfo.value = sellerData;

        // Récupérer le wallet du vendeur
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('owner_id', sellerData.id)
          .eq('owner_type', 'seller')
          .single();

        if (wallet) {
          walletInfo.value = wallet;
        }
      }
    }

    // Charger les données de base avec filtre vendeur si nécessaire
    const filters = isSellerUser.value && currentSellerId.value
      ? { seller_id: currentSellerId.value }
      : {};

    await Promise.all([
      orderStore.getAll(),
      productStore.getAll(filters)
    ]);

    // Calculer les statistiques avec filtre vendeur si nécessaire
    const sellerId = isSellerUser.value ? currentSellerId.value : undefined;

    const { data: stats } = await calculateStats(selectedPeriod.value as any, sellerId);
    if (stats) {
      statsData.value = stats;
    }

    // Récupérer les données de tendance pour le graphique
    const trendData = await getTrendData("day", 7, sellerId);
    chartData.value = trendData;

    // Récupérer les alertes
    const alertsData = await getAlerts(sellerId);
    alerts.value = alertsData;
  } catch (error) {
    console.error("Erreur lors du chargement du dashboard:", error);
  } finally {
    loadingStats.value = false;
    loadingAlerts.value = false;
  }
}

// Fonction de formatage pour les nombres
function formatNumber(num: number): string {
  return new Intl.NumberFormat("fr-FR").format(num);
}

// Fonction pour obtenir l'icône de tendance
function getTrendIcon(growth: number): string {
  return growth >= 0
    ? "i-heroicons-arrow-trending-up"
    : "i-heroicons-arrow-trending-down";
}

// Fonction pour obtenir la couleur de tendance
function getTrendColor(growth: number): string {
  return growth >= 0 ? "text-green-600" : "text-red-600";
}

// Cartes de statistiques
const statCards = computed(() => {
  const cards = [
    {
      title: isSellerUser.value ? "Mes revenus" : "Revenus totaux",
      value: formatPrice(statsData.value.revenue.current),
      growth: statsData.value.revenue.growth,
      icon: "i-heroicons-currency-dollar",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: isSellerUser.value ? "Mes commandes" : "Commandes totales",
      value: formatNumber(statsData.value.orders.current),
      growth: statsData.value.orders.growth,
      icon: "i-heroicons-shopping-bag",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: isSellerUser.value ? "Mes produits actifs" : "Produits actifs",
      value: formatNumber(statsData.value.products.current),
      growth: statsData.value.products.growth,
      icon: "i-heroicons-cube",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  // Ajouter "Nouveaux clients" seulement pour admin/superadmin
  if (!isSellerUser.value) {
    cards.push({
      title: "Nouveaux clients",
      value: formatNumber(statsData.value.customers.current),
      growth: statsData.value.customers.growth,
      icon: "i-heroicons-user-plus",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    });
  }

  return cards;
});

// Actions rapides
const quickActions = [
  {
    label: "Nouvelle commande",
    icon: "i-heroicons-plus",
    color: "primary",
    action: () => navigateTo("/dashboard/orders/create"),
  },
  {
    label: "Ajouter un produit",
    icon: "i-heroicons-cube",
    color: "green",
    action: () => navigateTo("/dashboard/products/create"),
  },
  {
    label: "Gérer les vendeurs",
    icon: "i-heroicons-user-group",
    color: "blue",
    action: () => navigateTo("/dashboard/sellers"),
  },
  {
    label: "Voir les rapports",
    icon: "i-heroicons-chart-bar",
    color: "purple",
    action: () => navigateTo("/dashboard/reports"),
  },
];

// Données récentes pour les tableaux
const recentOrders = computed(
  () =>
    orders.value?.slice(0, 5).map((order) => ({
      id: order.id,
      customer: order.buyer
        ? `${order.buyer.first_name} ${order.buyer.last_name}`
        : "Anonyme",
      amount: order.total_amount,
      status: order.status,
      date: order.created_at,
    })) || []
);

const recentProducts = computed(
  () =>
    products.value?.slice(0, 5).map((product) => ({
      id: product.id,
      title: product.title,
      price: product.display_price || product.price || 0,
      stock: product.available_stock || product.stock || 0,
      status: product.is_active ? "active" : "inactive",
      date: product.created_at,
      review_count: product.review_count || 0,
      avg_rating: product.avg_rating || 0,
    })) || []
);

// Fonctions pour les statuts
function getStatusColor(status: string): string {
  const colors = {
    pending: "orange",
    confirmed: "blue",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
    active: "green",
    inactive: "gray",
    draft: "gray",
  };
  return colors[status as keyof typeof colors] || "gray";
}

function getStatusLabel(status: string): string {
  const labels = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    active: "Actif",
    inactive: "Inactif",
    draft: "Brouillon",
  };
  return labels[status as keyof typeof labels] || status;
}

// Gestion des alertes
function dismissAlert(index: number) {
  alerts.value.splice(index, 1);
}

function handleAlertAction(alert: any) {
  if (alert.link) {
    navigateTo(alert.link);
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête du dashboard -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p class="text-gray-600">Vue d'ensemble de votre activité e-commerce</p>
      </div>

      <div class="flex items-center gap-3">
        <USelect v-model="selectedPeriod" :options="periodOptions" size="sm" />
        <UButton
          icon="i-heroicons-arrow-path"
          variant="outline"
          size="sm"
          :loading="loadingStats"
          @click="loadDashboardData"
        >
          Actualiser
        </UButton>
      </div>
    </div>

    <!-- Informations Vendeur -->
    <UCard v-if="isSellerUser && sellerInfo" class="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Infos boutique -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-building-storefront" class="w-5 h-5" />
            Ma Boutique
          </h3>
          <div class="space-y-3">
            <!-- Logo -->
            <div v-if="sellerInfo.company_logo" class="flex justify-center mb-4">
              <UAvatar
                :src="sellerInfo.company_logo"
                :alt="sellerInfo.company_name"
                size="3xl"
                class="ring-4 ring-white shadow-lg"
              />
            </div>
            <div>
              <p class="text-sm text-gray-600">Nom de la boutique</p>
              <p class="font-semibold text-gray-900">{{ sellerInfo.company_name }}</p>
            </div>
            <div v-if="sellerInfo.description">
              <p class="text-sm text-gray-600">Description</p>
              <p class="text-sm text-gray-900">{{ sellerInfo.description }}</p>
            </div>
            <div v-if="sellerInfo.phone">
              <p class="text-sm text-gray-600">Téléphone</p>
              <p class="text-sm text-gray-900">{{ sellerInfo.phone }}</p>
            </div>
            <div v-if="sellerInfo.is_verified !== undefined">
              <UBadge :color="sellerInfo.is_verified ? 'green' : 'orange'" variant="subtle">
                {{ sellerInfo.is_verified ? 'Boutique vérifiée' : 'En attente de vérification' }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Wallet -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-wallet" class="w-5 h-5" />
            Mon Portefeuille
          </h3>
          <div v-if="walletInfo" class="space-y-3">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <p class="text-sm text-gray-600 mb-1">Solde disponible</p>
              <p class="text-3xl font-bold text-primary-600">{{ formatPrice(walletInfo.balance || 0) }}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <p class="text-xs text-gray-600">Total gagné</p>
                <p class="font-semibold text-gray-900">{{ formatPrice(walletInfo.total_earned || 0) }}</p>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <p class="text-xs text-gray-600">Total retiré</p>
                <p class="font-semibold text-gray-900">{{ formatPrice(walletInfo.total_withdrawn || 0) }}</p>
              </div>
            </div>
            <UButton
              @click="navigateTo('/dashboard/payouts')"
              color="primary"
              block
              icon="i-heroicons-arrow-up-tray"
            >
              Demander un retrait
            </UButton>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <UIcon name="i-heroicons-wallet" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Portefeuille non configuré</p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Wallet Système (SuperAdmin uniquement) -->
    <UCard v-if="isSuperAdmin && walletStore.systemWallet" class="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <UIcon name="i-heroicons-building-library" class="w-6 h-6 text-emerald-600" />
            Portefeuille Système
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <!-- Solde disponible -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-gray-600">Solde disponible</p>
                <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-emerald-600" />
              </div>
              <p class="text-2xl font-bold text-emerald-600">
                {{ formatPrice(walletStore.systemWallet.balance || 0) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ walletStore.systemWallet.currency || 'XAF' }}</p>
            </div>

            <!-- Solde bloqué -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-gray-600">Solde bloqué</p>
                <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-orange-600" />
              </div>
              <p class="text-2xl font-bold text-orange-600">
                {{ formatPrice(walletStore.systemWallet.locked_balance || 0) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">En cours de traitement</p>
            </div>

            <!-- Solde total -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-gray-600">Solde total</p>
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-blue-600" />
              </div>
              <p class="text-2xl font-bold text-blue-600">
                {{ formatPrice((walletStore.systemWallet.balance || 0) + (walletStore.systemWallet.locked_balance || 0)) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">Disponible + Bloqué</p>
            </div>
          </div>

          <div class="mt-4 flex gap-3">
            <UButton
              color="emerald"
              icon="i-heroicons-eye"
              size="sm"
              @click="showSystemWalletTransactions = true"
            >
              Voir les transactions
            </UButton>
            <UButton
              color="gray"
              variant="outline"
              icon="i-heroicons-arrow-path"
              size="sm"
              :loading="walletStore.loading"
              @click="walletStore.getSystemWallet()"
            >
              Actualiser
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Alertes importantes -->
    <div v-if="alerts.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Alertes importantes</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardAlert
          v-for="(alert, index) in alerts.slice(0, 4)"
          :key="index"
          :alert="alert"
          @dismiss="dismissAlert(index)"
          @action="handleAlertAction"
        />
      </div>
    </div>

    <!-- Cartes de statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Skeletons pendant le chargement -->
      <template v-if="loadingStats">
        <UCard v-for="i in 4" :key="i">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <USkeleton class="h-4 w-24 mb-2" />
              <USkeleton class="h-8 w-16 mb-2" />
              <USkeleton class="h-4 w-32" />
            </div>
            <USkeleton class="h-12 w-12 rounded-full" />
          </div>
        </UCard>
      </template>

      <!-- Cartes réelles -->
      <template v-else>
        <UCard v-for="card in statCards" :key="card.title">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ card.title }}</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ card.value }}
              </p>
              <p :class="`text-sm mt-1 ${getTrendColor(card.growth)}`">
                <UIcon
                  :name="getTrendIcon(card.growth)"
                  class="w-4 h-4 inline mr-1"
                />
                {{ Math.abs(card.growth).toFixed(1) }}% vs période précédente
              </p>
            </div>
            <div :class="`p-3 rounded-full ${card.iconBg}`">
              <UIcon :name="card.icon" :class="`w-6 h-6 ${card.iconColor}`" />
            </div>
          </div>
        </UCard>
      </template>
    </div>

    <!-- Actions rapides -->
    <!-- <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Actions rapides</h3>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UButton
          v-for="action in quickActions"
          :key="action.label"
          @click="action.action"
          :icon="action.icon"
          :color="action.color"
          variant="outline"
          size="lg"
          block
        >
          {{ action.label }}
        </UButton>
      </div>
    </UCard> -->

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Graphique des ventes -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            Évolution des ventes (7 derniers jours)
          </h3>
        </template>

        <div class="h-64">
          <!-- Skeleton pendant le chargement -->
          <div v-if="loadingStats" class="space-y-3 p-4">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-6 w-3/4" />
            <USkeleton class="h-8 w-1/2" />
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-12 w-5/6" />
            <USkeleton class="h-6 w-2/3" />
            <USkeleton class="h-4 w-full" />
          </div>
          <!-- Graphique réel -->
          <template v-else>
            <SimpleChart
              v-if="chartData.data.length > 0"
              :data="chartData.data"
              :labels="chartData.labels"
              type="area"
              color="#3b82f6"
              :height="256"
              :format-value="formatPrice"
            />
            <div
              v-else
              class="h-full flex items-center justify-center bg-gray-50 rounded-lg"
            >
              <div class="text-center">
                <UIcon
                  name="i-heroicons-chart-line"
                  class="w-12 h-12 text-gray-400 mx-auto mb-2"
                />
                <p class="text-gray-500">Aucune donnée disponible</p>
              </div>
            </div>
          </template>
        </div>
      </UCard>

      <!-- Graphique en barres des commandes par statut -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Commandes par statut</h3>
        </template>

        <div class="h-64">
          <!-- Skeleton pendant le chargement -->
          <div v-if="ordersLoading" class="space-y-2 p-4">
            <div class="flex justify-between items-end space-x-2">
              <USkeleton class="h-12 w-8" />
              <USkeleton class="h-16 w-8" />
              <USkeleton class="h-20 w-8" />
              <USkeleton class="h-8 w-8" />
              <USkeleton class="h-24 w-8" />
            </div>
            <div class="flex justify-between space-x-2 mt-4">
              <USkeleton class="h-3 w-12" />
              <USkeleton class="h-3 w-16" />
              <USkeleton class="h-3 w-14" />
              <USkeleton class="h-3 w-12" />
              <USkeleton class="h-3 w-10" />
            </div>
          </div>
          <!-- Graphique réel -->
          <template v-else>
            <SimpleChart
              v-if="orders && orders.length > 0"
              :data="Object.values(orders.reduce((acc, order) => {
                              acc[order.status] = (acc[order.status] || 0) + 1
                              return acc
                          }, {} as Record<string, number>))"
              :labels="Object.keys(orders.reduce((acc, order) => {
                              acc[order.status] = (acc[order.status] || 0) + 1
                              return acc
                          }, {} as Record<string, number>)).map(getStatusLabel)"
              type="bar"
              color="#10b981"
              :height="256"
            />
            <div
              v-else
              class="h-full flex items-center justify-center bg-gray-50 rounded-lg"
            >
              <div class="text-center">
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="w-12 h-12 text-gray-400 mx-auto mb-2"
                />
                <p class="text-gray-500">Aucune donnée disponible</p>
              </div>
            </div>
          </template>
        </div>
      </UCard>
    </div>

    <!-- Tableaux de données récentes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Commandes récentes -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Commandes récentes</h3>
            <UButton
              @click="navigateTo('/dashboard/orders')"
              variant="ghost"
              size="sm"
            >
              Voir tout
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Skeletons pendant le chargement -->
          <template v-if="ordersLoading">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <USkeleton class="h-4 w-32 mb-2" />
                <USkeleton class="h-3 w-20" />
              </div>
              <div class="text-right">
                <USkeleton class="h-4 w-20 mb-2" />
                <USkeleton class="h-5 w-16 rounded-full" />
              </div>
            </div>
          </template>

          <!-- Commandes réelles -->
          <template v-else>
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              @click="navigateTo(`/dashboard/orders/${order.id}`)"
            >
              <div>
                <p class="font-medium text-gray-900">{{ order.customer }}</p>
                <p class="text-sm text-gray-500">
                  {{ new Date(order.date).toLocaleDateString("fr-FR") }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">
                  {{ formatPrice(order.amount) }}
                </p>
                <UBadge
                  :color="getStatusColor(order.status)"
                  variant="subtle"
                  size="sm"
                >
                  {{ getStatusLabel(order.status) }}
                </UBadge>
              </div>
            </div>

            <div
              v-if="recentOrders.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <UIcon
                name="i-heroicons-shopping-bag"
                class="w-12 h-12 mx-auto mb-2 text-gray-300"
              />
              <p>Aucune commande récente</p>
            </div>
          </template>
        </div>
      </UCard>

      <!-- Produits récents -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Produits récents</h3>
            <UButton
              @click="navigateTo('/dashboard/products')"
              variant="ghost"
              size="sm"
            >
              Voir tout
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Skeletons pendant le chargement -->
          <template v-if="productsLoading">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <USkeleton class="h-4 w-40 mb-2" />
                <USkeleton class="h-3 w-24" />
              </div>
              <div class="text-right">
                <USkeleton class="h-4 w-20 mb-2" />
                <USkeleton class="h-5 w-12 rounded-full" />
              </div>
            </div>
          </template>

          <!-- Produits réels -->
          <template v-else>
            <div
              v-for="product in recentProducts"
              :key="product.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              @click="navigateTo(`/dashboard/products/show-${product.id}`)"
            >
              <div>
                <p class="font-medium text-gray-900">{{ product.title }}</p>
                <p class="text-sm text-gray-500">
                  Stock: {{ product.stock }} unités
                  <span v-if="product.review_count > 0" class="ml-2">
                    • {{ product.review_count }} avis ({{
                      product.avg_rating
                    }}/5)
                  </span>
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">
                  {{ formatPrice(product.price) }}
                </p>
                <UBadge
                  :color="getStatusColor(product.status)"
                  variant="subtle"
                  size="sm"
                >
                  {{ getStatusLabel(product.status) }}
                </UBadge>
              </div>
            </div>

            <div
              v-if="recentProducts.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <UIcon
                name="i-heroicons-cube"
                class="w-12 h-12 mx-auto mb-2 text-gray-300"
              />
              <p>Aucun produit récent</p>
            </div>
          </template>
        </div>
      </UCard>
    </div>

    <!-- Modal des transactions du wallet système -->
    <SystemWalletTransactions
      v-if="showSystemWalletTransactions && walletStore.systemWallet"
      :wallet-id="walletStore.systemWallet.id"
      @close="showSystemWalletTransactions = false"
    />
  </div>
</template>
