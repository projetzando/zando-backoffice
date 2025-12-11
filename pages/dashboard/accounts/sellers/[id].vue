<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  name: 'Détails d\'un vendeur',
  roles: ['admin', 'superadmin'],
})

const route = useRoute()
const sellerStore = useSellerStore()

// Charger les détails du vendeur
const { data: seller, pending } = await useLazyAsyncData(`seller-${route.params.id}`, () =>
  sellerStore.show(route.params.id as string),
)

const { currentSeller } = storeToRefs(sellerStore)

// Charger les statistiques du vendeur
const sellerStats = ref({
  products: 0,
  orders: 0,
  revenue: 0,
  reviews: 0,
})

// Fonction pour charger les statistiques
async function loadSellerStats() {
  if (!currentSeller.value?.id) return

  try {
    const supabase = useSupabaseClient()

    // Récupérer les produits du vendeur
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', currentSeller.value.id)

    if (productsError) throw productsError

    // Récupérer les commandes liées aux produits du vendeur
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, order_items!inner(product_id)')
      .in('order_items.product_id', products?.map(p => p.id) || [])

    if (ordersError) throw ordersError

    // Récupérer les avis pour les produits du vendeur
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id')
      .in('product_id', products?.map(p => p.id) || [])

    if (reviewsError) throw reviewsError

    // Calculer le chiffre d'affaires
    const revenue
      = orders?.reduce((sum, order) => {
        return sum + (parseFloat(order.total_amount) || 0)
      }, 0) || 0

    sellerStats.value = {
      products: products?.length || 0,
      orders: orders?.length || 0,
      revenue,
      reviews: reviews?.length || 0,
    }
  }
  catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

// Charger les stats quand le vendeur change
watch(
  currentSeller,
  (newSeller) => {
    if (newSeller?.id) {
      loadSellerStats()
    }
  },
  { immediate: true },
)

function goBack() {
  return navigateTo('/dashboard/accounts/sellers')
}

// États pour les modales
const showApprovalModal = ref(false)
const showEditModal = ref(false)

// Actions
async function toggleApproval() {
  if (!currentSeller.value) return

  const newStatus = !currentSeller.value.is_approved
  const result = await sellerStore.updateApprovalStatus(currentSeller.value.id, newStatus)

  if (result.success) {
    currentSeller.value.is_approved = newStatus
  }
}

// Fonctions utilitaires
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getCompanyInitials(companyName: string) {
  return (
    companyName
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??'
  )
}

function getStatusColor(isApproved: boolean) {
  return isApproved ? 'green' : 'yellow'
}

function getStatusLabel(isApproved: boolean) {
  return isApproved ? 'Approuvé' : 'En attente d\'approbation'
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
              icon="i-heroicons-arrow-left"
              variant="ghost"
              size="sm"
              @click="goBack"
            >
              Retour
            </UButton>
            <div class="h-6 border-l border-gray-300" />
            <h1 class="text-xl font-semibold text-gray-900">
              Détails du vendeur
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="pending"
      class="flex justify-center items-center py-20"
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <p class="text-gray-500">
          Chargement du vendeur...
        </p>
      </div>
    </div>

    <!-- Seller not found -->
    <div
      v-else-if="!currentSeller"
      class="flex justify-center items-center py-20"
    >
      <div class="text-center">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Vendeur non trouvé
        </h3>
        <p class="text-gray-500">
          Le vendeur demandé n'existe pas ou a été supprimé.
        </p>
        <UButton
          class="mt-4"
          variant="outline"
          @click="goBack"
        >
          Retour à la liste
        </UButton>
      </div>
    </div>

    <!-- Seller details -->
    <div
      v-else
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <!-- Hero section -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div class="p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            <!-- Company logo -->
            <div class="flex-shrink-0 mb-6 lg:mb-0">
              <div class="relative">
                <div
                  class="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
                >
                  <img
                    v-if="currentSeller.company_logo"
                    :src="currentSeller.company_logo"
                    :alt="currentSeller.company_name"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="text-3xl font-bold text-gray-600"
                  >
                    {{ getCompanyInitials(currentSeller.company_name) }}
                  </div>
                </div>
                <UBadge
                  :color="getStatusColor(currentSeller.is_approved)"
                  variant="solid"
                  size="lg"
                  class="absolute -top-2 -right-2"
                >
                  {{ currentSeller.is_approved ? '✓' : '!' }}
                </UBadge>
              </div>
            </div>

            <!-- Company info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {{ currentSeller.company_name }}
                  </h1>
                  <UBadge
                    :color="getStatusColor(currentSeller.is_approved)"
                    variant="subtle"
                    size="lg"
                    class="mb-4"
                  >
                    {{ getStatusLabel(currentSeller.is_approved) }}
                  </UBadge>
                </div>

                <div class="flex space-x-3">
                  <UButton
                    icon="i-heroicons-pencil-square"
                    variant="outline"
                    :loading="sellerStore.loading"
                    @click="showEditModal = true"
                  >
                    Modifier
                  </UButton>
                  <UButton
                    :icon="currentSeller.is_approved ? 'i-heroicons-x-mark' : 'i-heroicons-check'"
                    :color="currentSeller.is_approved ? 'red' : 'green'"
                    variant="outline"
                    :loading="sellerStore.loading"
                    @click="toggleApproval"
                  >
                    {{ currentSeller.is_approved ? 'Désapprouver' : 'Approuver' }}
                  </UButton>
                </div>
              </div>

              <!-- Company description -->
              <div
                v-if="currentSeller.company_description"
                class="prose max-w-none mb-6"
              >
                <p class="text-gray-700 leading-relaxed">
                  {{ currentSeller.company_description }}
                </p>
              </div>

              <!-- Contact info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-if="currentSeller.email"
                  class="flex items-center space-x-3"
                >
                  <UIcon
                    name="i-heroicons-envelope"
                    class="w-5 h-5 text-gray-400"
                  />
                  <span class="text-gray-900">{{ currentSeller.email }}</span>
                </div>
                <div
                  v-if="currentSeller.phone"
                  class="flex items-center space-x-3"
                >
                  <UIcon
                    name="i-heroicons-phone"
                    class="w-5 h-5 text-gray-400"
                  />
                  <span class="text-gray-900">{{ currentSeller.phone }}</span>
                </div>
                <div
                  v-if="currentSeller.website"
                  class="flex items-center space-x-3"
                >
                  <UIcon
                    name="i-heroicons-globe-alt"
                    class="w-5 h-5 text-gray-400"
                  />
                  <a
                    :href="currentSeller.website"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-700"
                  >
                    {{ currentSeller.website }}
                  </a>
                </div>
                <div class="flex items-center space-x-3">
                  <UIcon
                    name="i-heroicons-calendar"
                    class="w-5 h-5 text-gray-400"
                  />
                  <span class="text-gray-900">
                    Inscrit le {{ formatDate(currentSeller.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Business Information -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Informations commerciales
            </h3>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">
                  Nom de l'entreprise
                </dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentSeller.company_name }}
                </dd>
              </div>
              <div v-if="currentSeller.company_description">
                <dt class="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentSeller.company_description }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">
                  Statut
                </dt>
                <dd class="mt-1">
                  <UBadge
                    :color="getStatusColor(currentSeller.is_approved)"
                    variant="subtle"
                  >
                    {{ getStatusLabel(currentSeller.is_approved) }}
                  </UBadge>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Contact Information -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Informations de contact
            </h3>
            <dl class="space-y-4">
              <div v-if="currentSeller.email">
                <dt class="text-sm font-medium text-gray-500">
                  Email
                </dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentSeller.email }}
                </dd>
              </div>
              <div v-if="currentSeller.phone">
                <dt class="text-sm font-medium text-gray-500">
                  Téléphone
                </dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentSeller.phone }}
                </dd>
              </div>
              <div v-if="currentSeller.website">
                <dt class="text-sm font-medium text-gray-500">
                  Site web
                </dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <a
                    :href="currentSeller.website"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-700"
                  >
                    {{ currentSeller.website }}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Statistics and Actions -->
        <div class="space-y-6">
          <!-- Quick Stats -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Statistiques
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">
                  {{ sellerStats.products }}
                </div>
                <div class="text-sm text-blue-600">
                  Produits
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-600">
                  {{ sellerStats.orders }}
                </div>
                <div class="text-sm text-green-600">
                  Commandes
                </div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">
                  {{ formatPrice(sellerStats.revenue) }}
                </div>
                <div class="text-sm text-purple-600">
                  Chiffre d'affaires
                </div>
              </div>
              <div class="bg-orange-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-orange-600">
                  {{ sellerStats.reviews }}
                </div>
                <div class="text-sm text-orange-600">
                  Avis
                </div>
              </div>
            </div>
          </div>

          <!-- Account Information -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Informations du compte
            </h3>
            <dl class="space-y-4 text-sm">
              <div>
                <dt class="font-medium text-gray-500">
                  ID du vendeur
                </dt>
                <dd class="mt-1 text-gray-900 font-mono">
                  {{ currentSeller.id }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-500">
                  Date de création
                </dt>
                <dd class="mt-1 text-gray-900">
                  {{ formatDate(currentSeller.created_at) }}
                </dd>
              </div>
              <div v-if="currentSeller.user_id">
                <dt class="font-medium text-gray-500">
                  ID utilisateur lié
                </dt>
                <dd class="mt-1 text-gray-900 font-mono">
                  {{ currentSeller.user_id }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div class="space-y-3">
              <UButton
                icon="i-heroicons-cube"
                variant="outline"
                block
                @click="navigateTo(`/dashboard/products?seller_id=${currentSeller.id}`)"
              >
                Voir les produits
              </UButton>
              <UButton
                icon="i-heroicons-shopping-bag"
                variant="outline"
                block
                @click="navigateTo(`/dashboard/orders?seller_id=${currentSeller.id}`)"
              >
                Voir les commandes
              </UButton>
              <UButton
                v-if="currentSeller.email"
                :href="`mailto:${currentSeller.email}`"
                icon="i-heroicons-envelope"
                variant="outline"
                block
              >
                Contacter par email
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
