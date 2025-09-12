<script setup lang="ts">
definePageMeta({
  name: "Tableau de bord",
  layout: "dashboard",
});

const orderStore = useOrderStore();
const productStore = useProductStore();
const { calculateStats, getTrendData, getAlerts } = useDashboardStats();

// États réactifs
const { orders, loading: ordersLoading } = storeToRefs(orderStore);
const { products, loading: productsLoading } = storeToRefs(productStore);

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
    // Charger les données de base (utilise les vues optimisées)
    await Promise.all([orderStore.getAll(), productStore.getAll()]);

    // Calculer les statistiques
    const { data: stats } = await calculateStats(selectedPeriod.value as any);
    if (stats) {
      statsData.value = stats;
    }

    // Récupérer les données de tendance pour le graphique
    const trendData = await getTrendData("day", 7);
    chartData.value = trendData;

    // Récupérer les alertes
    const alertsData = await getAlerts();
    alerts.value = alertsData;
  } catch (error) {
    console.error("Erreur lors du chargement du dashboard:", error);
  } finally {
    loadingStats.value = false;
    loadingAlerts.value = false;
  }
}

// Fonction de formatage pour les valeurs monétaires
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
  }).format(amount);
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
const statCards = computed(() => [
  {
    title: "Revenus totaux",
    value: formatCurrency(statsData.value.revenue.current),
    growth: statsData.value.revenue.growth,
    icon: "i-heroicons-currency-dollar",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Commandes totales",
    value: formatNumber(statsData.value.orders.current),
    growth: statsData.value.orders.growth,
    icon: "i-heroicons-shopping-bag",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Produits actifs",
    value: formatNumber(statsData.value.products.current),
    growth: statsData.value.products.growth,
    icon: "i-heroicons-cube",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Nouveaux clients",
    value: formatNumber(statsData.value.customers.current),
    growth: statsData.value.customers.growth,
    icon: "i-heroicons-user-plus",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
]);

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
              :format-value="formatCurrency"
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
                  {{ formatCurrency(order.amount) }}
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
                  {{ formatCurrency(product.price) }}
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
  </div>
</template>
