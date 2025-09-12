<script lang="ts" setup>
definePageMeta({
  layout: "dashboard",
  name: "Détails d'un produit",
});

const route = useRoute();
const productStore = useProductStore();

// Charger le produit
const { data: product, pending } = await useLazyAsyncData(
  `product-${route.params.id}`,
  () => productStore.getById(route.params.id as string)
);

const { currentProduct } = storeToRefs(productStore);

// Enregistrer la vue du produit
onMounted(() => {
  if (currentProduct.value) {
    productStore.recordView(currentProduct.value.id!);
  }
});

function goBack() {
  return navigateTo("/dashboard/products");
}

// Fonctions utilitaires
function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function getStatusColor(is_active: boolean) {
  return is_active ? "green" : "red";
}

function getStatusLabel(is_active: boolean) {
  return is_active ? "Actif" : "Inactif";
}

// Onglets
const tabs = [
  {
    slot: "overview",
    label: "Vue d'ensemble",
    icon: "i-heroicons-information-circle",
  },
  {
    slot: "images",
    label: "Images",
    icon: "i-heroicons-photo",
  },
  {
    slot: "variants",
    label: "Variations",
    icon: "i-heroicons-squares-plus",
  },
  {
    slot: "analytics",
    label: "Statistiques",
    icon: "i-heroicons-chart-bar",
  },
];

const selectedTab = ref(0);

// Actions
async function deleteProduct() {
  if (!currentProduct.value) return;

  if (
    confirm(
      `Êtes-vous sûr de vouloir supprimer le produit "${currentProduct.value.title}" ?`
    )
  ) {
    const { success } = await productStore.remove(currentProduct.value.id!);
    if (success) {
      await navigateTo("/dashboard/products");
    }
  }
}

async function toggleStatus() {
  if (!currentProduct.value) return;

  const newStatus = !currentProduct.value.is_active;
  await productStore.update(currentProduct.value.id!, { is_active: newStatus });
}
</script>

