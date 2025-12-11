<script lang="ts" setup>
definePageMeta({
  layout: "dashboard",
  name: "Détails d'une commande",
});

const route = useRoute();
const orderStore = useOrderStore();
const authStore = useAuthStore();

// Vérifier si l'utilisateur est un vendeur
const isSellerUser = computed(() => authStore.connected_user?.role === 'seller');

// Charger la commande
const { data: order, pending } = await useLazyAsyncData(
  `order-${route.params.id}`,
  () => orderStore.getById(route.params.id as string)
);

const { currentOrder, loading } = storeToRefs(orderStore);

function goBack() {
  return navigateTo("/dashboard/orders");
}

// Actions sur la commande
async function updateOrderStatus(newStatus: string) {
  if (!currentOrder.value) return;

  const confirmed = confirm(
    `Êtes-vous sûr de vouloir changer le statut de la commande vers "${newStatus}" ?`
  );
  if (confirmed) {
    await orderStore.updateStatus(currentOrder.value.id!, newStatus);
  }
}

async function cancelOrder() {
  if (!currentOrder.value) return;

  const confirmed = confirm(
    "Êtes-vous sûr de vouloir annuler cette commande ?"
  );
  if (confirmed) {
    await orderStore.updateStatus(currentOrder.value.id!, "cancelled");
  }
}

// Actions rapides basées sur le statut et le rôle
const availableActions = computed(() => {
  if (!currentOrder.value) return [];

  const status = currentOrder.value.status;
  const userRole = authStore.connected_user?.role;
  const actions = [];

  // Les vendeurs ne peuvent pas gérer les commandes, seulement les voir
  if (isSellerUser.value) {
    return [];
  }

  // Actions selon le statut (pour admin/superadmin uniquement)
  switch (status) {
    case "pending":
      // Nouvelle commande : peut être confirmée ou annulée
      actions.push(
        {
          label: "Confirmer",
          action: () => updateOrderStatus("confirmed"),
          color: "green",
          icon: "i-heroicons-check",
        },
        {
          label: "Annuler",
          action: cancelOrder,
          color: "red",
          icon: "i-heroicons-x-mark",
        }
      );
      break;

    case "confirmed":
      // Commande confirmée : peut être expédiée ou annulée
      actions.push(
        {
          label: "Expédier",
          action: () => updateOrderStatus("shipped"),
          color: "purple",
          icon: "i-heroicons-truck",
        },
        {
          label: "Annuler",
          action: cancelOrder,
          color: "red",
          icon: "i-heroicons-x-mark",
        }
      );
      break;

    case "shipped":
      // Commande expédiée : peut être marquée comme livrée
      actions.push({
        label: "Marquer livrée",
        action: () => updateOrderStatus("delivered"),
        color: "green",
        icon: "i-heroicons-check-badge",
      });
      break;

    case "delivered":
      // Commande livrée : peut être marquée comme réceptionnée
      actions.push({
        label: "Marquer réceptionnée",
        action: () => updateOrderStatus("received"),
        color: "green",
        icon: "i-heroicons-check-circle",
      });
      break;

    case "received":
      // Commande réceptionnée : aucune action possible (état final)
      break;

    case "cancelled":
      // Commande annulée : aucune action possible (état final)
      break;
  }

  return actions;
});

// Fonction pour obtenir la couleur du statut
function getStatusColor(status: string) {
  const colors = {
    pending: "orange",
    confirmed: "blue",
    shipped: "purple",
    delivered: "green",
    received: "emerald",
    cancelled: "red",
  };
  return colors[status as keyof typeof colors] || "gray";
}

function getStatusLabel(status: string) {
  const labels = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    received: "Réceptionnée",
    cancelled: "Annulée",
  };
  return labels[status as keyof typeof labels] || status;
}

function getPaymentMethodLabel(method: string) {
  const labels = {
    mobile_money: "Mobile Money",
    cash: "Paiement à la livraison",
    card: "Carte bancaire",
    bank_transfer: "Virement bancaire",
  };
  return labels[method as keyof typeof labels] || method;
}
</script>

