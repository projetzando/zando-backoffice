<script setup lang="ts">
definePageMeta({
  name: "Liste des vendeurs",
  layout: "dashboard",
});

const sellerStore = useSellerStore();

// Chargement des données
onMounted(() => {
  sellerStore.get();
});

const { sellers } = storeToRefs(sellerStore);

// États pour les filtres et la recherche
const searchQuery = ref("");
const statusFilter = ref("all");
const sortBy = ref("created_at");
const sortOrder = ref("desc");
const page = ref(1);
const pageSize = ref(10);

// Filtres et recherche
const filteredSellers = computed(() => {
  let filtered = sellers.value || [];

  // Recherche par nom d'entreprise, email ou téléphone
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (seller) =>
        seller.company_name?.toLowerCase().includes(query) ||
        seller.email?.toLowerCase().includes(query) ||
        seller.phone?.toLowerCase().includes(query)
    );
  }

  // Filtre par statut d'approbation
  if (statusFilter.value !== "all") {
    const isApproved = statusFilter.value === "approved";
    filtered = filtered.filter((seller) => seller.is_approved === isApproved);
  }

  // Tri
  filtered.sort((a, b) => {
    let aValue = a[sortBy.value];
    let bValue = b[sortBy.value];

    if (sortBy.value === "created_at") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder.value === "desc") {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });

  return filtered;
});

// Statistiques
const stats = computed(() => {
  const total = sellers.value?.length || 0;
  const approved = sellers.value?.filter(s => s.is_approved)?.length || 0;
  const pending = total - approved;
  
  return { total, approved, pending };
});

// Pagination
const totalSellers = computed(() => filteredSellers.value.length);
const totalPages = computed(() => Math.ceil(totalSellers.value / pageSize.value));
const paginatedSellers = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredSellers.value.slice(start, end);
});

// Actions
function viewSeller(seller: any) {
  navigateTo(`/dashboard/accounts/sellers/${seller.id}`);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCompanyInitials(companyName: string) {
  return companyName
    ?.split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2) || "??";
}

function getStatusColor(isApproved: boolean) {
  return isApproved ? "green" : "yellow";
}

function getStatusLabel(isApproved: boolean) {
  return isApproved ? "Approuvé" : "En attente";
}

// Reset des filtres
function resetFilters() {
  searchQuery.value = "";
  statusFilter.value = "all";
  sortBy.value = "created_at";
  sortOrder.value = "desc";
  page.value = 1;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Vendeurs</h1>
        <p class="text-gray-600">
          Gérez vos vendeurs et leur statut d'approbation
        </p>
      </div>
      
      <!-- Statistiques -->
      <div class="flex items-center space-x-3">
        <UBadge color="blue" variant="subtle" size="lg">
          {{ stats.total }} vendeur{{ stats.total > 1 ? "s" : "" }}
        </UBadge>
        <UBadge color="green" variant="subtle" size="lg">
          {{ stats.approved }} approuvé{{ stats.approved > 1 ? "s" : "" }}
        </UBadge>
        <UBadge color="yellow" variant="subtle" size="lg">
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
            v-model="searchQuery"
            placeholder="Rechercher par entreprise, email, téléphone..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
          />
        </div>

        <!-- Filtres et tri -->
        <div class="flex items-center space-x-3">
          <USelect
            v-model="statusFilter"
            :options="[
              { label: 'Tous les vendeurs', value: 'all' },
              { label: 'Approuvés', value: 'approved' },
              { label: 'En attente', value: 'pending' },
            ]"
            placeholder="Statut"
            size="lg"
          />
          <USelect
            v-model="sortBy"
            :options="[
              { label: 'Date de création', value: 'created_at' },
              { label: 'Nom d\'entreprise', value: 'company_name' },
              { label: 'Email', value: 'email' },
            ]"
            placeholder="Trier par"
            size="lg"
          />
          <UButton
            @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            :icon="sortOrder === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'"
            variant="outline"
            size="lg"
          />
          <UButton
            @click="resetFilters"
            icon="i-heroicons-arrow-path"
            variant="outline"
            size="lg"
            title="Réinitialiser les filtres"
          />
        </div>
      </div>
    </UCard>

    <!-- Loading state -->
    <div v-if="sellerStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="i in 6" :key="i">
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
    <div v-else-if="paginatedSellers.length > 0" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="seller in paginatedSellers"
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
                  <template v-if="!seller.company_logo" #fallback>
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
                  {{ seller.is_approved ? "✓" : "!" }}
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
                <div v-if="seller.email" class="flex items-center text-sm text-gray-600">
                  <UIcon name="i-heroicons-envelope" class="w-4 h-4 mr-2" />
                  <span class="truncate">{{ seller.email }}</span>
                </div>
                <div v-if="seller.phone" class="flex items-center text-sm text-gray-600">
                  <UIcon name="i-heroicons-phone" class="w-4 h-4 mr-2" />
                  {{ seller.phone }}
                </div>
                <div v-if="seller.website" class="flex items-center text-sm text-gray-600">
                  <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 mr-2" />
                  <span class="truncate">{{ seller.website }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2" />
                  Inscrit le {{ formatDate(seller.created_at) }}
                </div>
              </div>

              <!-- Description courte -->
              <div v-if="seller.company_description" class="mt-3">
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
          Affichage de {{ (page - 1) * pageSize + 1 }} à
          {{ Math.min(page * pageSize, totalSellers) }} sur {{ totalSellers }}
          vendeur{{ totalSellers > 1 ? "s" : "" }}
        </div>
        <UPagination
          v-if="totalPages > 1"
          v-model="page"
          :page-count="totalPages"
          :total="totalSellers"
          show-first
          show-last
        />
      </div>
    </div>

    <!-- État vide -->
    <UCard v-else-if="!sellerStore.loading">
      <div class="text-center py-12">
        <UIcon name="i-heroicons-building-storefront" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery || statusFilter !== 'all' ? "Aucun vendeur trouvé" : "Aucun vendeur" }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{
            searchQuery || statusFilter !== 'all'
              ? "Essayez de modifier vos critères de recherche ou filtres."
              : "Les vendeurs s'afficheront ici une fois qu'ils se seront inscrits."
          }}
        </p>
        <UButton
          v-if="searchQuery || statusFilter !== 'all'"
          @click="resetFilters"
          variant="outline"
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