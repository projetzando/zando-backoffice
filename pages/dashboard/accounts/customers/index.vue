<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Liste des acheteurs',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'],
})

const customerStore = useCustomerStore()

const { customers, loading, paginationInfo } = storeToRefs(customerStore)

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
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

// Fonction pour charger les clients avec pagination
async function loadCustomers() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value || undefined,
  }

  await customerStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  await loadCustomers()
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadCustomers()
}

// Changement de taille de page
function onPageSizeChange(event: any) {
  const newSize = typeof event === 'number' ? event : Number(event)
  pageSize.value = newSize
  currentPage.value = 1
  loadCustomers()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadCustomers()
})

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
  }
}

function getInitials(customer: any) {
  const first = customer.first_name?.charAt(0) || ''
  const last = customer.last_name?.charAt(0) || ''
  return (first + last).toUpperCase()
}

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => value && value !== '').length
})
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div>
            <h5 class="table-title">
              Liste des clients
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ paginationInfo.total }} clients)
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
              placeholder="Rechercher par nom ou téléphone..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>

          <div class="flex gap-2">
            <!-- Bouton pour réinitialiser les filtres -->
            <UButton
              v-if="filters.search"
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
          :rows="customers"
          :columns="[
            { key: 'avatar', label: '' },
            { key: 'name', label: 'Nom complet' },
            { key: 'phone', label: 'Téléphone' },
            { key: 'role', label: 'Rôle' },
            { key: 'created_at', label: 'Date d\'inscription' },
            { key: 'actions', label: 'Actions' },
          ]"
        >
          <!-- Avatar -->
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

          <!-- Nom complet -->
          <template #name-data="{ row }">
            <div>
              <p class="font-medium text-gray-900">
                {{ row.first_name }} {{ row.last_name }}
              </p>
            </div>
          </template>

          <!-- Téléphone -->
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

          <!-- Rôle -->
          <template #role-data="{ row }">
            <UBadge
              color="blue"
              variant="subtle"
            >
              {{ row.role || 'buyer' }}
            </UBadge>
          </template>

          <!-- Date de création -->
          <template #created_at-data="{ row }">
            <div>
              <p class="text-sm">
                {{ row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '-' }}
              </p>
              <p class="text-xs text-gray-500">
                {{ row.created_at ? new Date(row.created_at).toLocaleTimeString('fr-FR') : '' }}
              </p>
            </div>
          </template>

          <!-- Actions -->
          <template #actions-data="{ row }">
            <div class="flex gap-1">
              <UButton
                icon="i-heroicons-eye"
                size="sm"
                color="primary"
                variant="ghost"
                title="Voir les détails"
                @click="navigateTo(`/dashboard/accounts/customers/${row.id}`)"
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
              clients
            </template>
            <template v-else>
              Aucun client trouvé
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
      </template>
    </TableWrapper>
  </div>
</template>
