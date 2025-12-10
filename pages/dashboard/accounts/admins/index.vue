<script setup lang="ts">
definePageMeta({
  name: "Liste des administrateurs",
  layout: "dashboard",
});

const adminStore = useAdminStore();
const authStore = useAuthStore();
const toast = useToast();

// Chargement des données
onMounted(() => {
  adminStore.get();
});

const { admins } = storeToRefs(adminStore);

// États pour les filtres et la recherche
const searchQuery = ref("");
const roleFilter = ref("all");
const statusFilter = ref("all");
const sortBy = ref("created_at");
const sortOrder = ref("desc");
const page = ref(1);
const pageSize = ref(10);

// Filtres et recherche
const filteredAdmins = computed(() => {
  let filtered = admins.value || [];

  // Recherche par nom, email ou téléphone
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (admin) =>
        admin.first_name?.toLowerCase().includes(query) ||
        admin.last_name?.toLowerCase().includes(query) ||
        admin.email?.toLowerCase().includes(query) ||
        admin.phone?.toLowerCase().includes(query)
    );
  }

  // Filtre par rôle
  if (roleFilter.value !== "all") {
    filtered = filtered.filter((admin) => admin.role === roleFilter.value);
  }

  // Filtre par statut
  if (statusFilter.value !== "all") {
    const isActive = statusFilter.value === "active";
    filtered = filtered.filter((admin) => admin.is_active === isActive);
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
const totalAdmins = computed(() => filteredAdmins.value.length);
const totalPages = computed(() =>
  Math.ceil(totalAdmins.value / pageSize.value)
);
const paginatedAdmins = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredAdmins.value.slice(start, end);
});

// Stats
const stats = computed(() => ({
  total: admins.value.length,
  active: admins.value.filter((a) => a.is_active).length,
  superadmins: admins.value.filter((a) => a.role === "superadmin").length,
  regularAdmins: admins.value.filter((a) => a.role === "admin").length,
}));

// Actions
function viewAdmin(admin: any) {
  navigateTo(`/dashboard/accounts/admins/${admin.id}`);
}

