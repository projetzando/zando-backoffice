<script setup lang="ts">
definePageMeta({
  name: 'Liste des avis clients',
  layout: 'dashboard',
})

const reviewStore = useReviewStore()
const productStore = useProductStore()

// Charger les données
onMounted(async () => {
  await Promise.all([reviewStore.getAll(), productStore.getAll()])
})

const { reviews, loading } = storeToRefs(reviewStore)
const { products } = storeToRefs(productStore)

// Filtres
const filters = ref({
  search: '',
  rating: '',
  product_id: '',
})

// Table configuration
const { q, page, pageCount, oneItem, isOpen, rows, totalFilteredRows, confirmDeleteItem }
  = useTable(reviews, {
    searchFields: ['comment', 'user.first_name', 'user.last_name', 'product.title'],
    filtersConfig: {
      rating: (item, value) => !value || item.rating === parseInt(value),
      product_id: (item, value) => !value || item.product_id === value,
    },
    filters,
  })

// Options pour les filtres
const ratingOptions = [
  { value: '', label: 'Toutes les notes' },
  { value: '5', label: '5 étoiles' },
  { value: '4', label: '4 étoiles' },
  { value: '3', label: '3 étoiles' },
  { value: '2', label: '2 étoiles' },
  { value: '1', label: '1 étoile' },
]

const productOptions = computed(() => [
  { value: '', label: 'Tous les produits' },
  ...products.value.map(product => ({
    value: product.id,
    label: product.title,
  })),
])

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
  return Object.values(filters.value).filter(value => value && value !== '').length
})

// Actions
async function deleteReview(review: any) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer cet avis ?`)) {
    const { success } = await reviewStore.remove(review.id!)
    if (success) {
      console.log('Avis supprimé avec succès')
    }
  }
}

// Appliquer les filtres dynamiquement
watch(
  filters,
  async (newFilters) => {
    // await reviewStore.getAll(newFilters);
  },
  { deep: true },
)
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div>
            <h5 class="table-title">
              Avis clients
            </h5>
            <div class="flex gap-6 text-sm text-gray-600 mt-2">
              <span>{{ totalFilteredRows }} avis</span>
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
              v-model="q"
              placeholder="Rechercher par commentaire, client ou produit..."
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

            <!-- Bouton pour réinitialiser les filtres -->
            <UButton
              v-if="filters.rating || filters.product_id"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              size="sm"
              title="Réinitialiser les filtres"
              @click="filters = { search: '', rating: '', product_id: '' }"
            />
          </div>

          <TableElementByPage v-model="pageCount" />
        </div>
      </template>

      <template #content>
        <UTable
          :loading="loading"
          :columns="[
            { key: 'user', label: 'Client' },
            { key: 'product', label: 'Produit' },
            { key: 'rating', label: 'Note' },
            { key: 'comment', label: 'Commentaire' },
            { key: 'created_at', label: 'Date' },
            { key: 'actions', label: 'Actions' },
          ]"
          :rows="rows"
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
            <div
              v-if="row.product"
              class="flex items-center gap-3"
            >
              <img
                v-if="row.product.cover_image"
                :src="row.product.cover_image"
                :alt="row.product.title"
                class="w-10 h-10 object-cover rounded"
              >
              <div
                v-else
                class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-photo"
                  class="w-4 h-4 text-gray-400"
                />
              </div>
              <div>
                <p class="font-medium text-gray-900 truncate max-w-xs">
                  {{ row.product.title }}
                </p>
              </div>
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
            <div class="max-w-xs">
              <p
                v-if="row.comment"
                class="text-sm text-gray-900"
              >
                {{ row.comment.length > 100 ? row.comment.substring(0, 100) + '...' : row.comment }}
              </p>
              <span
                v-else
                class="text-gray-400 text-sm"
              >Aucun commentaire</span>

              <!-- Images de l'avis -->
              <div
                v-if="row.images?.length"
                class="flex gap-1 mt-2"
              >
                <img
                  v-for="(image, index) in row.images.slice(0, 3)"
                  :key="index"
                  :src="image"
                  :alt="`Image ${index + 1}`"
                  class="w-8 h-8 object-cover rounded"
                >
                <span
                  v-if="row.images.length > 3"
                  class="text-xs text-gray-500 self-center"
                >
                  +{{ row.images.length - 3 }}
                </span>
              </div>
            </div>
          </template>

          <!-- Date -->
          <template #created_at-data="{ row }">
            <span class="text-sm text-gray-500">
              {{ formatDate(row.created_at) }}
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
                title="Voir le produit"
                @click="navigateTo(`/dashboard/products/show-${row.product_id}`)"
              />

              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="ghost"
                title="Supprimer l'avis"
                @click="deleteReview(row)"
              />
            </div>
          </template>
        </UTable>
      </template>

      <template #footer>
        <TablePaginationInfo
          :page="page"
          :page-count="pageCount"
          :length="totalFilteredRows"
          title="avis"
        />

        <UPagination
          v-if="totalFilteredRows > 0"
          v-model="page"
          show-first
          show-last
          :page-count="pageCount"
          :total="totalFilteredRows"
        />
      </template>
    </TableWrapper>
  </div>
</template>
