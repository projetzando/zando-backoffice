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
  // La fonction recordView n'existe pas encore dans le store
  // TODO: Implémenter le tracking des vues si nécessaire
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

// Actions
async function toggleStatus() {
  if (!currentProduct.value) return;

  const newStatus = !currentProduct.value.is_active;
  const result = await productStore.update(currentProduct.value.id!, { is_active: newStatus });
  
  if (result.success) {
    // Le store met automatiquement à jour currentProduct
    console.log(`Produit ${newStatus ? 'activé' : 'désactivé'} avec succès`);
  }
}

// Calculer le stock total
const totalStock = computed(() => {
  if (!currentProduct.value?.product_variations?.length) {
    return currentProduct.value?.stock || 0;
  }
  return currentProduct.value.product_variations.reduce((total, variant) => {
    return total + (variant.stock_quantity || 0);
  }, 0);
});

// Calculer le prix à afficher
const displayPrice = computed(() => {
  if (currentProduct.value?.base_price) {
    return formatPrice(currentProduct.value.base_price);
  }
  
  if (currentProduct.value?.product_variations?.length) {
    const prices = currentProduct.value.product_variations
      .map(v => v.price)
      .filter(p => p && p > 0);
    
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      } else {
        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
      }
    }
  }
  
  return 'Prix non défini';
});