async function toggleAdminStatus(admin: Admin) {
  // Empêcher de désactiver son propre compte
  if (admin.id === authStore.connected_user?.id) {
    toast.add({
      title: "Action interdite",
      description: "Vous ne pouvez pas désactiver votre propre compte.",
      color: "red",
      icon: "i-heroicons-shield-exclamation",
    });
    return;
  }

  const result = await adminStore.toggleStatus(admin.id!);

  if (result.success) {
    toast.add({
      title: "Statut mis à jour",
      description: `L'administrateur a été ${
        admin.is_active ? "désactivé" : "activé"
      }.`,
      color: "green",
      icon: "i-heroicons-check-circle",
    });
  } else {
    toast.add({
      title: "Erreur",
      description: "Impossible de mettre à jour le statut.",
      color: "red",
      icon: "i-heroicons-exclamation-triangle",
    });
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(admin: any) {
  const first = admin.first_name?.charAt(0) || "";
  const last = admin.last_name?.charAt(0) || "";
  return (first + last).toUpperCase();
}

function getRoleBadgeColor(role: string) {
  return role === "superadmin" ? "red" : "blue";
}

function getRoleLabel(role: string) {
  return role === "superadmin" ? "Super Admin" : "Admin";
}

// Reset des filtres
function resetFilters() {
  searchQuery.value = "";
  roleFilter.value = "all";
  statusFilter.value = "all";
  sortBy.value = "created_at";
  sortOrder.value = "desc";
  page.value = 1;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Administrateurs</h1>
        <p class="text-sm text-gray-600 mt-1">
          Gérez les comptes administrateurs du backoffice
        </p>
      </div>
      <UButton
        v-role="'superadmin'"
        icon="i-heroicons-plus"
        size="lg"
        label="Nouvel administrateur"
        @click="navigateTo('/dashboard/accounts/admins/create')"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-3 bg-blue-100 rounded-lg">
            <UIcon
              name="i-heroicons-user-group"
              class="w-6 h-6 text-blue-600"
            />
          </div>
          <div>
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-3 bg-green-100 rounded-lg">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-green-600"
            />
          </div>
          <div>
            <p class="text-sm text-gray-600">Actifs</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-3 bg-red-100 rounded-lg">
            <UIcon
              name="i-heroicons-shield-check"
              class="w-6 h-6 text-red-600"
            />
          </div>
          <div>
            <p class="text-sm text-gray-600">Super Admins</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.superadmins }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-3 bg-purple-100 rounded-lg">
            <UIcon
              name="i-heroicons-user-circle"
              class="w-6 h-6 text-purple-600"
            />
          </div>
          <div>
            <p class="text-sm text-gray-600">Admins</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.regularAdmins }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Filtres et recherche -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher..."
          size="lg"
        />

        <USelectMenu
          v-model="roleFilter"
          :options="[
            { label: 'Tous les rôles', value: 'all' },
            { label: 'Super Admin', value: 'superadmin' },
            { label: 'Admin', value: 'admin' },
          ]"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filtrer par rôle"
          size="lg"
        />

        <USelectMenu
          v-model="statusFilter"
          :options="[
            { label: 'Tous les statuts', value: 'all' },
            { label: 'Actifs', value: 'active' },
            { label: 'Inactifs', value: 'inactive' },
          ]"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filtrer par statut"
          size="lg"
        />

        <UButton
          icon="i-heroicons-x-mark"
          label="Réinitialiser"
          color="gray"
          variant="outline"
          size="lg"
          @click="resetFilters"
        />
      </div>
    </UCard>

    <!-- Tableau des admins -->
    <UCard>
      <div v-if="adminStore.loading" class="flex justify-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 animate-spin text-primary"
        />
      </div>

      <div v-else-if="paginatedAdmins.length === 0" class="text-center py-12">
        <UIcon
          name="i-heroicons-user-group"
          class="w-12 h-12 mx-auto text-gray-400"
        />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">
          Aucun administrateur
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{
            searchQuery
              ? "Aucun résultat trouvé"
              : "Commencez par ajouter un administrateur"
          }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Administrateur
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email & Téléphone
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rôle
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date création
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="admin in paginatedAdmins"
              :key="admin.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              @click="viewAdmin(admin)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      v-if="!admin.avatar_url"
                      class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-primary-700">
                        {{ getInitials(admin) }}
                      </span>
                    </div>
                    <img
                      v-else
                      :src="admin.avatar_url"
                      :alt="`${admin.first_name} ${admin.last_name}`"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ admin.first_name }} {{ admin.last_name }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ admin.email }}</div>
                <div class="text-sm text-gray-500">
                  {{ admin.phone || "-" }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getRoleBadgeColor(admin.role!)"
                  variant="subtle"
                  size="sm"
                >
                  {{ getRoleLabel(admin.role!) }}
                </UBadge>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="admin.is_active ? 'green' : 'gray'"
                  variant="subtle"
                  size="sm"
                >
                  {{ admin.is_active ? "Actif" : "Inactif" }}
                </UBadge>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(admin.created_at!) }}
              </td>

              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex justify-end gap-2" @click.stop>
                  <UButton
                    icon="i-heroicons-eye"
                    size="sm"
                    color="gray"
                    variant="ghost"
                    @click="viewAdmin(admin)"
                  />
                  <UButton
                    v-role="'superadmin'"
                    :icon="
                      admin.is_active
                        ? 'i-heroicons-no-symbol'
                        : 'i-heroicons-check'
                    "
                    size="sm"
                    :color="admin.is_active ? 'red' : 'green'"
                    variant="ghost"
                    @click="toggleAdminStatus(admin)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4"
      >
        <div class="flex flex-1 justify-between sm:hidden">
          <UButton :disabled="page === 1" @click="page--" label="Précédent" />
          <UButton
            :disabled="page === totalPages"
            @click="page++"
            label="Suivant"
          />
        </div>
        <div
          class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm text-gray-700">
              Affichage de
              <span class="font-medium">{{ (page - 1) * pageSize + 1 }}</span>
              à
              <span class="font-medium">{{
                Math.min(page * pageSize, totalAdmins)
              }}</span>
              sur
              <span class="font-medium">{{ totalAdmins }}</span>
              résultats
            </p>
          </div>
          <div>
            <UPagination
              v-model="page"
              :page-count="pageSize"
              :total="totalAdmins"
            />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
