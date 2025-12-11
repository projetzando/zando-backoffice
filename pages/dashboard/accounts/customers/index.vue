<script setup lang="ts">
definePageMeta({
  name: "Liste des acheteurs",
  layout: "dashboard",
  roles: ['admin', 'superadmin'], // Gestion des clients réservée aux admins
});

const customerStore = useCustomerStore();

// Chargement des données
onMounted(() => {
  customerStore.get();
});

const { customers } = storeToRefs(customerStore);

// États pour les filtres et la recherche
const searchQuery = ref("");
const statusFilter = ref("all");
const sortBy = ref("created_at");
const sortOrder = ref("desc");
const page = ref(1);
const pageSize = ref(10);

// Filtres et recherche
const filteredCustomers = computed(() => {
  let filtered = customers.value || [];

  // Recherche par nom, email ou téléphone
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (customer) =>
        customer.first_name?.toLowerCase().includes(query) ||
        customer.last_name?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
    );
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

// Pagination
const totalCustomers = computed(() => filteredCustomers.value.length);
const totalPages = computed(() => Math.ceil(totalCustomers.value / pageSize.value));
const paginatedCustomers = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCustomers.value.slice(start, end);
});

// Actions
function viewCustomer(customer: any) {
  navigateTo(`/dashboard/accounts/customers/${customer.id}`);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(customer: any) {
  const first = customer.first_name?.charAt(0) || "";
  const last = customer.last_name?.charAt(0) || "";
  return (first + last).toUpperCase();
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
        <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
        <p class="text-gray-600">
          Gérez vos clients et consultez leurs informations
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <UBadge color="blue" variant="subtle" size="lg">
          {{ totalCustomers }} client{{ totalCustomers > 1 ? "s" : "" }}
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
            placeholder="Rechercher par nom, téléphone..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
          />
        </div>

        <!-- Tri -->
        <div class="flex items-center space-x-3">
          <USelect
            v-model="sortBy"
            :options="[
              { label: 'Date de création', value: 'created_at' },
              { label: 'Prénom', value: 'first_name' },
              { label: 'Nom', value: 'last_name' },
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
    <div v-if="customerStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="i in 6" :key="i">
        <div class="flex items-start space-x-4">
          <USkeleton class="h-12 w-12 rounded-full" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-1/2" />
            <USkeleton class="h-3 w-2/3" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Liste des clients -->
    <div v-else-if="paginatedCustomers.length > 0" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="customer in paginatedCustomers"
          :key="customer.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewCustomer(customer)"
        >
          <div class="flex items-start space-x-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <UAvatar
                :src="customer.avatar_url"
                :alt="`${customer.first_name} ${customer.last_name}`"
                size="lg"
              >
                <template v-if="!customer.avatar_url" #fallback>
                  <span class="text-lg font-medium">
                    {{ getInitials(customer) }}
                  </span>
                </template>
              </UAvatar>
            </div>

            <!-- Informations -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">
                    {{ customer.first_name }} {{ customer.last_name }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    Rôle: {{ customer.role || "buyer" }}
                  </p>
                </div>
                <UButton
                  icon="i-heroicons-eye"
                  variant="ghost"
                  size="sm"
                  @click.stop="viewCustomer(customer)"
                />
              </div>

              <!-- Détails -->
              <div class="mt-3 space-y-1">
                <div v-if="customer.phone" class="flex items-center text-sm text-gray-600">
                  <UIcon name="i-heroicons-phone" class="w-4 h-4 mr-2" />
                  {{ customer.phone }}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2" />
                  Inscrit le {{ formatDate(customer.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div class="text-sm text-gray-700">
          Affichage de {{ (page - 1) * pageSize + 1 }} à
          {{ Math.min(page * pageSize, totalCustomers) }} sur {{ totalCustomers }}
          client{{ totalCustomers > 1 ? "s" : "" }}
        </div>
        <UPagination
          v-if="totalPages > 1"
          v-model="page"
          :page-count="totalPages"
          :total="totalCustomers"
          show-first
          show-last
        />
      </div>
    </div>

    <!-- État vide -->
    <UCard v-else-if="!customerStore.loading">
      <div class="text-center py-12">
        <UIcon name="i-heroicons-users" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? "Aucun client trouvé" : "Aucun client" }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{
            searchQuery
              ? "Essayez de modifier vos critères de recherche."
              : "Les clients s'afficheront ici une fois qu'ils se seront inscrits."
          }}
        </p>
        <UButton
          v-if="searchQuery"
          @click="resetFilters"
          variant="outline"
        >
          Effacer les filtres
        </UButton>
      </div>
    </UCard>
  </div>
</template>