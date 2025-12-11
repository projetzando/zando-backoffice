<script setup lang="ts">
definePageMeta({
  name: 'Test des vues',
  layout: 'dashboard',
})

const productStore = useProductStore()
const cartStore = useCartStore()

// Test des vues
onMounted(async () => {
  console.log('🔍 Test des vues Supabase')

  // Test vue products_with_price
  const productsResult = await productStore.getAll()
  if (productsResult.success && productsResult.data?.length > 0) {
    console.log('✅ Vue products_with_price:', productsResult.data[0])
    console.log('   - display_price:', productsResult.data[0].display_price)
    console.log('   - available_stock:', productsResult.data[0].available_stock)
    console.log('   - review_count:', productsResult.data[0].review_count)
    console.log('   - avg_rating:', productsResult.data[0].avg_rating)
    console.log('   - variations:', productsResult.data[0].variations)
  }
  else {
    console.log('❌ Erreur vue products_with_price:', productsResult.error)
  }

  // Test vue cart_with_details (nécessite un utilisateur connecté)
  const {
    data: { user },
  } = await useSupabaseClient().auth.getUser()
  if (user) {
    const cartResult = await cartStore.getCart(user.id)
    if (cartResult.success) {
      console.log('✅ Vue cart_with_details:', cartResult.data)
      if (cartResult.data.length > 0) {
        console.log('   - product_title:', cartResult.data[0].product_title)
        console.log('   - unit_price:', cartResult.data[0].unit_price)
        console.log('   - total_price:', cartResult.data[0].total_price)
      }
    }
    else {
      console.log('❌ Erreur vue cart_with_details:', cartResult.error)
    }
  }
})

const { products } = storeToRefs(productStore)
const { currentCart } = storeToRefs(cartStore)
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Test des vues Supabase
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Test products_with_price -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">
          Vue products_with_price
        </h2>
        <div
          v-if="products.length === 0"
          class="text-gray-500"
        >
          Chargement des produits...
        </div>
        <div v-else>
          <p class="text-sm text-gray-600 mb-4">
            {{ products.length }} produits chargés depuis la vue
          </p>
          <div
            v-for="product in products.slice(0, 3)"
            :key="product.id"
            class="border rounded p-3 mb-3"
          >
            <h3 class="font-medium">
              {{ product.title }}
            </h3>
            <div class="text-sm text-gray-600 mt-2 space-y-1">
              <div>Prix affiché: {{ product.display_price }}€</div>
              <div>Stock disponible: {{ product.available_stock }}</div>
              <div>Avis: {{ product.review_count }} ({{ product.avg_rating }}/5)</div>
              <div>Type: {{ product.product_type }}</div>
              <div v-if="product.variations">
                Variations: {{ product.variations?.length || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test cart_with_details -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">
          Vue cart_with_details
        </h2>
        <div
          v-if="currentCart.length === 0"
          class="text-gray-500"
        >
          Panier vide ou utilisateur non connecté
        </div>
        <div v-else>
          <p class="text-sm text-gray-600 mb-4">
            {{ currentCart.length }} articles dans le panier
          </p>
          <div
            v-for="item in currentCart"
            :key="item.id"
            class="border rounded p-3 mb-3"
          >
            <h3 class="font-medium">
              {{ item.product_title }}
            </h3>
            <div class="text-sm text-gray-600 mt-2 space-y-1">
              <div>Quantité: {{ item.quantity }}</div>
              <div>Prix unitaire: {{ item.unit_price }}€</div>
              <div>Prix total: {{ item.total_price }}€</div>
              <div v-if="item.variation_name">
                Variation: {{ item.variation_name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 bg-gray-100 rounded-lg">
      <h3 class="font-semibold mb-2">
        Instructions de test:
      </h3>
      <ol class="text-sm text-gray-600 space-y-1 list-decimal list-inside">
        <li>Ouvrir la console développeur (F12)</li>
        <li>Recharger cette page</li>
        <li>Vérifier les logs des vues dans la console</li>
        <li>
          Les données doivent venir des vues <code>products_with_price</code> et
          <code>cart_with_details</code>
        </li>
        <li>
          Vérifier que les champs calculés (display_price, available_stock, etc.) sont présents
        </li>
      </ol>
    </div>
  </div>
</template>
