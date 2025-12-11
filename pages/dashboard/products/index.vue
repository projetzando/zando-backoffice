<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Liste des produits',
  layout: 'dashboard',
})

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const sellerStore = useSellerStore()
const authStore = useAuthStore()
const supabase = useSupabaseClient()

const { products, loading, paginationInfo } = storeToRefs(productStore)

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
  is_active: '',
  seller_id: '',
  category_id: '',
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

// Récupérer le seller_id si l'utilisateur est un vendeur
const currentSellerId = ref<string | null>(null)
const isSellerUser = computed(() => authStore.connected_user?.role === 'seller')

// Fonction pour charger les produits avec pagination
async function loadProducts() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value,
    is_active: filters.value.is_active ? filters.value.is_active === 'true' : undefined,
    seller_id: filters.value.seller_id || undefined,
    category_id: filters.value.category_id || undefined,
  }

  await productStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  // Si l'utilisateur est un vendeur, récupérer son seller_id
  if (isSellerUser.value) {
    const { data: sellerData } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', authStore.connected_user.id)
      .single()

    if (sellerData) {
      currentSellerId.value = sellerData.id
      filters.value.seller_id = sellerData.id
    }
  }

  await Promise.all([loadProducts(), categoryStore.get(), sellerStore.get()])
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Options pour les filtres
const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'true', label: 'Actif' },
  { value: 'false', label: 'Inactif' },
]

// Computed pour les options de vendeurs et catégories
const sellerOptions = computed(() => [
  { value: '', label: 'Tous les vendeurs' },
  ...sellerStore.sellers.map(seller => ({
    value: seller.id,
    label: seller.company_name,
  })),
])

const categoryOptions = computed(() => [
  { value: '', label: 'Toutes les catégories' },
  ...categoryStore.categories.map(category => ({
    value: category.id,
    label: category.name,
  })),
])

// Fonction pour obtenir la couleur du statut
function getStatusColor(isActive: boolean) {
  return isActive ? 'green' : 'red'
}

// Fonction pour obtenir le label du statut
function getStatusLabel(isActive: boolean) {
  return isActive ? 'Actif' : 'Inactif'
}

// Fonction pour obtenir la couleur du type
function getTypeColor(type: string) {
  return type === 'variable' ? 'purple' : 'blue'
}

// Fonction pour obtenir le label du type
function getTypeLabel(type: string) {
  return type === 'variable' ? 'Variable' : 'Simple'
}

// Actions sur les produits
async function deleteProduct(product: Product) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.title}" ?`)) {
    const { success } = await productStore.remove(product.id!)
    if (success) {
      await loadProducts()
    }
  }
}

async function toggleProductStatus(product: Product) {
  const newStatus = !product.is_active
  await productStore.update(product.id!, { is_active: newStatus })
  await loadProducts()
}

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadProducts()
}

// Changement de taille de page
function onPageSizeChange(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
  loadProducts()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadProducts()
})

watch(
  () => [filters.value.is_active, filters.value.seller_id, filters.value.category_id],
  () => {
    currentPage.value = 1
    loadProducts()
  },
)
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <h5 class="table-title">
            Liste des produits
            <span class="text-sm font-normal text-gray-500 ml-2">
              ({{ paginationInfo.total }} produits)
            </span>
          </h5>

          <!-- <ButtonCreate @new="() => navigateTo(`/dashboard/products/create`)" /> -->
        </div>

        <!-- Filtres -->
        <div class="flex flex-col sm:flex-row gap-4 py-4 border-y">
          <div class="flex-1">
            <UInput
              v-model="filters.search"
              placeholder="Rechercher par titre, description..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>

          <div class="flex gap-2">
            <USelect
              v-model="filters.is_active"
              :options="statusOptions"
              placeholder="Statut"
            />

            <USelect
              v-if="!isSellerUser"
              v-model="filters.seller_id"
              :options="sellerOptions"
              placeholder="Vendeur"
            />

            <USelect
              v-model="filters.category_id"
              :options="categoryOptions"
              placeholder="Catégorie"
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
          :columns="productColumns"
          :rows="products"
        >
          <!-- Image du produit -->
          <template #cover_image-data="{ row }">
            <UAvatar
              :src="row.cover_image || row.images?.[0]"
              :alt="row.title"
              size="md"
            />
          </template>

          <!-- Titre -->
          <template #title-data="{ row }">
            <div>
              <p class="font-medium text-gray-900">
                {{ row.title }}
              </p>
              <p class="text-sm text-gray-500 truncate max-w-xs">
                {{ row.description }}
              </p>
            </div>
          </template>

          <!-- Type de produit -->
          <template #product_type-data="{ row }">
            <UBadge
              :color="getTypeColor(row.product_type || 'simple')"
              variant="subtle"
            >
              {{ getTypeLabel(row.product_type || 'simple') }}
            </UBadge>
          </template>

          <!-- Prix (utilise display_price de la vue) -->
          <template #price-data="{ row }">
            <div>
              <span class="font-medium">{{ formatPrice(row.display_price) }}</span>
              <div
                v-if="row.sale_price && row.price !== row.sale_price"
                class="text-xs text-gray-500 line-through"
              >
                {{ formatPrice(row.price) }}
              </div>
            </div>
          </template>

          <!-- Stock (utilise available_stock de la vue) -->
          <template #stock-data="{ row }">
            <div>
              <UBadge
                :color="row.available_stock > 0 ? 'green' : 'red'"
                variant="subtle"
              >
                {{ row.available_stock || 0 }}
              </UBadge>
              <div
                v-if="row.review_count > 0"
                class="text-xs text-gray-500 mt-1"
              >
                {{ row.review_count }} avis ({{ row.avg_rating }}/5)
              </div>
            </div>
          </template>

          <!-- Statut -->
          <template #is_active-data="{ row }">
            <UBadge
              :color="getStatusColor(row.is_active ?? true)"
              variant="subtle"
            >
              {{ getStatusLabel(row.is_active ?? true) }}
            </UBadge>
          </template>

          <!-- Vendeur -->
          <template #seller-data="{ row }">
            <span v-if="row.seller">{{ row.seller.company_name }}</span>
            <span
              v-else
              class="text-gray-400"
            >-</span>
          </template>

          <!-- Catégorie -->
          <template #category-data="{ row }">
            <span v-if="row.category">{{ row.category.name }}</span>
            <span
              v-else
              class="text-gray-400"
            >-</span>
          </template>

          <!-- Date de création -->
          <template #created_at-data="{ row }">
            <span class="text-sm">
              {{ new Date(row.created_at).toLocaleDateString('fr-FR') }}
            </span>
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
                @click="navigateTo(`/dashboard/products/show-${row.id}`)"
              />

              <!-- <UButton
                @click="navigateTo(`/dashboard/products/edit-${row.id}`)"
                icon="i-heroicons-pencil-square"
                size="sm"
                color="orange"
                variant="ghost"
                title="Modifier"
              /> -->

              <UButton
                :icon="row.is_active ? 'i-heroicons-pause' : 'i-heroicons-play'"
                size="sm"
                :color="row.is_active ? 'orange' : 'green'"
                variant="ghost"
                :title="row.is_active ? 'Désactiver' : 'Activer'"
                @click="toggleProductStatus(row)"
              />

              <!-- <UButton
                @click="deleteProduct(row)"
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="ghost"
                title="Supprimer"
              /> -->
            </div>
          </template>
        </UTable>
      </template>

      <template #footer>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
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
              produits
            </template>
            <template v-else>
              Aucun produit trouvé
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
