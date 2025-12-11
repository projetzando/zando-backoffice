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
                  :color="getStatusBadgeColor(order.status)"
                  variant="subtle"
                >
                  {{ getStatusBadgeLabel(order.status) }}
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
                    v-if="
                      item.product?.cover_image || item.product?.images?.[0]
                    "
                    :src="item.product.cover_image || item.product.images[0]"
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
                      <!-- Afficher la variation au lieu des attributs -->
                      <p
                        v-if="item.variation_name"
                        class="text-sm text-gray-500 mt-1"
                      >
                        Variation: {{ item.variation_name }}
                      </p>
                      <!-- Afficher le vendeur pour les admins/superadmins -->
                      <div v-if="item.seller && !isSellerUser" class="mt-2">
                        <UBadge color="gray" variant="subtle" size="xs">
                          <UIcon name="i-heroicons-building-storefront" class="w-3 h-3 mr-1" />
                          {{ item.seller.company_name }}
                        </UBadge>
                      </div>
                    </div>

                    <div class="text-right">
                      <p class="text-sm text-gray-500">
                        {{ item.quantity }} ×
                        {{ formatPrice(item.unit_price) }}
                      </p>
                      <p class="font-semibold">
                        {{
                          formatPrice(
                            item.total_price || item.quantity * item.unit_price
                          )
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    formatPrice(calculateSubtotal)
                  }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-gray-600">Frais de livraison</span>
                    <p class="text-sm text-gray-400">
                      {{ getPaymentMethodLabel(order.payment_method) || "Non spécifié" }}
                    </p>
                  </div>
                  <span class="font-medium">{{
                    formatPrice(order.shipping_cost || 0)
                  }}</span>
                </div>

                <div
                  class="flex justify-between items-center pt-3 border-t border-gray-200"
                >
                  <span class="text-lg font-semibold">Total</span>
                  <span class="text-lg font-bold text-primary-600">{{
                    formatPrice(calculateTotal)
                  }}</span>
                </div>
              </div>

              <!-- Statut du paiement -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Statut du paiement</span>
                  <UBadge
                    :color="paymentStatus === 'paid' ? 'green' : paymentStatus === 'pending' ? 'orange' : paymentStatus === 'failed' ? 'red' : 'gray'"
                    variant="subtle"
                    size="sm"
                  >
                    {{
                      paymentStatus === 'paid' ? 'Payée' :
                      paymentStatus === 'pending' ? 'En attente' :
                      paymentStatus === 'failed' ? 'Échec de paiement' :
                      'Non payée'
                    }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Tentatives de paiement -->
          <UCard v-if="order.payments && order.payments.length > 0">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Tentatives de paiement</h3>
                <UBadge
                  :color="hasSuccessfulPayment ? 'green' : 'gray'"
                  variant="subtle"
                >
                  {{ order.payments.length }} tentative{{ order.payments.length > 1 ? 's' : '' }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="payment in order.payments"
                :key="payment.id"
                class="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="font-medium text-gray-900">
                        {{ formatPrice(payment.amount) }}
                      </p>
                      <UBadge
                        :color="getPaymentStatusColor(payment.status)"
                        variant="subtle"
                        size="xs"
                      >
                        {{ getPaymentStatusLabel(payment.status) }}
                      </UBadge>
                    </div>
                    <p class="text-sm text-gray-600">
                      {{ getPaymentMethodLabel(payment.method) }}
                    </p>
                  </div>
                </div>

                <div class="space-y-1">
                  <div v-if="payment.transaction_ref" class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">Réf. transaction:</span>
                    <code class="bg-gray-100 px-2 py-0.5 rounded">{{ payment.transaction_ref }}</code>
                  </div>
                  <div v-if="payment.safe_reference" class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">Réf. Safe:</span>
                    <code class="bg-gray-100 px-2 py-0.5 rounded">{{ payment.safe_reference }}</code>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">Date:</span>
                    <span class="text-gray-700">{{ formatDate(payment.created_at, true) }}</span>
                  </div>
                </div>
              </div>
            </div>
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
          <UCard>
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
                {{ order.delivery_name || "Nom non spécifié" }}
              </p>
              <div class="text-sm text-gray-600 space-y-1">
                <p>{{ order.delivery_address || "Adresse non spécifiée" }}</p>
                <p>{{ order.delivery_city || "Ville non spécifiée" }}</p>
                <p v-if="order.delivery_phone">
                  Téléphone: {{ order.delivery_phone }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- Méthode de paiement -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Méthode de paiement</h3>
                <UButton
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-pencil-square"
                />
              </div>
            </template>

            <div class="space-y-2">
              <p class="font-medium text-gray-900">
                {{ getPaymentMethodLabel(order.payment_method) || "Non spécifié" }}
              </p>
              <div v-if="order.notes" class="text-sm text-gray-600">
                <p><strong>Notes:</strong> {{ order.notes }}</p>
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
              <p v-if="order.notes" class="text-sm text-gray-900">
                {{ order.notes }}
              </p>
              <p v-else class="text-sm text-gray-500">
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
const authStore = useAuthStore();

// Vérifier si l'utilisateur est un vendeur
const isSellerUser = computed(() => authStore.connected_user?.role === 'seller');

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

// Émissions d'événements pour les actions
const emit = defineEmits(["orderUpdated", "statusChanged"]);

// Réactivité aux changements d'état de la commande
const orderStatus = computed(() => props.order?.status);
const isOrderEditable = computed(
  () =>
    props.order?.status && ["pending", "confirmed"].includes(props.order.status)
);

// Watcher pour détecter les changements de statut
watch(
  () => props.order?.status,
  (newStatus, oldStatus) => {
    if (newStatus !== oldStatus && oldStatus) {
      emit("statusChanged", { newStatus, oldStatus, order: props.order });
    }
  }
);

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

// Fonction pour formater la méthode de paiement
const getPaymentMethodLabel = (method: string) => {
  const labels = {
    mobile_money: "Mobile Money",
    cash: "Paiement à la livraison",
    card: "Carte bancaire",
    bank_transfer: "Virement bancaire",
  };
  return labels[method as keyof typeof labels] || method;
};

// Fonction pour obtenir la couleur du statut de paiement
const getPaymentStatusColor = (status: string) => {
  const colors = {
    unpaid: "red",
    pending: "orange",
    completed: "green",
    failed: "red",
  };
  return colors[status as keyof typeof colors] || "gray";
};

// Fonction pour obtenir le label du statut de paiement
const getPaymentStatusLabel = (status: string) => {
  const labels = {
    unpaid: "Non payé",
    pending: "En attente",
    completed: "Complété",
    failed: "Échoué",
  };
  return labels[status as keyof typeof labels] || status;
};

// Fonction pour formater la devise
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
  }).format(amount);
};

// Calculs réactifs
const calculateSubtotal = computed(() => {
  if (!props.order?.order_items) return 0;
  return props.order.order_items.reduce((total: number, item: any) => {
    return total + (item.total_price || item.unit_price * item.quantity);
  }, 0);
});

const calculateTotal = computed(() => {
  return calculateSubtotal.value + (props.order?.shipping_cost || 0);
});

// Vérifier s'il y a un paiement réussi (tentative réussie)
const hasSuccessfulPayment = computed(() => {
  if (!props.order?.payments || props.order.payments.length === 0) {
    return false;
  }
  return props.order.payments.some((payment: any) => payment.status === 'completed');
});

// Statut de paiement de la commande
const paymentStatus = computed(() => {
  if (hasSuccessfulPayment.value) {
    return 'paid'; // Payée
  }

  if (!props.order?.payments || props.order.payments.length === 0) {
    return 'unpaid'; // Non payée
  }

  // Si des tentatives existent mais aucune réussie
  const hasPendingPayment = props.order.payments.some((payment: any) => payment.status === 'pending');
  if (hasPendingPayment) {
    return 'pending'; // En attente
  }

  return 'failed'; // Échec de paiement
});

// Fonctions utilitaires pour les statuts
const getStatusBadgeColor = (status: string) => {
  const colors = {
    pending: "orange",
    confirmed: "blue",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
  };
  return colors[status as keyof typeof colors] || "gray";
};

const getStatusBadgeLabel = (status: string) => {
  const labels = {
    pending: "En attente",
    confirmed: "Confirmé",
    shipped: "Expédié",
    delivered: "Livré",
    cancelled: "Annulé",
  };
  return labels[status as keyof typeof labels] || status;
};

// Fonctions pour templates (backward compatibility)
const getSubtotal = () => calculateSubtotal.value;
const getTotal = () => calculateTotal.value;
</script>
