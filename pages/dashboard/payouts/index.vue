<script setup lang="ts">
definePageMeta({
    name: 'Demandes de retrait',
    layout: 'dashboard'
})

const payoutStore = usePayoutStore()
const toast = useToast()

onMounted(() => {
    payoutStore.get()
})

const { payouts } = storeToRefs(payoutStore)

const searchQuery = ref('')
const statusFilter = ref<string | null>(null)

const filteredPayouts = computed(() => {
    let filtered = payouts.value

    if (statusFilter.value) {
        filtered = filtered.filter(payout => payout.status === statusFilter.value)
    }

    if (searchQuery.value) {
        filtered = filtered.filter(payout =>
            payout.wallet?.owner_id?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            payout.reference?.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    }

    return filtered
})

const statusOptions = [
    { label: 'Tous les statuts', value: null },
    { label: 'En attente', value: 'pending' },
    { label: 'Approuvé', value: 'approved' },
    { label: 'Rejeté', value: 'rejected' },
    { label: 'Effectué', value: 'done' },
    { label: 'Échoué', value: 'failed' }
]

async function updatePayoutStatus(payout: Payout, newStatus: Payout['status']) {
    const result = await payoutStore.updateStatus(payout.id!, newStatus)

    if (result.success) {
        toast.add({
            title: 'Succès',
            description: `Retrait ${newStatus === 'approved' ? 'approuvé' : newStatus === 'done' ? 'effectué' : newStatus === 'rejected' ? 'rejeté' : 'mis à jour'}`,
            color: 'green'
        })
        await payoutStore.get()
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Une erreur est survenue',
            color: 'red'
        })
    }
}

async function deletePayout(payout: Payout) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande de retrait ?')) return

    const result = await payoutStore.destroy(payout.id!)

    if (result.success) {
        toast.add({
            title: 'Supprimé',
            description: 'Demande de retrait supprimée avec succès',
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
        case 'approved': return 'blue'
        case 'done': return 'green'
        case 'rejected': return 'red'
        case 'failed': return 'red'
        default: return 'gray'
    }
}

function getStatusLabel(status?: string) {
    switch (status) {
        case 'pending': return 'En attente'
        case 'approved': return 'Approuvé'
        case 'done': return 'Effectué'
        case 'rejected': return 'Rejeté'
        case 'failed': return 'Échoué'
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
            <h1 class="text-2xl font-bold text-gray-900">Demandes de retrait</h1>
            <p class="text-gray-600 mt-1">Gérez les demandes de retrait des vendeurs</p>
        </div>

        <!-- Filtres -->
        <div class="flex gap-4">
            <UInput
                v-model="searchQuery"
                placeholder="Rechercher..."
                icon="i-heroicons-magnifying-glass"
                class="flex-1"
            />
            <USelectMenu
                v-model="statusFilter"
                :options="statusOptions"
                placeholder="Filtrer par statut"
                class="w-48"
            />
        </div>

        <!-- Liste des retraits -->
        <UTable :rows="filteredPayouts" :columns="[
            { key: 'wallet_info', label: 'Portefeuille' },
            { key: 'amount', label: 'Montant' },
            { key: 'fee', label: 'Frais' },
            { key: 'net_amount', label: 'Net à payer' },
            { key: 'payout_method', label: 'Méthode' },
            { key: 'reference', label: 'Référence' },
            { key: 'status', label: 'Statut' },
            { key: 'requested_at', label: 'Demandé le' },
            { key: 'actions', label: 'Actions' }
        ]" :loading="payoutStore.loading">
            <template #wallet_info-data="{ row }">
                <div>
                    <p class="font-medium">{{ row.wallet?.owner_type }}</p>
                    <p class="text-xs text-gray-500 font-mono">
                        {{ row.wallet?.owner_id?.substring(0, 8) }}...
                    </p>
                    <p class="text-xs text-gray-500">Balance: {{ formatAmount(row.wallet?.balance) }}</p>
                </div>
            </template>

            <template #amount-data="{ row }">
                <span class="font-medium">{{ formatAmount(row.amount) }}</span>
            </template>

            <template #fee-data="{ row }">
                <span class="text-red-600">{{ formatAmount(row.fee) }}</span>
            </template>

            <template #net_amount-data="{ row }">
                <span class="font-bold text-green-600">
                    {{ formatAmount((row.amount || 0) - (row.fee || 0)) }}
                </span>
            </template>

            <template #payout_method-data="{ row }">
                <span v-if="row.payout_method">{{ row.payout_method }}</span>
                <span v-else class="text-gray-400">-</span>
            </template>

            <template #reference-data="{ row }">
                <span v-if="row.reference" class="font-mono text-sm">{{ row.reference }}</span>
                <span v-else class="text-gray-400">-</span>
            </template>

            <template #status-data="{ row }">
                <UBadge :color="getStatusColor(row.status)" variant="subtle">
                    {{ getStatusLabel(row.status) }}
                </UBadge>
            </template>

            <template #requested_at-data="{ row }">
                <div>
                    <p class="text-sm">{{ new Date(row.requested_at!).toLocaleDateString('fr-FR') }}</p>
                    <p class="text-xs text-gray-500">{{ new Date(row.requested_at!).toLocaleTimeString('fr-FR') }}</p>
                </div>
            </template>

            <template #actions-data="{ row }">
                <div class="flex gap-2">
                    <UButton
                        v-if="row.status === 'pending'"
                        @click="updatePayoutStatus(row, 'approved')"
                        icon="i-heroicons-check"
                        size="sm"
                        color="blue"
                        variant="ghost"
                        title="Approuver"
                    />
                    <UButton
                        v-if="row.status === 'approved'"
                        @click="updatePayoutStatus(row, 'done')"
                        icon="i-heroicons-check-circle"
                        size="sm"
                        color="green"
                        variant="ghost"
                        title="Marquer comme effectué"
                    />
                    <UButton
                        v-if="row.status === 'pending' || row.status === 'approved'"
                        @click="updatePayoutStatus(row, 'rejected')"
                        icon="i-heroicons-x-mark"
                        size="sm"
                        color="red"
                        variant="ghost"
                        title="Rejeter"
                    />
                    <UButton
                        @click="deletePayout(row)"
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
