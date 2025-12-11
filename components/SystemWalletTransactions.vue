<script setup lang="ts">
const props = defineProps<{
  walletId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const walletStore = useWalletStore()
const transactions = ref<Transaction[]>([])
const loading = ref(false)

// Charger les transactions
async function loadTransactions() {
  loading.value = true
  const result = await walletStore.getWalletTransactions(props.walletId, 50)
  if (result.success) {
    transactions.value = result.data || []
  }
  loading.value = false
}

onMounted(() => {
  loadTransactions()
})

// Formater le type de transaction
function getTransactionTypeLabel(type: string) {
  return type === 'credit' ? 'Crédit' : 'Débit'
}

function getTransactionTypeColor(type: string) {
  return type === 'credit' ? 'green' : 'red'
}

function getTransactionTypeIcon(type: string) {
  return type === 'credit' ? 'i-heroicons-arrow-down-circle' : 'i-heroicons-arrow-up-circle'
}
</script>

<template>
  <UModal
    :model-value="true"
    @update:model-value="emit('close')"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Transactions du Wallet Système
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            size="sm"
            @click="emit('close')"
          />
        </div>
      </template>

      <div
        v-if="loading"
        class="space-y-3"
      >
        <USkeleton
          v-for="i in 5"
          :key="i"
          class="h-16 w-full"
        />
      </div>

      <div
        v-else-if="transactions.length === 0"
        class="text-center py-12"
      >
        <UIcon
          name="i-heroicons-inbox"
          class="w-16 h-16 text-gray-400 mx-auto mb-3"
        />
        <p class="text-gray-500">
          Aucune transaction pour le moment
        </p>
      </div>

      <div
        v-else
        class="space-y-2 max-h-[500px] overflow-y-auto"
      >
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              :class="`p-2 rounded-full ${transaction.transaction_type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`"
            >
              <UIcon
                :name="getTransactionTypeIcon(transaction.transaction_type)"
                :class="`w-5 h-5 ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`"
              />
            </div>
            <div>
              <p class="font-medium text-gray-900">
                {{ transaction.reason || 'Transaction' }}
              </p>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>{{ new Date(transaction.created_at).toLocaleString('fr-FR') }}</span>
                <span
                  v-if="transaction.reference"
                  class="text-xs bg-gray-200 px-2 py-0.5 rounded"
                >
                  Ref: {{ transaction.reference }}
                </span>
              </div>
              <div
                v-if="
                  transaction.balance_before !== undefined
                    && transaction.balance_after !== undefined
                "
                class="text-xs text-gray-500 mt-1"
              >
                {{ formatPrice(transaction.balance_before) }} →
                {{ formatPrice(transaction.balance_after) }}
              </div>
            </div>
          </div>

          <div class="text-right">
            <p
              :class="`text-lg font-bold ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`"
            >
              {{ transaction.transaction_type === 'credit' ? '+' : '-'
              }}{{ formatPrice(Math.abs(transaction.amount)) }}
            </p>
            <UBadge
              :color="getTransactionTypeColor(transaction.transaction_type)"
              variant="subtle"
              size="sm"
            >
              {{ getTransactionTypeLabel(transaction.transaction_type) }}
            </UBadge>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            {{ transactions.length }} transaction(s) affichée(s)
          </p>
          <UButton
            color="primary"
            :loading="loading"
            icon="i-heroicons-arrow-path"
            @click="loadTransactions"
          >
            Actualiser
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
