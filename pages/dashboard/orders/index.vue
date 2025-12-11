<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Liste des commandes',
  layout: 'dashboard',
})

const orderStore = useOrderStore()
const authStore = useAuthStore()

const { orders, loading, paginationInfo } = storeToRefs(orderStore)

// Vérifier si l'utilisateur est un vendeur
const isSellerUser = computed(() => authStore.connected_user?.role === 'seller')

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
  status: '',
  user_id: '',
  date_from: '',
  date_to: '',
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

// Fonction pour charger les commandes avec pagination
async function loadOrders() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value,
    status: filters.value.status || undefined,
    date_from: filters.value.date_from || undefined,
    date_to: filters.value.date_to || undefined,
  }

  await orderStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  await loadOrders()
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadOrders()
}

// Changement de taille de page
function onPageSizeChange(event: any) {
  const newSize = typeof event === 'number' ? event : Number(event)
  pageSize.value = newSize
  currentPage.value = 1
  loadOrders()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadOrders()
})

watch(
  () => [filters.value.status, filters.value.date_from, filters.value.date_to],
  () => {
    currentPage.value = 1
    loadOrders()
  },
)

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    status: '',
    user_id: '',
    date_from: '',
    date_to: '',
  }
}

// Options pour les filtres
const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'received', label: 'Réceptionnée' },
  { value: 'cancelled', label: 'Annulée' },
]

function getStatusColor(status: string) {
  const colors = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'purple',
    delivered: 'green',
    received: 'emerald',
    cancelled: 'red',
  }
  return colors[status as keyof typeof colors] || 'gray'
}

function getStatusLabel(status: string) {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    received: 'Réceptionnée',
    cancelled: 'Annulée',
  }
  return labels[status as keyof typeof labels] || status
}

function truncateId(id: string) {
  return id.substring(0, 8) + '...'
}

function getPaymentMethodLabel(method: string) {
  const labels = {
    mobile_money: 'Mobile Money',
    cash: 'Paiement à la livraison',
    card: 'Carte bancaire',
    bank_transfer: 'Virement bancaire',
  }
  return labels[method as keyof typeof labels] || method
}

// Calculer le total des commandes
const totalOrdersValue = computed(() => {
  return orders.value.reduce((total, order) => {
    if (isSellerUser.value && order.seller_total !== undefined) {
      return total + order.seller_total
    }
    return total + (order.total_amount || 0)
  }, 0)
})

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => value && value !== '').length
})

