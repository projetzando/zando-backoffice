<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Demandes de retrait',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'], // Gestion des retraits réservée aux admins
})

const payoutStore = usePayoutStore()
const toast = useToast()

const { payouts, loading, paginationInfo } = storeToRefs(payoutStore)

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
  status: '',
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

// Fonction pour charger les payouts avec pagination
async function loadPayouts() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'requested_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value || undefined,
    status: filters.value.status || undefined,
  }

  await payoutStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  await loadPayouts()
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadPayouts()
}

// Changement de taille de page
function onPageSizeChange(event: any) {
  const newSize = typeof event === 'number' ? event : Number(event)
  pageSize.value = newSize
  currentPage.value = 1
  loadPayouts()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadPayouts()
})

watch(
  () => filters.value.status,
  () => {
    currentPage.value = 1
    loadPayouts()
  },
)

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    status: '',
  }
}

const statusOptions = [
  { label: 'Tous les statuts', value: '' },
  { label: 'En attente', value: 'pending' },
  { label: 'Approuvé', value: 'approved' },
  { label: 'Rejeté', value: 'rejected' },
  { label: 'Effectué', value: 'done' },
  { label: 'Échoué', value: 'failed' },
]

async function updatePayoutStatus(payout: Payout, newStatus: Payout['status']) {
  const result = await payoutStore.updateStatus(payout.id!, newStatus)

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: `Retrait ${newStatus === 'approved' ? 'approuvé' : newStatus === 'done' ? 'effectué' : newStatus === 'rejected' ? 'rejeté' : 'mis à jour'}`,
      color: 'green',
    })
    await loadPayouts()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deletePayout(payout: Payout) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande de retrait ?')) return

  const result = await payoutStore.destroy(payout.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Demande de retrait supprimée avec succès',
      color: 'green',
    })
    await loadPayouts()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Impossible de supprimer',
      color: 'red',
    })
  }
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'pending':
      return 'yellow'
    case 'approved':
      return 'blue'
    case 'done':
      return 'green'
    case 'rejected':
      return 'red'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

function getStatusLabel(status?: string) {
  switch (status) {
    case 'pending':
      return 'En attente'
    case 'approved':
      return 'Approuvé'
    case 'done':
      return 'Effectué'
    case 'rejected':
      return 'Rejeté'
    case 'failed':
      return 'Échoué'
    default:
      return status
  }
}

function formatAmount(amount?: number) {
  if (!amount) return '0 XAF'
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + ' XAF'
  )
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
              Demandes de retrait
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ paginationInfo.total }} demandes)
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
              placeholder="Rechercher par référence..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>

          <div class="flex gap-2">
            <USelect
              v-model="filters.status"
              :options="statusOptions"
              placeholder="Statut"
              class="min-w-[140px]"
            />

            <!-- Bouton pour réinitialiser les filtres -->
            <UButton
              v-if="filters.status || filters.search"
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
          :rows="payouts"
          :columns="[
            { key: 'wallet_info', label: 'Portefeuille' },
            { key: 'amount', label: 'Montant' },
            { key: 'fee', label: 'Frais' },
            { key: 'net_amount', label: 'Net à payer' },
            { key: 'payout_method', label: 'Méthode' },
            { key: 'reference', label: 'Référence' },
            { key: 'status', label: 'Statut' },
            { key: 'requested_at', label: 'Demandé le' },
            { key: 'actions', label: 'Actions' },
          ]"
        >
          <template #wallet_info-data="{ row }">
            <div>
              <p class="font-medium">
                {{ row.wallet?.owner_type }}
              </p>
              <p class="text-xs text-gray-500 font-mono">
                {{ row.wallet?.owner_id?.substring(0, 8) }}...
              </p>
              <p class="text-xs text-gray-500">
                Balance: {{ formatAmount(row.wallet?.balance) }}
              </p>
            </div>
          </template>

          <template #amount-data="{ row }">
            <span class="font-medium">{{ formatAmount(row.amount) }}</span>
          </template>

          <template #fee-data="{ row }">
            <span class="text-red-600">{{ formatAmount(row.fee) }}</span>
          </template>

          <template #net_amount-data="{ row }">
            <span class="font-bold text-green-600">
              {{ formatAmount((row.amount || 0) - (row.fee || 0)) }}
            </span>
          </template>

          <template #payout_method-data="{ row }">
            <span v-if="row.payout_method">{{ row.payout_method }}</span>
            <span
              v-else
              class="text-gray-400"
            >-</span>
          </template>

          <template #reference-data="{ row }">
            <span
              v-if="row.reference"
              class="font-mono text-sm"
            >{{ row.reference }}</span>
            <span
              v-else
              class="text-gray-400"
            >-</span>
          </template>

          <template #status-data="{ row }">
            <UBadge
              :color="getStatusColor(row.status)"
              variant="subtle"
            >
              {{ getStatusLabel(row.status) }}
            </UBadge>
          </template>

          <template #requested_at-data="{ row }">
            <div>
              <p class="text-sm">
                {{ new Date(row.requested_at!).toLocaleDateString('fr-FR') }}
              </p>
              <p class="text-xs text-gray-500">
                {{ new Date(row.requested_at!).toLocaleTimeString('fr-FR') }}
              </p>
            </div>
          </template>

          <template #actions-data="{ row }">
            <div class="flex gap-2">
              <UButton
                v-if="row.status === 'pending'"
                icon="i-heroicons-check"
                size="sm"
                color="blue"
                variant="ghost"
                title="Approuver"
                @click="updatePayoutStatus(row, 'approved')"
              />
              <UButton
                v-if="row.status === 'approved'"
                icon="i-heroicons-check-circle"
                size="sm"
                color="green"
                variant="ghost"
                title="Marquer comme effectué"
                @click="updatePayoutStatus(row, 'done')"
              />
              <UButton
                v-if="row.status === 'pending' || row.status === 'approved'"
                icon="i-heroicons-x-mark"
                size="sm"
                color="red"
                variant="ghost"
                title="Rejeter"
                @click="updatePayoutStatus(row, 'rejected')"
              />
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="ghost"
                title="Supprimer"
                @click="deletePayout(row)"
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
              demandes
            </template>
            <template v-else>
              Aucune demande trouvée
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
