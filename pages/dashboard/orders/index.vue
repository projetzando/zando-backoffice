<script setup lang="ts">
definePageMeta({
  name: "Liste des commandes",
  layout: "dashboard",
});

const orderStore = useOrderStore();

// Charger les commandes
onMounted(() => {
  orderStore.getAll();
});

const { orders, loading } = storeToRefs(orderStore);

// Filtres
const filters = ref({
  search: "",
  status: "",
  date_from: "",
  date_to: "",
});

// Configuration de la table
const {
  q,
  page,
  pageCount,
  oneItem,
  isOpen,
  rows,
  totalFilteredRows,
  confirmDeleteItem,
} = useTable(orders, {
  searchFields: ["id", "buyer.first_name", "buyer.last_name", "buyer.email"],
  filtersConfig: {
    status: (item, value) => !value || item.status === value,
    date_from: (item, value) =>
      !value || new Date(item.created_at) >= new Date(value),
    date_to: (item, value) =>
      !value || new Date(item.created_at) <= new Date(value),
  },
});

// Options pour les filtres
const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "processing", label: "En cours" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
  { value: "returned", label: "Retournée" },
];

// Fonctions utilitaires
function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
  }).format(price);
}

function getStatusColor(status: string) {
  const colors = {
    pending: "orange",
    confirmed: "blue",
    processing: "yellow",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
    returned: "gray",
  };
  return colors[status as keyof typeof colors] || "gray";
}

function getStatusLabel(status: string) {
  const labels = {
    pending: "En attente",
    confirmed: "Confirmée",
    processing: "En cours",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    returned: "Retournée",
  };
  return labels[status as keyof typeof labels] || status;
}

function truncateId(id: string) {
  return id.substring(0, 8) + "...";
}

// Calculer le total des commandes
const totalOrdersValue = computed(() => {
  return orders.value.reduce(
    (total, order) => total + (order.total_amount || 0),
    0
  );
});

// Appliquer les filtres
watch(
  filters,
  async (newFilters) => {
    // Si vous avez une méthode pour filtrer côté serveur
    // await orderStore.getAll(newFilters)
  },
  { deep: true }
);
</script>

<template>
  <div>
    <TableWrapper>
      <template #header>
        <div class="table-header">
          <div>
            <h5 class="table-title">Liste des commandes</h5>
            <div class="flex gap-6 text-sm text-gray-600 mt-2">
              <span>{{ totalFilteredRows }} commandes</span>
              <span>Total: {{ formatPrice(totalOrdersValue) }}</span>
            </div>
          </div>
        </div>

        <!-- Filtres -->
        <div class="flex flex-col sm:flex-row gap-4 py-4 border-y">
          <div class="flex-1">
            <UInput
              v-model="q"
              placeholder="Rechercher par N° commande ou nom de l'acheteur..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>

          <div class="flex gap-2">
            <USelect
              v-model="filters.status"
              :options="statusOptions"
              placeholder="Statut"
              class="min-w-[140px]"
            />

            <UInput
              v-model="filters.date_from"
              type="date"
              placeholder="Date début"
              class="min-w-[140px]"
            />

            <UInput
              v-model="filters.date_to"
              type="date"
              placeholder="Date fin"
              class="min-w-[140px]"
            />
          </div>

          <TableElementByPage v-model="pageCount" />
        </div>
      </template>

      <template #content>
        <UTable :loading="loading" :columns="orderColumns" :rows="rows">
          <!-- N° Commande -->
          <template #id-data="{ row }">
            <div>
              <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {{ truncateId(row.id) }}
              </code>
            </div>
          </template>

          <!-- Acheteur -->
          <template #buyer-data="{ row }">
            <div v-if="row.buyer" class="flex items-center gap-3">
              <UAvatar
                :src="row.buyer.avatar_url"
                :alt="`${row.buyer.first_name} ${row.buyer.last_name}`"
                size="sm"
              />
              <div>
                <p class="font-medium text-gray-900">
                  {{ row.buyer.first_name }} {{ row.buyer.last_name }}
                </p>
                <p class="text-sm text-gray-500">{{ row.buyer.email }}</p>
              </div>
            </div>
            <span v-else class="text-gray-400">Acheteur supprimé</span>
          </template>

          <!-- Statut -->
          <template #status-data="{ row }">
            <UBadge :color="getStatusColor(row.status)" variant="subtle">
              {{ getStatusLabel(row.status) }}
            </UBadge>
          </template>

          <!-- Montant total -->
          <template #total_amount-data="{ row }">
            <span class="font-medium text-gray-900">
              {{ formatPrice(row.total_amount) }}
            </span>
          </template>

          <!-- Articles -->
          <template #order_items-data="{ row }">
            <div>
              <span class="text-sm font-medium">
                {{ row.order_items?.length || 0 }} articles
              </span>
              <div
                v-if="row.order_items?.length"
                class="text-xs text-gray-500 mt-1"
              >
                <span
                  v-for="(item, index) in row.order_items.slice(0, 2)"
                  :key="item.id"
                >
                  {{ item.product?.title || "Produit supprimé" }}
                  <span v-if="index < Math.min(row.order_items.length, 2) - 1"
                    >,
                  </span>
                </span>
                <span v-if="row.order_items.length > 2" class="text-gray-400">
                  +{{ row.order_items.length - 2 }} autres...
                </span>
              </div>
            </div>
          </template>

          <!-- Méthode de livraison -->
          <template #shipping_method-data="{ row }">
            <div class="text-sm">
              <div class="font-medium">{{ row.shipping_method }}</div>
              <div class="text-gray-500">
                {{ formatPrice(row.shipping_cost) }}
              </div>
            </div>
          </template>

          <!-- Date de création -->
          <template #created_at-data="{ row }">
            <div class="text-sm">
              <div class="font-medium">
                {{ new Date(row.created_at).toLocaleDateString("fr-FR") }}
              </div>
              <div class="text-gray-500">
                {{
                  new Date(row.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </div>
            </div>
          </template>

          <!-- Actions -->
          <template #actions-data="{ row }">
            <div class="flex gap-1">
              <UButton
                @click="navigateTo(`/dashboard/orders/${row.id}`)"
                icon="i-heroicons-eye"
                size="sm"
                color="primary"
                variant="ghost"
                title="Voir les détails"
              />

              <UButton
                v-if="row.status === 'pending'"
                @click="
                  () => {
                    /* Confirmer la commande */
                  }
                "
                icon="i-heroicons-check"
                size="sm"
                color="green"
                variant="ghost"
                title="Confirmer"
              />

              <UButton
                v-if="['pending', 'confirmed'].includes(row.status)"
                @click="
                  () => {
                    /* Annuler la commande */
                  }
                "
                icon="i-heroicons-x-mark"
                size="sm"
                color="red"
                variant="ghost"
                title="Annuler"
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
          title="commandes"
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
