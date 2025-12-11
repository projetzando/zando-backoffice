<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Paiements',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'],
})

const paymentStore = usePaymentStore()
const toast = useToast()

const { payments, loading, paginationInfo } = storeToRefs(paymentStore)

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
  status: '',
  method: '',
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

// Fonction pour charger les paiements avec pagination
async function loadPayments() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value || undefined,
    status: filters.value.status || undefined,
    method: filters.value.method || undefined,
  }

  await paymentStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  await loadPayments()
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadPayments()
}

// Changement de taille de page
function onPageSizeChange(event: any) {
  const newSize = typeof event === 'number' ? event : Number(event)
  pageSize.value = newSize
  currentPage.value = 1
  loadPayments()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadPayments()
})

watch(
  () => [filters.value.status, filters.value.method],
  () => {
    currentPage.value = 1
    loadPayments()
  },
)

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    status: '',
    method: '',
  }
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'unpaid', label: 'Non payé' },
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Complété' },
  { value: 'failed', label: 'Échoué' },
]

const methodOptions = [
  { value: '', label: 'Toutes les méthodes' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cash', label: 'Paiement à la livraison' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
]

async function updatePaymentStatus(payment: Payment, newStatus: Payment['status']) {
  const result = await paymentStore.updateStatus(payment.id!, newStatus)

  if (result.success) {
    const statusMessages = {
      unpaid: 'marqué comme non payé',
      pending: 'mis en attente',
      completed: 'validé',
      failed: 'marqué comme échoué',
    }
    toast.add({
      title: 'Succès',
      description: `Paiement ${statusMessages[newStatus as keyof typeof statusMessages] || 'mis à jour'}`,
      color: 'green',
    })
    await loadPayments()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deletePayment(payment: Payment) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return

  const result = await paymentStore.destroy(payment.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Paiement supprimé avec succès',
      color: 'green',
    })
    await loadPayments()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Impossible de supprimer',
      color: 'red',
    })
  }
}

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => value && value !== '').length
})

function getStatusColor(status?: string) {
  switch (status) {
    case 'unpaid':
      return 'orange'
    case 'pending':
      return 'yellow'
    case 'completed':
      return 'green'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

function getStatusLabel(status?: string) {
  switch (status) {
    case 'unpaid':
      return 'Non payé'
    case 'pending':
      return 'En attente'
    case 'completed':
      return 'Complété'
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
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div>
            <h5 class="table-title">
              Liste des paiements
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ paginationInfo.total }} paiements)
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

            <USelect
              v-model="filters.method"
              :options="methodOptions"
              placeholder="Méthode"
              class="min-w-[140px]"
            />

            <!-- Bouton pour réinitialiser les filtres -->
            <UButton
              v-if="filters.status || filters.method"
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
          :rows="payments"
          :columns="[
            { key: 'order_ref', label: 'Commande' },
            { key: 'buyer', label: 'Acheteur' },
            { key: 'amount', label: 'Montant' },
            { key: 'method', label: 'Méthode' },
            { key: 'transaction_ref', label: 'Référence transaction' },
            { key: 'safe_reference', label: 'Référence sécurisée' },
            { key: 'status', label: 'Statut' },
            { key: 'created_at', label: 'Date' },
            { key: 'actions', label: 'Actions' },
          ]"
        >
      <template #order_ref-data="{ row }">
        <div>
          <p class="font-medium font-mono text-sm">
            {{ row.order?.id?.substring(0, 8) }}...
          </p>
        </div>
      </template>

      <template #buyer-data="{ row }">
        <div v-if="row.order?.user_id">
          <p class="font-mono text-sm">
            {{ row.order.user_id.substring(0, 8) }}...
          </p>
        </div>
        <span
          v-else
          class="text-gray-400"
        >-</span>
      </template>

      <template #amount-data="{ row }">
        <span class="font-medium">{{ formatAmount(row.amount) }}</span>
      </template>

      <template #method-data="{ row }">
        <UBadge
          color="blue"
          variant="subtle"
        >
          {{ row.method }}
        </UBadge>
      </template>

      <template #transaction_ref-data="{ row }">
        <span
          v-if="row.transaction_ref"
          class="font-mono text-sm"
        >{{ row.transaction_ref }}</span>
        <span
          v-else
          class="text-gray-400"
        >-</span>
      </template>

      <template #safe_reference-data="{ row }">
        <span
          v-if="row.safe_reference"
          class="font-mono text-sm"
        >{{ row.safe_reference }}</span>
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

      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UTooltip
            v-if="row.status === 'unpaid' || row.status === 'pending'"
            text="Valider le paiement"
          >
            <UButton
              icon="i-heroicons-check-circle"
              size="sm"
              color="green"
              variant="ghost"
              @click="updatePaymentStatus(row, 'completed')"
            />
          </UTooltip>
          <UTooltip
            v-if="row.status === 'unpaid' || row.status === 'pending'"
            text="Marquer comme échoué"
          >
            <UButton
              icon="i-heroicons-x-circle"
              size="sm"
              color="red"
              variant="ghost"
              @click="updatePaymentStatus(row, 'failed')"
            />
          </UTooltip>
          <UTooltip
            v-if="row.status === 'completed' || row.status === 'failed'"
            text="Remettre en attente"
          >
            <UButton
              icon="i-heroicons-arrow-path"
              size="sm"
              color="yellow"
              variant="ghost"
              @click="updatePaymentStatus(row, 'pending')"
            />
          </UTooltip>
          <UTooltip text="Supprimer le paiement">
            <UButton
              icon="i-heroicons-trash"
              size="sm"
              color="red"
              variant="ghost"
              @click="deletePayment(row)"
            />
          </UTooltip>
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
              paiements
            </template>
            <template v-else>
              Aucun paiement trouvé
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
