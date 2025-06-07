<template>
  <div class="space-y-6">
    <div v-if="!loading && order">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Articles de la commande -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Articles de la commande</h3>
                <UBadge
                  v-if="order.status !== 'delivered'"
                  color="orange"
                  variant="subtle"
                >
                  Non livrés
                </UBadge>
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="item in order.order_items"
                :key="item.id"
                class="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
              >
                <!-- Image du produit -->
                <div class="flex-shrink-0">
                  <img
                    v-if="item.product?.product_images?.[0]?.url"
                    :src="item.product.product_images[0].url"
                    :alt="item.product.title"
                    class="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div
                    v-else
                    class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-photo"
                      class="w-6 h-6 text-gray-400"
                    />
                  </div>
                </div>

                <!-- Informations du produit -->
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-medium text-gray-900">
                        {{ item.product?.title || "Produit supprimé" }}
                      </h4>
                      <p
                        v-if="item.product?.category"
                        class="text-sm text-gray-500 mt-1"
                      >
                        {{ item.product.category.name }}
                      </p>
                      <div
                        v-if="item.variant?.attributes"
                        class="flex gap-2 mt-2"
                      >
                        <UBadge
                          v-for="(value, key) in item.variant.attributes"
                          :key="key"
                          variant="subtle"
                          size="sm"
                        >
                          {{ key }}: {{ value }}
                        </UBadge>
                      </div>
                    </div>

                    <div class="text-right">
                      <p class="text-sm text-gray-500">
                        {{ item.quantity }} ×
                        {{ formatCurrency(item.unit_price) }}
                      </p>
                      <p class="font-semibold">
                        {{ formatCurrency(item.quantity * item.unit_price) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="flex gap-3">
                <UButton variant="outline" size="sm">
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
                  Remettre en stock
                </UButton>
                <UButton color="primary" size="sm">
                  <UIcon name="i-heroicons-truck" class="w-4 h-4 mr-2" />
                  Créer une étiquette
                </UButton>
              </div>
            </template>
          </UCard>

          <!-- Résumé financier -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Résumé financier</h3>
            </template>

            <div class="space-y-4">
              <!-- Détail des coûts -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600"
                    >Sous-total ({{
                      order.order_items?.length || 0
                    }}
                    articles)</span
                  >
                  <span class="font-medium">{{
                    formatCurrency(calculateSubtotal())
                  }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-gray-600">Frais de livraison</span>
                    <p class="text-sm text-gray-400">
                      {{ order.shipping_method }}
                    </p>
                  </div>
                  <span class="font-medium">{{
                    formatCurrency(order.shipping_cost)
                  }}</span>
                </div>

                <div
                  class="flex justify-between items-center pt-3 border-t border-gray-200"
                >
                  <span class="text-lg font-semibold">Total</span>
                  <span class="text-lg font-bold text-primary-600">{{
                    formatCurrency(calculateTotal())
                  }}</span>
                </div>
              </div>

              <!-- Statut du paiement -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-600">Payé par l'acheteur</span>
                  <span class="text-sm font-medium">0.00 XAF</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Montant dû</span>
                  <span class="text-sm font-medium text-red-600">{{
                    formatCurrency(calculateTotal())
                  }}</span>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="flex gap-3">
                <UButton variant="outline" size="sm">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-4 h-4 mr-2"
                  />
                  Envoyer la facture
                </UButton>
                <UButton color="primary" size="sm">
                  <UIcon name="i-heroicons-credit-card" class="w-4 h-4 mr-2" />
                  Collecter le paiement
                </UButton>
              </div>
            </template>
          </UCard>

          <!-- Chronologie -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Chronologie</h3>
            </template>

            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div
                  class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-plus"
                    class="w-4 h-4 text-primary-600"
                  />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Commande créée</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(order.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Autres événements de la chronologie basés sur le statut -->
              <div
                v-if="order.status !== 'pending'"
                class="flex items-start gap-3"
              >
                <div
                  class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-check"
                    class="w-4 h-4 text-blue-600"
                  />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Commande confirmée</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(order.updated_at) }}
                  </p>
                </div>
              </div>
            </div>

            <template #footer>
              <UTextarea
                placeholder="Ajouter un commentaire..."
                :rows="2"
                class="w-full"
              />
            </template>
          </UCard>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <!-- Informations de l'acheteur -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Acheteur</h3>
            </template>

            <div v-if="order.buyer" class="space-y-4">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="order.buyer.avatar_url"
                  :alt="`${order.buyer.first_name} ${order.buyer.last_name}`"
                  size="md"
                />
                <div>
                  <p class="font-medium text-gray-900">
                    {{ order.buyer.first_name }} {{ order.buyer.last_name }}
                  </p>
                  <p class="text-sm text-gray-500">{{ order.buyer.email }}</p>
                </div>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-calendar"
                    class="w-4 h-4 text-gray-400"
                  />
                  <span class="text-gray-600"
                    >Client depuis
                    {{ formatDate(order.buyer.created_at, true) }}</span
                  >
                </div>

                <div v-if="order.buyer.phone" class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-phone"
                    class="w-4 h-4 text-gray-400"
                  />
                  <span class="text-gray-600">{{ order.buyer.phone }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-language"
                    class="w-4 h-4 text-gray-400"
                  />
                  <span class="text-gray-600"
                    >Langue: {{ order.buyer.language }}</span
                  >
                </div>
              </div>

              <UBadge
                v-if="order.buyer.status === 'active'"
                color="green"
                variant="subtle"
              >
                Client actif
              </UBadge>
            </div>
          </UCard>

          <!-- Adresse de livraison -->
          <UCard v-if="order.shipping_address">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Adresse de livraison</h3>
                <UButton
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-pencil-square"
                />
              </div>
            </template>

            <div class="space-y-2">
              <p class="font-medium text-gray-900">
                {{ order.shipping_address.name }}
              </p>
              <div class="text-sm text-gray-600 space-y-1">
                <p>{{ order.shipping_address.street }}</p>
                <p>
                  {{ order.shipping_address.city }},
                  {{ order.shipping_address.state }}
                </p>
                <p>{{ order.shipping_address.postal_code }}</p>
                <p>{{ order.shipping_address.country }}</p>
                <p v-if="order.shipping_address.phone">
                  {{ order.shipping_address.phone }}
                </p>
              </div>
            </div>

            <template #footer>
              <UButton variant="outline" size="sm" block>
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 mr-2" />
                Voir sur la carte
              </UButton>
            </template>
          </UCard>

          <!-- Adresse de facturation -->
          <UCard v-if="order.billing_address">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Adresse de facturation</h3>
                <UButton
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-pencil-square"
                />
              </div>
            </template>

            <div v-if="order.billing_address.id === order.shipping_address?.id">
              <p class="text-sm text-gray-500">
                Identique à l'adresse de livraison
              </p>
            </div>
            <div v-else class="space-y-2">
              <p class="font-medium text-gray-900">
                {{ order.billing_address.name }}
              </p>
              <div class="text-sm text-gray-600 space-y-1">
                <p>{{ order.billing_address.street }}</p>
                <p>
                  {{ order.billing_address.city }},
                  {{ order.billing_address.state }}
                </p>
                <p>{{ order.billing_address.postal_code }}</p>
                <p>{{ order.billing_address.country }}</p>
              </div>
            </div>
          </UCard>

          <!-- Notes -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Notes</h3>
                <UButton
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-pencil-square"
                />
              </div>
            </template>

            <div>
              <p class="text-sm text-gray-500">
                Aucune note pour cette commande
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <USkeleton class="h-64 w-full" />
        <USkeleton class="h-48 w-full" />
        <USkeleton class="h-32 w-full" />
      </div>
      <div class="space-y-6">
        <USkeleton class="h-48 w-full" />
        <USkeleton class="h-32 w-full" />
        <USkeleton class="h-24 w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

// Fonction pour formater la date
const formatDate = (dateString: string, shortFormat = false) => {
  const date = new Date(dateString);

  if (shortFormat) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

// Fonction pour formater la devise
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
  }).format(amount);
};

// Fonction pour calculer le sous-total
const calculateSubtotal = () => {
  if (!props.order?.order_items) return 0;
  return props.order.order_items.reduce((total: number, item: any) => {
    return total + item.unit_price * item.quantity;
  }, 0);
};

// Fonction pour calculer le total
const calculateTotal = () => {
  return calculateSubtotal() + (props.order?.shipping_cost || 0);
};
</script>