<template>
  <div>
    <ButtonList @return="goBack" />

    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
    </div>

    <div v-else-if="!currentProduct" class="text-center py-8">
      <p class="text-gray-500">Produit non trouvé</p>
    </div>

    <div v-else class="space-y-6">
      <!-- En-tête -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ currentProduct.title }}
          </h1>
          <div class="flex items-center gap-4 mt-2">
            <UBadge
              :color="getStatusColor(currentProduct.is_active)"
              variant="subtle"
              size="lg"
            >
              {{ getStatusLabel(currentProduct.is_active) }}
            </UBadge>
            <span class="text-sm text-gray-500">
              ID: <code class="bg-gray-100 px-2 py-1 rounded">{{ currentProduct.id?.substring(0, 8) }}</code>
            </span>
          </div>
        </div>

        <div class="flex gap-2">
          <!-- <UButton
            @click="navigateTo(`/dashboard/products/${currentProduct.id}/edit`)"
            icon="i-heroicons-pencil-square"
            color="orange"
            variant="outline"
          >
            Modifier
          </UButton> -->

          <UButton
            @click="toggleStatus"
            :icon="
              currentProduct.is_active
                ? 'i-heroicons-pause'
                : 'i-heroicons-play'
            "
            :color="currentProduct.is_active ? 'orange' : 'green'"
            variant="outline"
          >
            {{ currentProduct.is_active ? "Désactiver" : "Activer" }}
          </UButton>

          <!-- <UButton
            @click="deleteProduct"
            icon="i-heroicons-trash"
            color="red"
            variant="outline"
          >
            Supprimer
          </UButton> -->
        </div>
      </div>

      <!-- Onglets -->
      <UTabs v-model="selectedTab" :items="tabs">
        <!-- Vue d'ensemble -->
        <template #overview="{ item }">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Image principale -->
            <div class="lg:col-span-1">
              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold">Image principale</h3>
                </template>

                <div class="aspect-square">
                  <img
                    v-if="currentProduct.cover_image"
                    :src="currentProduct.cover_image"
                    :alt="currentProduct.title"
                    class="w-full h-full object-cover rounded-lg"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-photo"
                      class="w-12 h-12 text-gray-400"
                    />
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Informations détaillées -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Informations de base -->
              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold">Informations de base</h3>
                </template>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Prix</label
                    >
                    <p class="text-lg font-semibold text-green-600 mt-1">
                      {{ formatPrice(currentProduct.base_price) }}
                    </p>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Stock</label
                    >
                    <p class="text-lg font-semibold text-gray-600 mt-1">
                      Géré par variations
                    </p>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-700"
                      >Type de produit</label
                    >
                    <p class="text-gray-900 mt-1 capitalize">
                      {{ currentProduct.product_type || 'Non défini' }}
                    </p>
                  </div>
                </div>

                <div class="mt-4">
                  <label class="text-sm font-medium text-gray-700"
                    >Description</label
                  >
                  <p class="text-gray-900 mt-1 whitespace-pre-line">
                    {{ currentProduct.description }}
                  </p>
                </div>
              </UCard>

              <!-- Organisation -->
              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold">Organisation</h3>
                </template>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div v-if="currentProduct.seller">
                    <label class="text-sm font-medium text-gray-700"
                      >Vendeur</label
                    >
                    <p class="text-gray-900 mt-1">
                      {{ currentProduct.seller.company_name }}
                    </p>
                  </div>

                  <div v-if="currentProduct.category">
                    <label class="text-sm font-medium text-gray-700"
                      >Catégorie</label
                    >
                    <p class="text-gray-900 mt-1">
                      {{ currentProduct.category.name }}
                    </p>
                  </div>
                </div>
              </UCard>

              <!-- Métadonnées -->
              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold">Métadonnées</h3>
                </template>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label class="text-gray-700 font-medium"
                      >Date de création</label
                    >
                    <p class="text-gray-900 mt-1">
                      {{
                        new Date(currentProduct.created_at).toLocaleString(
                          "fr-FR"
                        )
                      }}
                    </p>
                  </div>

                  <div>
                    <label class="text-gray-700 font-medium"
                      >Dernière modification</label
                    >
                    <p class="text-gray-900 mt-1">
                      {{
                        new Date(currentProduct.updated_at).toLocaleString(
                          "fr-FR"
                        )
                      }}
                    </p>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </template>

        <!-- Images -->
        <template #images="{ item }">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Galerie d'images</h3>
            </template>

            <div
              v-if="currentProduct.images?.length"
              class="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div
                v-for="(image, index) in currentProduct.images"
                :key="index"
                class="relative group"
              >
                <img
                  :src="image"
                  :alt="`${currentProduct.title} - Image ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg border"
                />
                <div
                  v-if="index === 0"
                  class="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded"
                >
                  Principal
                </div>
                <div
                  class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                >
                  {{ index + 1 }}
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <UIcon name="i-heroicons-photo" class="w-12 h-12 mx-auto mb-2" />
              <p>Aucune image disponible</p>
            </div>
          </UCard>
        </template>

        <!-- Variations -->
        <template #variants="{ item }">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Variations du produit</h3>
            </template>

            <div v-if="currentProduct.product_variations?.length">
              <UTable
                :rows="currentProduct.product_variations"
                :columns="[
                  { key: 'name', label: 'Nom' },
                  { key: 'price', label: 'Prix' },
                  { key: 'stock_quantity', label: 'Stock' },
                  { key: 'is_default', label: 'Défaut' },
                ]"
              >
                <template #price-data="{ row }">
                  {{ formatPrice(row.price) }}
                </template>

                <template #is_default-data="{ row }">
                  <UBadge
                    :color="row.is_default ? 'green' : 'gray'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ row.is_default ? 'Défaut' : 'Standard' }}
                  </UBadge>
                </template>

                <template #stock_quantity-data="{ row }">
                  <span
                    :class="
                      row.stock_quantity > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{ row.stock_quantity }} unité{{ row.stock_quantity > 1 ? 's' : '' }}
                  </span>
                </template>
              </UTable>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <UIcon
                name="i-heroicons-squares-plus"
                class="w-12 h-12 mx-auto mb-2"
              />
              <p>Aucune variation configurée</p>
            </div>
          </UCard>
        </template>

        <!-- Statistiques -->
        <template #analytics="{ item }">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Vues du produit</h3>
              </template>
              <div class="text-center">
                <p class="text-3xl font-bold text-primary-600">
                  {{ currentProduct.views_count || 0 }}
                </p>
                <p class="text-sm text-gray-500 mt-1">vues totales</p>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Images</h3>
              </template>
              <div class="text-center">
                <p class="text-3xl font-bold text-green-600">
                  {{ currentProduct.images?.length || 0 }}
                </p>
                <p class="text-sm text-gray-500 mt-1">images ajoutées</p>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Variations</h3>
              </template>
              <div class="text-center">
                <p class="text-3xl font-bold text-orange-600">
                  {{ currentProduct.product_variations?.length || 0 }}
                </p>
                <p class="text-sm text-gray-500 mt-1">variations créées</p>
              </div>
            </UCard>
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template>
