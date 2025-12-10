<script setup lang="ts">
definePageMeta({
    name: 'Alertes de sécurité',
    layout: 'dashboard'
})

const alertStore = useAlertStore()
const authStore = useAuthStore()
const toast = useToast()

onMounted(() => {
    alertStore.get()
})

const { alerts } = storeToRefs(alertStore)

const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const typeFilter = ref<string | null>(null)

const filteredAlerts = computed(() => {
    let filtered = alerts.value

    if (statusFilter.value) {
        filtered = filtered.filter(alert => alert.status === statusFilter.value)
    }

    if (typeFilter.value) {
        filtered = filtered.filter(alert => alert.alert_type === typeFilter.value)
    }

    if (searchQuery.value) {
        filtered = filtered.filter(alert =>
            alert.message_content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            alert.sender?.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            alert.sender?.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    }

    return filtered
})

const statusOptions = [
    { label: 'Tous les statuts', value: null },
    { label: 'En attente', value: 'pending' },
    { label: 'Examiné', value: 'reviewed' },
    { label: 'Résolu', value: 'resolved' },
    { label: 'Rejeté', value: 'dismissed' }
]

const typeOptions = computed(() => {
    const types = [...new Set(alerts.value.map(a => a.alert_type))]
    return [
        { label: 'Tous les types', value: null },
        ...types.map(type => ({ label: type, value: type }))
    ]
})

async function updateAlertStatus(alert: Alert, newStatus: Alert['status']) {
    const result = await alertStore.updateStatus(
        alert.id!,
        newStatus,
        authStore.connected_user?.id
    )

    if (result.success) {
        toast.add({
            title: 'Succès',
            description: `Alerte ${newStatus === 'reviewed' ? 'examinée' : newStatus === 'resolved' ? 'résolue' : 'rejetée'}`,
            color: 'green'
        })
        await alertStore.get()
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Une erreur est survenue',
            color: 'red'
        })
    }
}

async function deleteAlert(alert: Alert) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return

    const result = await alertStore.destroy(alert.id!)

    if (result.success) {
        toast.add({
            title: 'Supprimé',
            description: 'Alerte supprimée avec succès',
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
        case 'reviewed': return 'blue'
        case 'resolved': return 'green'
        case 'dismissed': return 'gray'
        default: return 'gray'
    }
}

function getStatusLabel(status?: string) {
    switch (status) {
        case 'pending': return 'En attente'
        case 'reviewed': return 'Examiné'
        case 'resolved': return 'Résolu'
        case 'dismissed': return 'Rejeté'
        default: return status
    }
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Alertes de sécurité</h1>
            <p class="text-gray-600 mt-1">Gérez les alertes détectées dans les conversations</p>
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
            <USelectMenu
                v-model="typeFilter"
                :options="typeOptions"
                placeholder="Filtrer par type"
                class="w-48"
            />
        </div>

        <!-- Liste des alertes -->
        <UTable :rows="filteredAlerts" :columns="[
            { key: 'alert_type', label: 'Type' },
            { key: 'sender', label: 'Expéditeur' },
            { key: 'message_content', label: 'Message' },
            { key: 'detected_content', label: 'Contenu détecté' },
            { key: 'status', label: 'Statut' },
            { key: 'created_at', label: 'Date' },
            { key: 'actions', label: 'Actions' }
        ]" :loading="alertStore.loading">
            <template #alert_type-data="{ row }">
                <UBadge color="red" variant="subtle">{{ row.alert_type }}</UBadge>
            </template>

            <template #sender-data="{ row }">
                <div>
                    <p class="font-medium">{{ row.sender?.first_name }} {{ row.sender?.last_name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ row.sender_id?.substring(0, 8) }}...</p>
                </div>
            </template>

            <template #message_content-data="{ row }">
                <p class="truncate max-w-xs">{{ row.message_content }}</p>
            </template>

            <template #detected_content-data="{ row }">
                <p v-if="row.detected_content" class="text-sm text-red-600 truncate max-w-xs">
                    {{ row.detected_content }}
                </p>
                <span v-else class="text-gray-400">-</span>
            </template>

            <template #status-data="{ row }">
                <UBadge :color="getStatusColor(row.status)" variant="subtle">
                    {{ getStatusLabel(row.status) }}
                </UBadge>
            </template>

            <template #created_at-data="{ row }">
                {{ row.created_at ? new Date(row.created_at).toLocaleString('fr-FR') : '-' }}
            </template>

            <template #actions-data="{ row }">
                <div class="flex gap-2">
                    <UButton
                        v-if="row.status === 'pending'"
                        @click="updateAlertStatus(row, 'reviewed')"
                        icon="i-heroicons-eye"
                        size="sm"
                        color="blue"
                        variant="ghost"
                        title="Examiner"
                    />
                    <UButton
                        v-if="row.status === 'pending' || row.status === 'reviewed'"
                        @click="updateAlertStatus(row, 'resolved')"
                        icon="i-heroicons-check-circle"
                        size="sm"
                        color="green"
                        variant="ghost"
                        title="Résoudre"
                    />
                    <UButton
                        v-if="row.status === 'pending' || row.status === 'reviewed'"
                        @click="updateAlertStatus(row, 'dismissed')"
                        icon="i-heroicons-x-circle"
                        size="sm"
                        color="gray"
                        variant="ghost"
                        title="Rejeter"
                    />
                    <UButton
                        @click="deleteAlert(row)"
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
