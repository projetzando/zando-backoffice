<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Liste des administrateurs',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'],
})

const adminStore = useAdminStore()
const authStore = useAuthStore()
const toast = useToast()

const { admins, loading, paginationInfo } = storeToRefs(adminStore)

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
  role: 'all',
  is_active: undefined as boolean | undefined,
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

// Fonction pour charger les admins avec pagination
async function loadAdmins() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value || undefined,
    role: filters.value.role !== 'all' ? filters.value.role : undefined,
    is_active: filters.value.is_active,
  }

  await adminStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  await loadAdmins()
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadAdmins()
}

// Changement de taille de page
function onPageSizeChange(event: any) {
  const newSize = typeof event === 'number' ? event : Number(event)
  pageSize.value = newSize
  currentPage.value = 1
  loadAdmins()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadAdmins()
})

watch(
  () => [filters.value.role, filters.value.is_active],
  () => {
    currentPage.value = 1
    loadAdmins()
  },
)

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    role: 'all',
    is_active: undefined,
  }
}

// Actions
function viewAdmin(admin: any) {
  navigateTo(`/dashboard/accounts/admins/${admin.id}`)
}

async function toggleAdminStatus(admin: Admin) {
  if (admin.id === authStore.connected_user?.id) {
    toast.add({
      title: 'Action interdite',
      description: 'Vous ne pouvez pas désactiver votre propre compte.',
      color: 'red',
    })
    return
  }

  const result = await adminStore.toggleStatus(admin.id!)

  if (result.success) {
    toast.add({
      title: 'Statut mis à jour',
      description: `L'administrateur a été ${admin.is_active ? 'désactivé' : 'activé'}.`,
      color: 'green',
    })
    await loadAdmins()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de mettre à jour le statut.',
      color: 'red',
    })
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getInitials(admin: any) {
  const first = admin.first_name?.charAt(0) || ''
  const last = admin.last_name?.charAt(0) || ''
  return (first + last).toUpperCase()
}

function getRoleBadgeColor(role: string) {
  return role === 'superadmin' ? 'red' : 'blue'
}

function getRoleLabel(role: string) {
  return role === 'superadmin' ? 'Super Admin' : 'Admin'
}

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.role !== 'all') count++
  if (filters.value.is_active !== undefined) count++
  return count
})
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div>
            <h5 class="table-title">
              Liste des administrateurs
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ paginationInfo.total }} administrateurs)
              </span>
            </h5>
            <div
              v-if="activeFiltersCount > 0"
              class="text-sm text-blue-600 mt-2"
            >
              {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }} actif{{
                activeFiltersCount > 1 ? 's' : ''
              }}
            </div>
          </div>
        </div>

        <!-- Filtres -->
        <div class="flex flex-col sm:flex-row gap-4 py-4 border-y">
          <div class="flex-1">
            <UInput
              v-model="filters.search"
              placeholder="Rechercher par nom, email ou téléphone..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>

          <div class="flex gap-2">
            <USelect
              v-model="filters.role"
              :options="[
                { value: 'all', label: 'Tous les rôles' },
                { value: 'admin', label: 'Admin' },
                { value: 'superadmin', label: 'Super Admin' },
              ]"
              class="min-w-[140px]"
            />

            <USelect
              v-model="filters.is_active"
              :options="[
                { value: undefined, label: 'Tous les statuts' },
                { value: true, label: 'Actifs' },
                { value: false, label: 'Inactifs' },
              ]"
              class="min-w-[140px]"
            />

            <UButton
              v-if="activeFiltersCount > 0"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              size="sm"
              title="Réinitialiser les filtres"
              @click="resetFilters"
            />
          </div>

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
        </div>
      </template>

      <template #content>
        <UTable
          :loading="loading"
          :rows="admins"
          :columns="[
            { key: 'avatar', label: '' },
            { key: 'name', label: 'Nom complet' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Téléphone' },
            { key: 'role', label: 'Rôle' },
            { key: 'status', label: 'Statut' },
            { key: 'created_at', label: 'Date de création' },
            { key: 'actions', label: 'Actions' },
          ]"
        >
          <template #avatar-data="{ row }">
            <UAvatar
              :src="row.avatar_url"
              :alt="`${row.first_name} ${row.last_name}`"
              size="sm"
            >
              <template
                v-if="!row.avatar_url"
                #fallback
              >
                <span class="text-sm font-medium">
                  {{ getInitials(row) }}
                </span>
              </template>
            </UAvatar>
          </template>

          <template #name-data="{ row }">
            <div>
              <p class="font-medium text-gray-900">
                {{ row.first_name }} {{ row.last_name }}
              </p>
            </div>
          </template>

          <template #email-data="{ row }">
            <span class="text-sm text-gray-600">{{ row.email }}</span>
          </template>

          <template #phone-data="{ row }">
            <span
              v-if="row.phone"
              class="text-sm text-gray-600"
            >{{ row.phone }}</span>
            <span
              v-else
              class="text-gray-400"
            >-</span>
          </template>

          <template #role-data="{ row }">
            <UBadge
              :color="getRoleBadgeColor(row.role)"
              variant="subtle"
            >
              {{ getRoleLabel(row.role) }}
            </UBadge>
          </template>

          <template #status-data="{ row }">
            <UBadge
              :color="row.is_active ? 'green' : 'red'"
              variant="subtle"
            >
              {{ row.is_active ? 'Actif' : 'Inactif' }}
            </UBadge>
          </template>

          <template #created_at-data="{ row }">
            <div>
              <p class="text-sm">
                {{ row.created_at ? formatDate(row.created_at) : '-' }}
              </p>
            </div>
          </template>

          <template #actions-data="{ row }">
            <div class="flex gap-1">
              <UButton
                icon="i-heroicons-eye"
                size="sm"
                color="primary"
                variant="ghost"
                title="Voir les détails"
                @click="viewAdmin(row)"
              />
              <UButton
                :icon="row.is_active ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                size="sm"
                :color="row.is_active ? 'red' : 'green'"
                variant="ghost"
                :title="row.is_active ? 'Désactiver' : 'Activer'"
                @click="toggleAdminStatus(row)"
              />
            </div>
          </template>
        </UTable>
      </template>

      <template #footer>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
          <div class="text-sm text-gray-700 text-center sm:text-left">
            <template v-if="paginationInfo.total > 0">
              Affichage de
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              à
              <span class="font-medium">{{
                Math.min(currentPage * pageSize, paginationInfo.total)
              }}</span>
              sur
              <span class="font-medium">{{ paginationInfo.total }}</span>
              administrateurs
            </template>
            <template v-else>
              Aucun administrateur trouvé
            </template>
          </div>

          <Pagination
            v-if="totalPages > 0"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="paginationInfo.total"
            :page-size="pageSize"
            :loading="loading"
            @update:current-page="onPageChange"
          />
        </div>
      </template>
    </TableWrapper>
  </div>
</template>