<template>
  <div>
    <ButtonList @return="goBack" />

    <!-- Loading State -->
    <div v-if="pending || loading" class="space-y-6">
      <USkeleton class="h-20 w-full" />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <USkeleton class="h-64 w-full" />
          <USkeleton class="h-48 w-full" />
        </div>
        <div class="space-y-6">
          <USkeleton class="h-32 w-full" />
          <USkeleton class="h-48 w-full" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!currentOrder" class="text-center py-12">
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Commande non trouvée
      </h3>
      <p class="text-gray-500">
        Cette commande n'existe pas ou a été supprimée.
      </p>
    </div>

    <!-- Order Content -->
    <div v-else class="space-y-6">
      <!-- Header avec actions -->
      <UCard>
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Commande #{{ currentOrder.id.substring(0, 8) }}
            </h1>
            <div class="flex items-center gap-4 mt-2">
              <UBadge
                :color="getStatusColor(currentOrder.status)"
                variant="subtle"
                size="lg"
              >
                {{ getStatusLabel(currentOrder.status) }}
              </UBadge>
              <span class="text-sm text-gray-500">
                Créée le
                {{
                  new Date(currentOrder.created_at).toLocaleDateString("fr-FR")
                }}
              </span>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="flex gap-2">
            <UButton
              v-for="action in availableActions"
              :key="action.label"
              @click="action.action"
              :icon="action.icon"
              :color="action.color"
              variant="outline"
              size="sm"
            >
              {{ action.label }}
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Stats rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <UIcon
                name="i-heroicons-currency-dollar"
                class="w-5 h-5 text-green-600"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500">
                {{ isSellerUser ? 'Mon montant' : 'Montant total' }}
              </p>
              <p class="font-semibold text-lg">
                {{ formatPrice(isSellerUser && currentOrder.seller_total !== undefined ? currentOrder.seller_total : currentOrder.total_amount) }}
              </p>
              <p v-if="isSellerUser && currentOrder.seller_total !== undefined && currentOrder.seller_total < currentOrder.total_amount" class="text-xs text-gray-500 mt-1">
                sur {{ formatPrice(currentOrder.total_amount) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <UIcon
                name="i-heroicons-shopping-bag"
                class="w-5 h-5 text-blue-600"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500">Articles</p>
              <p class="font-semibold text-lg">
                {{ currentOrder.order_items?.length || 0 }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-100 rounded-lg">
              <UIcon name="i-heroicons-truck" class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Livraison</p>
              <p class="font-semibold text-sm">
                {{ currentOrder.delivery_address || "Adresse non définie" }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-orange-100 rounded-lg">
              <UIcon
                name="i-heroicons-credit-card"
                class="w-5 h-5 text-orange-600"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500">Paiement</p>
              <p class="font-semibold text-sm">
                {{ getPaymentMethodLabel(currentOrder.payment_method) || "Non défini" }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Contenu principal avec le composant OrderDetails -->
      <OrderDetails
        :order="currentOrder"
        :loading="false"
        class="bg-transparent shadow-none border-none"
      />
    </div>
  </div>
</template>

<style scoped>
/* Personnalisation du composant OrderDetails */
:deep(.max-w-7xl) {
  max-width: none;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

/* Amélioration des cartes dans OrderDetails */
:deep(.border-gray-200.rounded-lg) {
  background-color: white;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  border-radius: 0.75rem;
}

/* Amélioration des badges de statut */
:deep(.bg-amber-50.text-amber-600) {
  background-color: rgb(255 237 213);
  color: rgb(194 120 3);
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

/* Amélioration des boutons */
:deep(.border-gray-300.rounded-md) {
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

:deep(.border-gray-300.rounded-md:hover) {
  background-color: rgb(249 250 251);
}

:deep(.bg-indigo-600.text-white.rounded-md) {
  background-color: rgb(79 70 229);
  color: white;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

:deep(.bg-indigo-600.text-white.rounded-md:hover) {
  background-color: rgb(67 56 202);
}

/* Amélioration des liens */
:deep(.text-indigo-600) {
  color: rgb(79 70 229);
  font-weight: 500;
  transition-property: color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

:deep(.text-indigo-600:hover) {
  color: rgb(67 56 202);
}

/* Amélioration de l'espacement des sections */
:deep(.p-4) {
  padding: 1.5rem;
}

:deep(.border-b.border-gray-200) {
  border-bottom-width: 1px;
  border-bottom-color: rgb(243 244 246);
}

/* Style pour les icônes */
:deep(svg) {
  color: rgb(107 114 128);
}
</style>
