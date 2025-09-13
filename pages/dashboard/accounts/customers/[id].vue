<script lang="ts" setup>
definePageMeta({
  layout: "dashboard",
  name: "Détails d'un client",
});

const route = useRoute();
const customerStore = useCustomerStore();

// Charger les détails du client
const { data: customer, pending } = await useLazyAsyncData(
  `customer-${route.params.id}`,
  () => customerStore.show(route.params.id as string)
);

const { currentCustomer } = storeToRefs(customerStore);

// Charger les statistiques du client
const customerStats = ref({
  orders: 0,
  totalSpent: 0,
  reviews: 0,
  recentOrders: []
});

// Fonction pour charger les statistiques
async function loadCustomerStats() {
  if (!currentCustomer.value?.id) return;
  
  try {
    const supabase = useSupabaseClient();
    
    // Récupérer les commandes du client
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at, items:order_items(*)')
      .eq('user_id', currentCustomer.value.id)
      .order('created_at', { ascending: false });
    
    if (ordersError) throw ordersError;
    
    // Récupérer les avis du client
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', currentCustomer.value.id);
    
    if (reviewsError) throw reviewsError;
    
    // Calculer les statistiques
    const totalSpent = orders?.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0) || 0;
    
    customerStats.value = {
      orders: orders?.length || 0,
      totalSpent,
      reviews: reviews?.length || 0,
      recentOrders: orders?.slice(0, 5) || []
    };
    
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  }
}

// Charger les stats quand le client change
watch(currentCustomer, (newCustomer) => {
  if (newCustomer?.id) {
    loadCustomerStats();
  }
}, { immediate: true });

// Fonction utilitaire pour formater les montants
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function goBack() {
  return navigateTo("/dashboard/accounts/customers");
}

// États pour les modales
const showEditModal = ref(false);

// Fonctions utilitaires
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(customer: any) {
  const first = customer?.first_name?.charAt(0) || "";
  const last = customer?.last_name?.charAt(0) || "";
  return (first + last).toUpperCase();
}

