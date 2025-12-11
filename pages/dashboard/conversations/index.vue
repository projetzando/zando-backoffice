<script setup lang="ts">
definePageMeta({
  name: 'Liste des conversations',
  layout: 'dashboard',
})

const conversationStore = useConversationStore()

// Charger les conversations
onMounted(async () => {
  await conversationStore.getAll()
})

const { conversations, loading } = storeToRefs(conversationStore)

// Filtres
const filters = ref({
  search: '',
  status: '', // "unread", "read", ""
})

// Table configuration
const { q, page, pageCount, oneItem, isOpen, rows, totalFilteredRows, confirmDeleteItem }
  = useTable(conversations, {
    searchFields: ['seller.company_name', 'buyer.first_name', 'buyer.last_name', 'last_message'],
    filtersConfig: {
      status: (item, value) => {
        if (!value) return true
        if (value === 'unread') return (item.unread_count || 0) > 0
        if (value === 'read') return (item.unread_count || 0) === 0
        return true
      },
    },
    filters,
  })

// Options pour les filtres
const statusOptions = [
  { value: '', label: 'Toutes les conversations' },
  { value: 'unread', label: 'Non lues' },
  { value: 'read', label: 'Lues' },
]

// Fonctions utilitaires
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return diffInMinutes <= 1 ? 'À l\'instant' : `Il y a ${diffInMinutes}min`
  }
  else if (diffInHours < 24) {
    return `Il y a ${Math.floor(diffInHours)}h`
  }
  else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }
}

function truncateMessage(message: string, maxLength = 50) {
  if (!message) return 'Aucun message'
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
}

// Compter les filtres actifs
const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => value && value !== '').length
})

// Actions
function openConversation(conversation: any) {
  navigateTo(`/dashboard/conversations/${conversation.id}`)
}

function openChat(conversation: any) {
  navigateTo(`/dashboard/conversations/${conversation.id}`)
}

// Appliquer les filtres dynamiquement
watch(
  filters,
  async (newFilters) => {
    // Optionnel : filtres côté serveur si supportés
    // await conversationStore.getAll(newFilters);
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
              Liste des conversations
            </h5>
            <div class="flex gap-6 text-sm text-gray-600 mt-2">
              <span>{{ totalFilteredRows }} conversations</span>
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
              placeholder="Rechercher par vendeur, acheteur ou message..."
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

            <!-- Bouton pour réinitialiser les filtres -->
            <UButton
              v-if="filters.status"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              size="sm"
              title="Réinitialiser les filtres"
              @click="filters = { search: '', status: '' }"
            />
          </div>

          <TableElementByPage v-model="pageCount" />
        </div>
      </template>

      <template #content>
        <UTable
          :loading="loading"
          :columns="[
            { key: 'participants', label: 'Participants' },
            { key: 'last_message', label: 'Dernier message' },
            { key: 'unread_count', label: 'Non lus' },
            { key: 'last_message_at', label: 'Dernière activité' },
            { key: 'actions', label: 'Actions' },
          ]"
          :rows="rows"
        >
          <!-- Participants -->
          <template #participants-data="{ row }">
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">
                <UAvatar
                  v-if="row.buyer?.avatar_url"
                  :src="row.buyer.avatar_url"
                  :alt="`${row.buyer.first_name} ${row.buyer.last_name}`"
                  size="sm"
                />
                <UAvatar
                  v-else
                  :alt="`${row.buyer?.first_name || 'Client'} ${row.buyer?.last_name || ''}`"
                  size="sm"
                />
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{ row.buyer?.first_name }} {{ row.buyer?.last_name }}
                </p>
                <p class="text-sm text-gray-500">
                  avec {{ row.seller?.company_name }}
                </p>
              </div>
            </div>
          </template>

          <!-- Dernier message -->
          <template #last_message-data="{ row }">
            <div class="max-w-xs">
              <p class="text-sm text-gray-900 truncate">
                {{ truncateMessage(row.last_message) }}
              </p>
            </div>
          </template>

          <!-- Messages non lus -->
          <template #unread_count-data="{ row }">
            <UBadge
              v-if="(row.unread_count || 0) > 0"
              color="red"
              variant="subtle"
            >
              {{ row.unread_count }}
            </UBadge>
            <span
              v-else
              class="text-gray-400"
            >-</span>
          </template>

          <!-- Dernière activité -->
          <template #last_message_at-data="{ row }">
            <span class="text-sm text-gray-500">
              {{ formatDate(row.last_message_at || row.created_at) }}
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
                title="Voir la conversation"
                @click="openConversation(row)"
              />

              <UButton
                icon="i-heroicons-chat-bubble-left-right"
                size="sm"
                color="blue"
                variant="ghost"
                title="Ouvrir le chat"
                @click="openChat(row)"
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
          title="conversations"
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