// Colonnes du tableau
const orderColumns = [
  { key: 'id', label: 'N° Commande' },
  { key: 'buyer', label: 'Acheteur' },
  { key: 'status', label: 'Statut' },
  { key: 'total_amount', label: 'Montant' },
  { key: 'order_items', label: 'Articles' },
  { key: 'delivery_address', label: 'Livraison' },
  { key: 'payment_method', label: 'Paiement' },
  { key: 'created_at', label: 'Date' },
  { key: 'actions', label: 'Actions' },
]
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div>
            <h5 class="table-title">
              Liste des commandes
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ paginationInfo.total }} commandes)
              </span>
            </h5>
            <div class="flex gap-6 text-sm text-gray-600 mt-2">
              <span>Total: {{ formatPrice(totalOrdersValue) }}</span>
              <span
                v-if="activeFiltersCount > 0"
                class="text-blue-600"
              >
                {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }} actif{{
                  activeFiltersCount > 1 ? 's' : ''
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Filtres -->
        <div class="flex flex-col sm:flex-row gap-4 py-4 border-y">
          <div class="flex-1">
            <UInput
              v-model="filters.search"
              placeholder="Rechercher par N° commande ou nom de l'acheteur..."
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

            <UInput
              v-model="filters.date_from"
              type="date"
              placeholder="Date début"
              class="min-w-[140px]"
            />

            <UInput
              v-model="filters.date_to"
              type="date"
              placeholder="Date fin"
              class="min-w-[140px]"
            />

            <!-- Bouton pour réinitialiser les filtres -->
            <UButton
              v-if="filters.status || filters.date_from || filters.date_to"
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
          :columns="orderColumns"
          :rows="orders"
        >
          <!-- N° Commande -->
          <template #id-data="{ row }">
            <div>
              <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {{ truncateId(row.id) }}
              </code>
            </div>
          </template>

          <!-- Acheteur -->
          <template #buyer-data="{ row }">
            <div
              v-if="row.buyer"
              class="flex items-center gap-3"
            >
              <UAvatar
                :src="row.buyer.avatar_url"
                :alt="`${row.buyer.first_name} ${row.buyer.last_name}`"
                size="sm"
              />
              <div>
                <p class="font-medium text-gray-900">
                  {{ row.buyer.first_name }} {{ row.buyer.last_name }}
                </p>
                <p
                  v-if="row.buyer.phone"
                  class="text-sm text-gray-500"
                >
                  {{ row.buyer.phone }}
                </p>
              </div>
            </div>
            <span
              v-else
              class="text-gray-400"
            >Acheteur supprimé</span>
          </template>

          <!-- Statut -->
          <template #status-data="{ row }">
            <UBadge
              :color="getStatusColor(row.status)"
              variant="subtle"
            >
              {{ getStatusLabel(row.status) }}
            </UBadge>
          </template>

          <!-- Montant total -->
          <template #total_amount-data="{ row }">
            <div>
              <span class="font-medium text-gray-900">
                {{
                  formatPrice(
                    isSellerUser && row.seller_total !== undefined
                      ? row.seller_total
                      : row.total_amount,
                  )
                }}
              </span>
              <!-- Afficher un indicateur si c'est le montant partiel du vendeur -->
              <div
                v-if="
                  isSellerUser
                    && row.seller_total !== undefined
                    && row.seller_total < row.total_amount
                "
                class="text-xs text-gray-500 mt-1"
              >
                sur {{ formatPrice(row.total_amount) }}
              </div>
            </div>
          </template>

          <!-- Articles -->
          <template #order_items-data="{ row }">
            <div>
              <span class="text-sm font-medium"> {{ row.order_items?.length || 0 }} articles </span>
              <div
                v-if="row.order_items?.length"
                class="text-xs text-gray-500 mt-1"
              >
                <span
                  v-for="(item, index) in row.order_items.slice(0, 2)"
                  :key="item.id"
                >
                  {{ item.product?.title || 'Produit supprimé' }}
                  <span v-if="index < Math.min(row.order_items.length, 2) - 1">, </span>
                </span>
                <span
                  v-if="row.order_items.length > 2"
                  class="text-gray-400"
                >
                  +{{ row.order_items.length - 2 }} autres...
                </span>
              </div>
            </div>
          </template>

          <!-- Adresse de livraison -->
          <template #delivery_address-data="{ row }">
            <div class="text-sm">
              <div class="font-medium">
                {{ row.delivery_name }}
              </div>
              <div class="text-gray-500">
                {{ row.delivery_address }}, {{ row.delivery_city }}
              </div>
              <div
                v-if="row.delivery_phone"
                class="text-xs text-gray-400"
              >
                {{ row.delivery_phone }}
              </div>
            </div>
          </template>

          <!-- Méthode de paiement -->
          <template #payment_method-data="{ row }">
            <div class="text-sm">
              <div class="font-medium">
                {{ getPaymentMethodLabel(row.payment_method) }}
              </div>
              <div
                v-if="row.shipping_cost"
                class="text-gray-500"
              >
                Livraison: {{ formatPrice(row.shipping_cost) }}
              </div>
            </div>
          </template>

          <!-- Date de création -->
          <template #created_at-data="{ row }">
            <div class="text-sm">
              <div class="font-medium">
                {{ new Date(row.created_at).toLocaleDateString('fr-FR') }}
              </div>
              <div class="text-gray-500">
                {{
                  new Date(row.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}
              </div>
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
                @click="navigateTo(`/dashboard/orders/${row.id}`)"
              />

              <UButton
                v-if="row.status === 'pending'"
                icon="i-heroicons-check"
                size="sm"
                color="green"
                variant="ghost"
                title="Confirmer"
                @click="
                  () => {
                    /* Confirmer la commande */
                  }
                "
              />

              <UButton
                v-if="['pending', 'confirmed'].includes(row.status)"
                icon="i-heroicons-x-mark"
                size="sm"
                color="red"
                variant="ghost"
                title="Annuler"
                @click="
                  () => {
                    /* Annuler la commande */
                  }
                "
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
              commandes
            </template>
            <template v-else>
              Aucune commande trouvée
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
