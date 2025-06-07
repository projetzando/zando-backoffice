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
  status: "",
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
  searchFields: ["title", "description", "sku"],
  filtersConfig: {
    status: (item, value) => !value || item.status === value,
    seller_id: (item, value) => !value || item.seller_id === value,
    category_id: (item, value) => !value || item.category_id === value,
  },
});

// Options pour les filtres
const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "archived", label: "Archivé" },
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

// Fonction pour formater le prix
function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

// Fonction pour obtenir la couleur du statut
function getStatusColor(status: string) {
  const colors = {
    draft: "gray",
    active: "green",
    inactive: "orange",
    archived: "red",
  };
  return colors[status as keyof typeof colors] || "gray";
}

// Fonction pour obtenir le label du statut
function getStatusLabel(status: string) {
  const labels = {
    draft: "Brouillon",
    active: "Actif",
    inactive: "Inactif",
    archived: "Archivé",
  };
  return labels[status as keyof typeof labels] || status;
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
  const newStatus = product.status === "active" ? "inactive" : "active";
  await productStore.update(product.id!, { status: newStatus });
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
          <h5 class="table-title">
            Liste des produits
            <span class="text-sm font-normal text-gray-500 ml-2">
              ({{ totalFilteredRows }} produits)
            </span>
          </h5>

          <!-- <ButtonCreate @new="() => navigateTo(`/dashboard/products/create`)" /> -->
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
              v-model="filters.status"
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
          <template #product_images-data="{ row }">
            <UAvatar
              :src="row.product_images?.[0]?.url"
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

          <!-- SKU -->
          <template #sku-data="{ row }">
            <code v-if="row.sku" class="text-xs bg-gray-100 px-2 py-1 rounded">
              {{ row.sku }}
            </code>
            <span v-else class="text-gray-400">-</span>
          </template>

          <!-- Prix -->
          <template #price-data="{ row }">
            <span class="font-medium">{{ formatPrice(row.price) }}</span>
          </template>

          <!-- Stock -->
          <template #stock-data="{ row }">
            <UBadge :color="row.stock > 0 ? 'green' : 'red'" variant="subtle">
              {{ row.stock }}
            </UBadge>
          </template>

          <!-- Statut -->
          <template #status-data="{ row }">
            <UBadge :color="getStatusColor(row.status)" variant="subtle">
              {{ getStatusLabel(row.status) }}
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
                :icon="
                  row.status === 'active'
                    ? 'i-heroicons-pause'
                    : 'i-heroicons-play'
                "
                size="sm"
                :color="row.status === 'active' ? 'orange' : 'green'"
                variant="ghost"
                :title="row.status === 'active' ? 'Désactiver' : 'Activer'"
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