function getRoleColor(role: string) {
  switch (role) {
    case "admin":
      return "red";
    case "seller":
      return "blue";
    case "buyer":
    default:
      return "green";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Administrateur";
    case "seller":
      return "Vendeur";
    case "buyer":
    default:
      return "Acheteur";
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <UButton
              @click="goBack"
              icon="i-heroicons-arrow-left"
              variant="ghost"
              size="sm"
            >
              Retour
            </UButton>
            <div class="h-6 border-l border-gray-300"></div>
            <h1 class="text-xl font-semibold text-gray-900">
              Détails du client
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="text-gray-500">Chargement du client...</p>
      </div>
    </div>

    <!-- Customer not found -->
    <div v-else-if="!currentCustomer" class="flex justify-center items-center py-20">
      <div class="text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Client non trouvé</h3>
        <p class="text-gray-500">Le client demandé n'existe pas ou a été supprimé.</p>
        <UButton @click="goBack" class="mt-4" variant="outline">
          Retour à la liste
        </UButton>
      </div>
    </div>

    <!-- Customer details -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero section -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div class="p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            <!-- Customer avatar -->
            <div class="flex-shrink-0 mb-6 lg:mb-0">
              <div class="relative">
                <UAvatar
                  :src="currentCustomer.avatar_url"
                  :alt="`${currentCustomer.first_name} ${currentCustomer.last_name}`"
                  size="3xl"
                  class="ring-4 ring-gray-100"
                >
                  <template v-if="!currentCustomer.avatar_url" #fallback>
                    <span class="text-4xl font-bold">
                      {{ getInitials(currentCustomer) }}
                    </span>
                  </template>
                </UAvatar>
                <UBadge
                  :color="getRoleColor(currentCustomer.role)"
                  variant="solid"
                  size="lg"
                  class="absolute -bottom-2 -right-2"
                >
                  {{ currentCustomer.role?.charAt(0).toUpperCase() }}
                </UBadge>
              </div>
            </div>

            <!-- Customer info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {{ currentCustomer.first_name }} {{ currentCustomer.last_name }}
                  </h1>
                  <UBadge
                    :color="getRoleColor(currentCustomer.role)"
                    variant="subtle"
                    size="lg"
                    class="mb-4"
                  >
                    {{ getRoleLabel(currentCustomer.role || "buyer") }}
                  </UBadge>
                </div>
                
                <div class="flex space-x-3">
                  <UButton
                    @click="showEditModal = true"
                    icon="i-heroicons-pencil-square"
                    variant="outline"
                    :loading="customerStore.loading"
                  >
                    Modifier
                  </UButton>
                  <UButton
                    v-if="currentCustomer.phone"
                    :href="`tel:${currentCustomer.phone}`"
                    icon="i-heroicons-phone"
                    variant="outline"
                  >
                    Appeler
                  </UButton>
                </div>
              </div>

              <!-- Contact info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="currentCustomer.phone" class="flex items-center space-x-3">
                  <UIcon name="i-heroicons-phone" class="w-5 h-5 text-gray-400" />
                  <span class="text-gray-900">{{ currentCustomer.phone }}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-gray-400" />
                  <span class="text-gray-900">
                    Inscrit le {{ formatDate(currentCustomer.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Personal Information -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h3>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Prénom</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentCustomer.first_name || "Non renseigné" }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Nom</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentCustomer.last_name || "Non renseigné" }}
                </dd>
              </div>
              <div v-if="currentCustomer.phone">
                <dt class="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentCustomer.phone }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Rôle</dt>
                <dd class="mt-1">
                  <UBadge
                    :color="getRoleColor(currentCustomer.role || 'buyer')"
                    variant="subtle"
                  >
                    {{ getRoleLabel(currentCustomer.role || "buyer") }}
                  </UBadge>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Activity Summary -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Résumé d'activité
            </h3>
            <div class="grid grid-cols-1 gap-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-2xl font-bold text-blue-600">{{ customerStats.orders }}</div>
                    <div class="text-sm text-blue-600">Commandes passées</div>
                  </div>
                  <UIcon name="i-heroicons-shopping-bag" class="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-2xl font-bold text-green-600">{{ formatCurrency(customerStats.totalSpent) }}</div>
                    <div class="text-sm text-green-600">Total dépensé</div>
                  </div>
                  <UIcon name="i-heroicons-banknotes" class="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-2xl font-bold text-purple-600">{{ customerStats.reviews }}</div>
                    <div class="text-sm text-purple-600">Avis laissés</div>
                  </div>
                  <UIcon name="i-heroicons-star" class="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account and Actions -->
        <div class="space-y-6">
          <!-- Account Information -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Informations du compte
            </h3>
            <dl class="space-y-4 text-sm">
              <div>
                <dt class="font-medium text-gray-500">ID du client</dt>
                <dd class="mt-1 text-gray-900 font-mono">
                  {{ currentCustomer.id }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-500">Date de création</dt>
                <dd class="mt-1 text-gray-900">
                  {{ formatDate(currentCustomer.created_at) }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-500">Statut du compte</dt>
                <dd class="mt-1">
                  <UBadge color="green" variant="subtle">
                    Actif
                  </UBadge>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div class="space-y-3">
              <UButton
                @click="navigateTo(`/dashboard/orders?customer_id=${currentCustomer.id}`)"
                icon="i-heroicons-shopping-bag"
                variant="outline"
                block
              >
                Voir les commandes
              </UButton>
              <UButton
                @click="navigateTo(`/dashboard/reviews?customer_id=${currentCustomer.id}`)"
                icon="i-heroicons-star"
                variant="outline"
                block
              >
                Voir les avis
              </UButton>
              <UButton
                @click="navigateTo(`/dashboard/conversations?user_id=${currentCustomer.id}`)"
                icon="i-heroicons-chat-bubble-left-right"
                variant="outline"
                block
              >
                Voir les conversations
              </UButton>
              <UButton
                v-if="currentCustomer.phone"
                :href="`tel:${currentCustomer.phone}`"
                icon="i-heroicons-phone"
                variant="outline"
                block
              >
                Contacter par téléphone
              </UButton>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
            <div class="text-center py-8">
              <UIcon name="i-heroicons-clock" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-500">Aucune activité récente</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders Section -->
      <div class="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Commandes récentes</h3>
          <UButton
            @click="navigateTo(`/dashboard/orders?customer_id=${currentCustomer.id}`)"
            variant="ghost"
            size="sm"
          >
            Voir toutes
          </UButton>
        </div>
        
        <div v-if="customerStats.recentOrders.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 class="text-lg font-medium text-gray-900 mb-2">Aucune commande</h4>
          <p class="text-gray-500">
            Ce client n'a pas encore passé de commande.
          </p>
        </div>
        
        <!-- Liste des commandes récentes -->
        <div v-else class="space-y-4">
          <div
            v-for="order in customerStats.recentOrders"
            :key="order.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            @click="navigateTo(`/dashboard/orders/${order.id}`)"
          >
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <div class="text-sm font-medium text-gray-900">
                  Commande #{{ order.id.substring(0, 8) }}
                </div>
                <UBadge
                  :color="order.status === 'delivered' ? 'green' : order.status === 'shipped' ? 'blue' : order.status === 'confirmed' ? 'yellow' : 'gray'"
                  variant="subtle"
                  size="xs"
                >
                  {{ 
                    order.status === 'delivered' ? 'Livrée' :
                    order.status === 'shipped' ? 'Expédiée' :
                    order.status === 'confirmed' ? 'Confirmée' :
                    order.status === 'pending' ? 'En attente' :
                    'Annulée'
                  }}
                </UBadge>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatDate(order.created_at) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-gray-900">
                {{ formatCurrency(parseFloat(order.total_amount) || 0) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ order.items?.length || 0 }} article{{ (order.items?.length || 0) > 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>