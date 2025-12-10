<script setup lang="ts">
definePageMeta({
    name: 'Paiements',
    layout: 'dashboard'
})

const paymentStore = usePaymentStore()
const toast = useToast()

onMounted(() => {
    paymentStore.get()
})

const { payments } = storeToRefs(paymentStore)

const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const methodFilter = ref<string | null>(null)

const filteredPayments = computed(() => {
    let filtered = payments.value

    if (statusFilter.value) {
        filtered = filtered.filter(payment => payment.status === statusFilter.value)
    }

    if (methodFilter.value) {
        filtered = filtered.filter(payment => payment.method === methodFilter.value)
    }

    if (searchQuery.value) {
        filtered = filtered.filter(payment =>
            payment.order?.reference?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            payment.transaction_ref?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            payment.safe_reference?.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    }

    return filtered
})

const statusOptions = [
    { label: 'Tous les statuts', value: null },
    { label: 'En attente', value: 'pending' },
    { label: 'Complété', value: 'completed' },
    { label: 'Échoué', value: 'failed' },
    { label: 'Annulé', value: 'cancelled' }
]

const methodOptions = computed(() => {
    const methods = [...new Set(payments.value.map(p => p.method))]
    return [
        { label: 'Toutes les méthodes', value: null },
        ...methods.map(method => ({ label: method, value: method }))
    ]
})

async function updatePaymentStatus(payment: Payment, newStatus: Payment['status']) {
    const result = await paymentStore.updateStatus(payment.id!, newStatus)

    if (result.success) {
        toast.add({
            title: 'Succès',
            description: `Paiement ${newStatus === 'completed' ? 'validé' : newStatus === 'failed' ? 'marqué comme échoué' : newStatus === 'cancelled' ? 'annulé' : 'mis à jour'}`,
            color: 'green'
        })
        await paymentStore.get()
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Une erreur est survenue',
            color: 'red'
        })
    }
}

async function deletePayment(payment: Payment) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return

    const result = await paymentStore.destroy(payment.id!)

    if (result.success) {
        toast.add({
            title: 'Supprimé',
            description: 'Paiement supprimé avec succès',
            color: 'green'
        })
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Impossible de supprimer',
            color: 'red'
        })
    }
}

function getStatusColor(status?: string) {
    switch (status) {
        case 'pending': return 'yellow'
        case 'completed': return 'green'
        case 'failed': return 'red'
        case 'cancelled': return 'gray'
        default: return 'gray'
    }
}

function getStatusLabel(status?: string) {
    switch (status) {
        case 'pending': return 'En attente'
        case 'completed': return 'Complété'
        case 'failed': return 'Échoué'
        case 'cancelled': return 'Annulé'
        default: return status
    }
}

function formatAmount(amount?: number) {
    if (!amount) return '0 XAF'
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount) + ' XAF'
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Paiements</h1>
            <p class="text-gray-600 mt-1">Gérez les paiements des commandes</p>
        </div>

        <!-- Filtres -->
        <div class="flex gap-4">
            <UInput
                v-model="searchQuery"
                placeholder="Rechercher par référence..."
                icon="i-heroicons-magnifying-glass"
                class="flex-1"
            />
            <USelectMenu
                v-model="statusFilter"
                :options="statusOptions"
                placeholder="Filtrer par statut"
                class="w-48"
            />
            <USelectMenu
                v-model="methodFilter"
                :options="methodOptions"
                placeholder="Filtrer par méthode"
                class="w-48"
            />
        </div>

        <!-- Liste des paiements -->
        <UTable :rows="filteredPayments" :columns="[
            { key: 'order_ref', label: 'Commande' },
            { key: 'buyer', label: 'Acheteur' },
            { key: 'amount', label: 'Montant' },
            { key: 'method', label: 'Méthode' },
            { key: 'transaction_ref', label: 'Référence transaction' },
            { key: 'safe_reference', label: 'Référence sécurisée' },
            { key: 'status', label: 'Statut' },
            { key: 'created_at', label: 'Date' },
            { key: 'actions', label: 'Actions' }
        ]" :loading="paymentStore.loading">
            <template #order_ref-data="{ row }">
                <div>
                    <p class="font-medium">{{ row.order?.reference }}</p>
                    <p class="text-xs text-gray-500">{{ formatAmount(row.order?.total_price) }}</p>
                </div>
            </template>

            <template #buyer-data="{ row }">
                <div v-if="row.order?.buyer">
                    <p class="font-medium">{{ row.order.buyer.first_name }} {{ row.order.buyer.last_name }}</p>
                </div>
                <span v-else class="text-gray-400">-</span>
            </template>

            <template #amount-data="{ row }">
                <span class="font-medium">{{ formatAmount(row.amount) }}</span>
            </template>

            <template #method-data="{ row }">
                <UBadge color="blue" variant="subtle">{{ row.method }}</UBadge>
            </template>

            <template #transaction_ref-data="{ row }">
                <span v-if="row.transaction_ref" class="font-mono text-sm">{{ row.transaction_ref }}</span>
                <span v-else class="text-gray-400">-</span>
            </template>

            <template #safe_reference-data="{ row }">
                <span v-if="row.safe_reference" class="font-mono text-sm">{{ row.safe_reference }}</span>
                <span v-else class="text-gray-400">-</span>
            </template>

            <template #status-data="{ row }">
                <UBadge :color="getStatusColor(row.status)" variant="subtle">
                    {{ getStatusLabel(row.status) }}
                </UBadge>
            </template>

            <template #created_at-data="{ row }">
                <div>
                    <p class="text-sm">{{ row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '-' }}</p>
                    <p class="text-xs text-gray-500">{{ row.created_at ? new Date(row.created_at).toLocaleTimeString('fr-FR') : '' }}</p>
                </div>
            </template>

            <template #actions-data="{ row }">
                <div class="flex gap-2">
                    <UButton
                        v-if="row.status === 'pending'"
                        @click="updatePaymentStatus(row, 'completed')"
                        icon="i-heroicons-check-circle"
                        size="sm"
                        color="green"
                        variant="ghost"
                        title="Valider"
                    />
                    <UButton
                        v-if="row.status === 'pending'"
                        @click="updatePaymentStatus(row, 'failed')"
                        icon="i-heroicons-x-circle"
                        size="sm"
                        color="red"
                        variant="ghost"
                        title="Marquer comme échoué"
                    />
                    <UButton
                        v-if="row.status === 'pending'"
                        @click="updatePaymentStatus(row, 'cancelled')"
                        icon="i-heroicons-no-symbol"
                        size="sm"
                        color="gray"
                        variant="ghost"
                        title="Annuler"
                    />
                    <UButton
                        @click="deletePayment(row)"
                        icon="i-heroicons-trash"
                        size="sm"
                        color="red"
                        variant="ghost"
                        title="Supprimer"
                    />
                </div>
            </template>
        </UTable>
    </div>
</template>
