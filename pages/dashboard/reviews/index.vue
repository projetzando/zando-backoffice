<script setup lang="ts">
import { PAGINATION } from '~/utils/constants/api'

definePageMeta({
  name: 'Liste des avis clients',
  layout: 'dashboard',
})

const reviewStore = useReviewStore()
const productStore = useProductStore()

const { reviews, loading, paginationInfo } = storeToRefs(reviewStore)

// Pagination côté serveur
const currentPage = ref(1)
const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

// Filtres
const filters = ref({
  search: '',
  rating: undefined as number | undefined,
  product_id: '',
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

// Fonction pour charger les reviews avec pagination
async function loadReviews() {
  const paginationOptions = {
    page: currentPage.value,
    pageSize: pageSize.value,
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const filterOptions = {
    search: debouncedSearch.value || undefined,
    rating: filters.value.rating || undefined,
    product_id: filters.value.product_id || undefined,
  }

  await reviewStore.getAll(paginationOptions, filterOptions)
}

// Charger les données au montage
onMounted(async () => {
  await loadReviews()
  await productStore.getAll()
})

// Computed pour le nombre total de pages
const totalPages = computed(() => paginationInfo.value.totalPages)

// Changement de page
function onPageChange(newPage: number) {
  currentPage.value = newPage
  loadReviews()
}

// Changement de taille de page
function onPageSizeChange(event: any) {
  const newSize = typeof event === 'number' ? event : Number(event)
  pageSize.value = newSize
  currentPage.value = 1
  loadReviews()
}

// Watchers pour recharger les données
watch(debouncedSearch, () => {
  currentPage.value = 1
  loadReviews()
})

watch(
  () => [filters.value.rating, filters.value.product_id],
  () => {
    currentPage.value = 1
    loadReviews()
  },
)

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    rating: undefined,
    product_id: '',
  }
}

// Options pour les filtres
const ratingOptions = [
  { value: undefined, label: 'Toutes les notes' },
  { value: 5, label: '5 étoiles' },
  { value: 4, label: '4 étoiles' },
  { value: 3, label: '3 étoiles' },
  { value: 2, label: '2 étoiles' },
  { value: 1, label: '1 étoile' },
]

const productOptions = computed(() => {
  const { products } = storeToRefs(productStore)
  return [
    { value: '', label: 'Tous les produits' },
    ...products.value.map(product => ({
      value: product.id,
      label: product.title,
    })),
  ]
})

// Fonctions utilitaires
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getRatingColor(rating: number) {
  if (rating >= 4) return 'green'
  if (rating >= 3) return 'yellow'
  return 'red'
}

function generateStars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.rating) count++
  if (filters.value.product_id) count++
  return count
})

// Actions
async function deleteReview(review: any) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer cet avis ?`)) {
    const { success } = await reviewStore.remove(review.id!)
    if (success) {
      await loadReviews()
    }
  }
}
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div>
            <h5 class="table-title">
              Avis clients
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ paginationInfo.total }} avis)
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
              placeholder="Rechercher par commentaire..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>

          <div class="flex gap-2">
            <USelect
              v-model="filters.rating"
              :options="ratingOptions"
              placeholder="Note"
              class="min-w-[140px]"
            />

            <USelect
              v-model="filters.product_id"
              :options="productOptions"
              placeholder="Produit"
              class="min-w-[160px]"
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
          :rows="reviews"
          :columns="[
            { key: 'user', label: 'Client' },
            { key: 'product', label: 'Produit' },
            { key: 'rating', label: 'Note' },
            { key: 'comment', label: 'Commentaire' },
            { key: 'created_at', label: 'Date' },
            { key: 'actions', label: 'Actions' },
          ]"
        >
          <!-- Client -->
          <template #user-data="{ row }">
            <div
              v-if="row.user"
              class="flex items-center gap-3"
            >
              <UAvatar
                :src="row.user.avatar_url"
                :alt="`${row.user.first_name} ${row.user.last_name}`"
                size="sm"
              />
              <div>
                <p class="font-medium text-gray-900">
                  {{ row.user.first_name }} {{ row.user.last_name }}
                </p>
              </div>
            </div>
            <span
              v-else
              class="text-gray-400"
            >Client supprimé</span>
          </template>

          <!-- Produit -->
          <template #product-data="{ row }">
            <div v-if="row.product">
              <p class="font-medium text-gray-900">
                {{ row.product.title }}
              </p>
            </div>
            <span
              v-else
              class="text-gray-400"
            >Produit supprimé</span>
          </template>

          <!-- Note -->
          <template #rating-data="{ row }">
            <div class="flex items-center gap-2">
              <UBadge
                :color="getRatingColor(row.rating)"
                variant="subtle"
              >
                {{ row.rating }}/5
              </UBadge>
              <span class="text-yellow-500">{{ generateStars(row.rating) }}</span>
            </div>
          </template>

          <!-- Commentaire -->
          <template #comment-data="{ row }">
            <p
              v-if="row.comment"
              class="text-sm text-gray-600 max-w-md truncate"
            >
              {{ row.comment }}
            </p>
            <span
              v-else
              class="text-gray-400"
            >Aucun commentaire</span>
          </template>

          <!-- Date -->
          <template #created_at-data="{ row }">
            <span class="text-sm text-gray-600">
              {{ formatDate(row.created_at) }}
            </span>
          </template>

          <!-- Actions -->
          <template #actions-data="{ row }">
            <div class="flex gap-1">
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="ghost"
                title="Supprimer"
                @click="deleteReview(row)"
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
              avis
            </template>
            <template v-else>
              Aucun avis trouvé
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
