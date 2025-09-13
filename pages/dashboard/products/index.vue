<script setup lang="ts">
definePageMeta({
  name: "Liste des produits",
  layout: "dashboard",
});

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const sellerStore = useSellerStore();

// Charger les données
onMounted(async () => {
  await Promise.all([
    productStore.getAll(),
    categoryStore.get(),
    sellerStore.get(),
  ]);
});

const { products, loading } = storeToRefs(productStore);

// Filtres
const filters = ref({
  search: "",
  is_active: "",
  seller_id: "",
  category_id: "",
});

// Table configuration
const {
  q,
  page,
  pageCount,
  oneItem,
  isOpen,
  rows,
  totalFilteredRows,
  confirmDeleteItem,
} = useTable(products, {
  searchFields: ["title", "description"],
  filtersConfig: {
    is_active: (item, value) =>
      value === "" || item.is_active === (value === "true"),
    seller_id: (item, value) => !value || item.seller_id === value,
    category_id: (item, value) => !value || item.category_id === value,
  },
});

// Options pour les filtres
const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "true", label: "Actif" },
  { value: "false", label: "Inactif" },
];

// Computed pour les options de vendeurs et catégories
const sellerOptions = computed(() => [
  { value: "", label: "Tous les vendeurs" },
  ...sellerStore.sellers.map((seller) => ({
    value: seller.id,
    label: seller.company_name,
  })),
]);

const categoryOptions = computed(() => [
  { value: "", label: "Toutes les catégories" },
  ...categoryStore.categories.map((category) => ({
    value: category.id,
    label: category.name,
  })),
]);

// Fonction pour obtenir la couleur du statut
function getStatusColor(isActive: boolean) {
  return isActive ? "green" : "red";
}

// Fonction pour obtenir le label du statut
function getStatusLabel(isActive: boolean) {
  return isActive ? "Actif" : "Inactif";
}

// Fonction pour obtenir la couleur du type
function getTypeColor(type: string) {
  return type === "variable" ? "purple" : "blue";
}

// Fonction pour obtenir le label du type
function getTypeLabel(type: string) {
  return type === "variable" ? "Variable" : "Simple";
}

// Actions sur les produits
async function deleteProduct(product: Product) {
  if (
    confirm(
      `Êtes-vous sûr de vouloir supprimer le produit "${product.title}" ?`
    )
  ) {
    const { success } = await productStore.remove(product.id!);
    if (success) {
      // Notification de succès
      console.log("Produit supprimé avec succès");
    }
  }
}

async function toggleProductStatus(product: Product) {
  const newStatus = !product.is_active;
  await productStore.update(product.id!, { is_active: newStatus });
}

// Appliquer les filtres
watch(
  filters,
  async (newFilters) => {
    await productStore.getAll(newFilters);
  },
  { deep: true }
);
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div class="flex items-center justify-between">
            <h5 class="table-title">
              Liste des produits
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ totalFilteredRows }} produits)
              </span>
            </h5>

            <UButton
              @click="navigateTo('/dashboard/products/create')"
              icon="i-heroicons-plus"
              color="primary"
              size="lg"
            >
              Nouveau produit
            </UButton>
          </div>
        </div>

        <!-- Filtres -->
        <div class="flex flex-col sm:flex-row gap-4 py-4 border-y">
          <div class="flex-1">
            <UInput
              v-model="q"
              placeholder="Rechercher par titre, description ou SKU..."
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

          <TableElementByPage v-model="pageCount" />
        </div>
      </template>

      <template #content>
        <UTable :loading="loading" :columns="productColumns" :rows="rows">
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
              <p class="font-medium text-gray-900">{{ row.title }}</p>
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
              {{ getTypeLabel(row.product_type || "simple") }}
            </UBadge>
          </template>

          <!-- Prix (utilise display_price de la vue) -->
          <template #price-data="{ row }">
            <div>
              <span class="font-medium">{{
                formatPrice(row.display_price)
              }}</span>
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
            <span v-else class="text-gray-400">-</span>
          </template>

          <!-- Catégorie -->
          <template #category-data="{ row }">
            <span v-if="row.category">{{ row.category.name }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>

          <!-- Date de création -->
          <template #created_at-data="{ row }">
            <span class="text-sm">
              {{ new Date(row.created_at).toLocaleDateString("fr-FR") }}
            </span>
          </template>

          <!-- Actions -->
          <template #actions-data="{ row }">
            <div class="flex gap-1">
              <UButton
                @click="navigateTo(`/dashboard/products/show-${row.id}`)"
                icon="i-heroicons-eye"
                size="sm"
                color="primary"
                variant="ghost"
                title="Voir les détails"
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
                @click="toggleProductStatus(row)"
                :icon="row.is_active ? 'i-heroicons-pause' : 'i-heroicons-play'"
                size="sm"
                :color="row.is_active ? 'orange' : 'green'"
                variant="ghost"
                :title="row.is_active ? 'Désactiver' : 'Activer'"
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
        <TablePaginationInfo
          :page="page"
          :page-count="pageCount"
          :length="totalFilteredRows"
          title="produits"
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
