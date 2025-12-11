<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Liste des vendeurs',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'], // Gestion des vendeurs réservée aux admins
})

const sellerStore = useSellerStore()

const { sellers, loading, paginationInfo } = storeToRefs(sellerStore)

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
  is_approved: undefined as boolean | undefined,
})

// Debounce sur la recherche
const debouncedSearch = ref('')
watch(
  () => filters.value.search,
  useDebounce((value: string) => {
    debouncedSearch.value = value
  }, 500),
  { immediate: true },
)

// Fonction pour charger les vendeurs avec pagination
async function loadSellers() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value || undefined,
    is_approved: filters.value.is_approved,
  }

  await sellerStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  await loadSellers()
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadSellers()
}

// Changement de taille de page
function onPageSizeChange(event: any) {
  const newSize = typeof event === 'number' ? event : Number(event)
  pageSize.value = newSize
  currentPage.value = 1
  loadSellers()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadSellers()
})

watch(
  () => filters.value.is_approved,
  () => {
    currentPage.value = 1
    loadSellers()
  },
)

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    is_approved: undefined,
  }
}

// Actions
function viewSeller(seller: any) {
  navigateTo(`/dashboard/accounts/sellers/${seller.id}`)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
  return isApproved ? 'Approuvé' : 'En attente'
}

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.is_approved !== undefined) count++
  return count
})

// Statistiques
const stats = computed(() => {
  return {
    total: paginationInfo.value.total,
    approved: 0, // Ces stats nécessiteraient un appel API séparé
    pending: 0,
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Vendeurs
        </h1>
        <p class="text-gray-600">
          Gérez vos vendeurs et leur statut d'approbation
        </p>
      </div>

      <!-- Statistiques -->
      <div class="flex items-center space-x-3">
        <UBadge
          color="blue"
          variant="subtle"
          size="lg"
        >
          {{ stats.total }} vendeur{{ stats.total > 1 ? 's' : '' }}
        </UBadge>
        <UBadge
          color="green"
          variant="subtle"
          size="lg"
        >
          {{ stats.approved }} approuvé{{ stats.approved > 1 ? 's' : '' }}
        </UBadge>
        <UBadge
          color="yellow"
          variant="subtle"
          size="lg"
        >
          {{ stats.pending }} en attente
        </UBadge>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <UCard>
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <!-- Recherche -->
        <div class="flex-1">
          <UInput
            v-model="filters.search"
            placeholder="Rechercher par entreprise, email, téléphone..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
          />
        </div>

        <!-- Filtres -->
        <div class="flex items-center space-x-3">
          <USelect
            v-model="filters.is_approved"
            :options="[
              { label: 'Tous les vendeurs', value: undefined },
              { label: 'Approuvés', value: true },
              { label: 'En attente', value: false },
            ]"
            placeholder="Statut"
            size="lg"
          />

          <USelect
            v-model="pageSize"
            :options="[
              { value: 10, label: '10 / page' },
              { value: 20, label: '20 / page' },
              { value: 50, label: '50 / page' },
              { value: 100, label: '100 / page' },
            ]"
            @change="onPageSizeChange"
          />

          <UButton
            v-if="activeFiltersCount > 0"
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            size="lg"
            title="Réinitialiser les filtres"
            @click="resetFilters"
          />
        </div>
      </div>
    </UCard>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UCard
        v-for="i in 6"
        :key="i"
      >
        <div class="flex items-start space-x-4">
          <USkeleton class="h-12 w-12 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-1/2" />
            <USkeleton class="h-3 w-2/3" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Liste des vendeurs -->
    <div
      v-else-if="sellers.length > 0"
      class="space-y-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="seller in sellers"
          :key="seller.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewSeller(seller)"
        >
          <div class="flex items-start space-x-4">
            <!-- Logo de l'entreprise -->
            <div class="flex-shrink-0">
              <div class="relative">
                <UAvatar
                  :src="seller.company_logo"
                  :alt="seller.company_name"
                  size="lg"
                  class="rounded-lg"
                >
                  <template
                    v-if="!seller.company_logo"
                    #fallback
                  >
                    <span class="text-lg font-bold">
                      {{ getCompanyInitials(seller.company_name) }}
                    </span>
                  </template>
                </UAvatar>
                <UBadge
                  :color="getStatusColor(seller.is_approved)"
                  variant="solid"
                  size="xs"
                  class="absolute -top-1 -right-1"
                >
                  {{ seller.is_approved ? '✓' : '!' }}
                </UBadge>
              </div>
            </div>

            <!-- Informations -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">
                    {{ seller.company_name }}
                  </h3>
                  <UBadge
                    :color="getStatusColor(seller.is_approved)"
                    variant="subtle"
                    size="sm"
                    class="mt-1"
                  >
                    {{ getStatusLabel(seller.is_approved) }}
                  </UBadge>
                </div>
                <UButton
                  icon="i-heroicons-eye"
                  variant="ghost"
                  size="sm"
                  @click.stop="viewSeller(seller)"
                />
              </div>

              <!-- Détails -->
              <div class="mt-3 space-y-1">
                <div
                  v-if="seller.email"
                  class="flex items-center text-sm text-gray-600"
                >
                  <UIcon
                    name="i-heroicons-envelope"
                    class="w-4 h-4 mr-2"
                  />
                  <span class="truncate">{{ seller.email }}</span>
                </div>
                <div
                  v-if="seller.phone"
                  class="flex items-center text-sm text-gray-600"
                >
                  <UIcon
                    name="i-heroicons-phone"
                    class="w-4 h-4 mr-2"
                  />
                  {{ seller.phone }}
                </div>
                <div
                  v-if="seller.website"
                  class="flex items-center text-sm text-gray-600"
                >
                  <UIcon
                    name="i-heroicons-globe-alt"
                    class="w-4 h-4 mr-2"
                  />
                  <span class="truncate">{{ seller.website }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <UIcon
                    name="i-heroicons-calendar"
                    class="w-4 h-4 mr-2"
                  />
                  Inscrit le {{ formatDate(seller.created_at) }}
                </div>
              </div>

              <!-- Description courte -->
              <div
                v-if="seller.company_description"
                class="mt-3"
              >
                <p class="text-sm text-gray-600 line-clamp-2">
                  {{ seller.company_description }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div class="text-sm text-gray-700">
          <template v-if="paginationInfo.total > 0">
            Affichage de
            <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
            à
            <span class="font-medium">{{
              Math.min(currentPage * pageSize, paginationInfo.total)
            }}</span>
            sur
            <span class="font-medium">{{ paginationInfo.total }}</span>
            vendeur{{ paginationInfo.total > 1 ? 's' : '' }}
          </template>
          <template v-else>
            Aucun vendeur trouvé
          </template>
        </div>

        <Pagination
          v-if="totalPages > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total="paginationInfo.total"
          :page-size="pageSize"
          @update:current-page="onPageChange"
        />
      </div>
    </div>

    <!-- État vide -->
    <UCard v-else-if="!loading">
      <div class="text-center py-12">
        <UIcon
          name="i-heroicons-building-storefront"
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ activeFiltersCount > 0 ? 'Aucun vendeur trouvé' : 'Aucun vendeur' }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{
            activeFiltersCount > 0
              ? 'Essayez de modifier vos critères de recherche ou filtres.'
              : "Les vendeurs s'afficheront ici une fois qu'ils se seront inscrits."
          }}
        </p>
        <UButton
          v-if="activeFiltersCount > 0"
          variant="outline"
          @click="resetFilters"
        >
          Effacer les filtres
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