// Formater la description avec le style approprié
function formatDescription(description: string | undefined) {
  if (!description) {
    return '<p class="text-gray-500 italic">Aucune description disponible</p>';
  }
  
  let formatted = description
    // Gestion des sauts de ligne
    .replace(/\n/g, '<br>')
    // Sections principales (texte suivi de \n)
    .replace(/^([A-Z][^.\n]*)\n/gm, '<h4 class="font-semibold text-gray-900 mt-4 mb-2">$1</h4>')
    // Puces avec *
    .replace(/\*([^*\n]+)\*/g, '<strong class="font-medium text-gray-900">$1</strong>')
    // Listes avec — ou -
    .replace(/^[—-]\s*(.+)$/gm, '<li class="ml-4">$1</li>')
    // Sections Features & details
    .replace(/(Features & details|Caractéristiques)/gi, '<h4 class="font-semibold text-gray-900 mt-6 mb-3 text-lg">$1</h4>')
    // Sections WHY [PRODUCT]
    .replace(/(WHY [A-Z\s]+)/g, '<h4 class="font-semibold text-primary-600 mt-6 mb-3">$1</h4>')
    // Sections en MAJUSCULES
    .replace(/^([A-Z\s]{10,})\s*—/gm, '<h4 class="font-semibold text-gray-900 mt-6 mb-3">$1</h4>')
    // Nettoyer les br multiples
    .replace(/(<br\s*\/?>){3,}/g, '<br><br>');
  
  // Wrapper les listes
  formatted = formatted.replace(/((<li[^>]*>.*?<\/li>\s*)+)/gs, '<ul class="list-none space-y-1 mt-2 mb-4">$1</ul>');
  
  return `<div class="space-y-2">${formatted}</div>`;
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <UButton
              @click="goBack"
              icon="i-heroicons-arrow-left"
              variant="ghost"
              size="sm"
            >
              Retour
            </UButton>
            <div class="h-6 border-l border-gray-300"></div>
            <h1 class="text-xl font-semibold text-gray-900">
              Détails du produit
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="text-gray-500">Chargement du produit...</p>
      </div>
    </div>

    <!-- Product not found -->
    <div v-else-if="!currentProduct" class="flex justify-center items-center py-20">
      <div class="text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Produit non trouvé</h3>
        <p class="text-gray-500">Le produit demandé n'existe pas ou a été supprimé.</p>
        <UButton @click="goBack" class="mt-4" variant="outline">
          Retour à la liste
        </UButton>
      </div>
    </div>

    <!-- Product details -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero section -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div class="p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            <!-- Product image -->
            <div class="flex-shrink-0 mb-6 lg:mb-0">
              <div class="w-full lg:w-80 h-80 rounded-lg overflow-hidden bg-gray-100">
                <img
                  v-if="currentProduct.cover_image"
                  :src="currentProduct.cover_image"
                  :alt="currentProduct.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-20 h-20 text-gray-400" />
                </div>
              </div>
            </div>

            <!-- Product info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {{ currentProduct.title }}
                  </h1>
                  <div class="flex items-center space-x-4">
                    <UBadge
                      :color="getStatusColor(currentProduct.is_active)"
                      variant="subtle"
                      size="lg"
                    >
                      {{ getStatusLabel(currentProduct.is_active) }}
                    </UBadge>
                    <span class="text-sm text-gray-500">
                      ID: {{ currentProduct.id?.substring(0, 8) }}...
                    </span>
                  </div>
                </div>
                
                <UButton
                  @click="toggleStatus"
                  :icon="currentProduct.is_active ? 'i-heroicons-pause' : 'i-heroicons-play'"
                  :color="currentProduct.is_active ? 'orange' : 'green'"
                  variant="outline"
                  :loading="productStore.loading"
                >
                  {{ currentProduct.is_active ? "Désactiver" : "Activer" }}
                </UButton>
              </div>

              <!-- Key metrics -->
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-green-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-green-600">
                    {{ displayPrice }}
                  </div>
                  <div class="text-sm text-green-600 font-medium">Prix</div>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-blue-600">
                    {{ totalStock }}
                  </div>
                  <div class="text-sm text-blue-600 font-medium">Stock total</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-purple-600">
                    {{ currentProduct.views_count || 0 }}
                  </div>
                  <div class="text-sm text-purple-600 font-medium">Vues</div>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-orange-600">
                    {{ currentProduct.product_variations?.length || 0 }}
                  </div>
                  <div class="text-sm text-orange-600 font-medium">Variations</div>
                </div>
              </div>

              <!-- Description -->
              <div class="bg-gray-50 rounded-lg p-4 mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div 
                  class="text-gray-700 leading-relaxed formatted-description"
                  v-html="formatDescription(currentProduct.description)"
                >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Product information -->
        <div class="space-y-6">
          <!-- Basic info -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations produit</h3>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Type de produit</dt>
                <dd class="mt-1 text-sm text-gray-900 capitalize">
                  {{ currentProduct.product_type || 'Non défini' }}
                </dd>
              </div>
              <div v-if="currentProduct.category">
                <dt class="text-sm font-medium text-gray-500">Catégorie</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentProduct.category.name }}
                </dd>
              </div>
              <div v-if="currentProduct.seller">
                <dt class="text-sm font-medium text-gray-500">Vendeur</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ currentProduct.seller.company_name }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Images gallery -->
          <div v-if="currentProduct.images?.length" class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Galerie ({{ currentProduct.images.length }} images)
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="(image, index) in currentProduct.images"
                :key="index"
                class="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  :src="image"
                  :alt="`Image ${index + 1}`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-if="index === 0"
                  class="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded"
                >
                  Principal
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Variations and metadata -->
        <div class="space-y-6">
          <!-- Variations -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Variations ({{ currentProduct.product_variations?.length || 0 }})
            </h3>
            
            <div v-if="currentProduct.product_variations?.length" class="space-y-3">
              <div
                v-for="variant in currentProduct.product_variations"
                :key="variant.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ variant.name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatPrice(variant.price) }} • 
                    {{ variant.stock_quantity }} en stock
                  </div>
                </div>
                <UBadge
                  v-if="variant.is_default"
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  Défaut
                </UBadge>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              <UIcon name="i-heroicons-squares-plus" class="w-12 h-12 mx-auto mb-2" />
              <p>Aucune variation configurée</p>
            </div>
          </div>

          <!-- Metadata -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h3>
            <dl class="space-y-4 text-sm">
              <div>
                <dt class="font-medium text-gray-500">Date de création</dt>
                <dd class="mt-1 text-gray-900">
                  {{ new Date(currentProduct.created_at).toLocaleString("fr-FR") }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-500">Dernière modification</dt>
                <dd class="mt-1 text-gray-900">
                  {{ new Date(currentProduct.updated_at).toLocaleString("fr-FR") }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>