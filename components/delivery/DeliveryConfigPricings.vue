<script setup lang="ts">
const zoneStore = useDeliveryZoneStore()
const cityStore = useCityStore()
const toast = useToast()

onMounted(() => {
    cityStore.get()
    zoneStore.getZones()
    zoneStore.getPricings()
})

const { pricings, zones } = storeToRefs(zoneStore)
const { cities } = storeToRefs(cityStore)

const selectedCityFilter = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const currentPricing = ref<DeliveryPricing>({
    city_id: '',
    from_zone_id: '',
    to_zone_id: '',
    price: 0
})

const filteredPricings = computed(() => {
    if (!selectedCityFilter.value) return pricings.value
    return pricings.value.filter(p => p.city_id === selectedCityFilter.value)
})

const cityOptions = computed(() =>
    cities.value.map(city => ({ label: city.name, value: city.id }))
)

const zoneOptions = computed(() => {
    if (!currentPricing.value.city_id) return []
    return zones.value
        .filter(zone => zone.city_id === currentPricing.value.city_id)
        .map(zone => ({ label: zone.name, value: zone.id }))
})

function openCreateModal() {
    isEditing.value = false
    currentPricing.value = {
        city_id: '',
        from_zone_id: '',
        to_zone_id: '',
        price: 0
    }
    showModal.value = true
}

function openEditModal(pricing: DeliveryPricing) {
    isEditing.value = true
    currentPricing.value = { ...pricing }
    showModal.value = true
}

async function savePricing() {
    const result = isEditing.value
        ? await zoneStore.updatePricing(currentPricing.value.id!, currentPricing.value)
        : await zoneStore.storePricing(currentPricing.value)

    if (result.success) {
        toast.add({
            title: 'Succès',
            description: `Tarif ${isEditing.value ? 'modifié' : 'créé'} avec succès`,
            color: 'green'
        })
        showModal.value = false
        await zoneStore.getPricings()
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Une erreur est survenue',
            color: 'red'
        })
    }
}

async function deletePricing(pricing: DeliveryPricing) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return

    const result = await zoneStore.destroyPricing(pricing.id!)

    if (result.success) {
        toast.add({
            title: 'Supprimé',
            description: 'Tarif supprimé avec succès',
            color: 'green'
        })
        await zoneStore.getPricings()
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Impossible de supprimer',
            color: 'red'
        })
    }
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
    }).format(price)
}
</script>

<template>
    <div class="space-y-4">
        <!-- Actions -->
        <div class="flex justify-between items-center gap-4">
            <USelectMenu
                v-model="selectedCityFilter"
                :options="[{ label: 'Toutes les villes', value: null }, ...cityOptions]"
                placeholder="Filtrer par ville"
                class="w-64"
            />
            <UButton
                @click="openCreateModal"
                icon="i-heroicons-plus"
                label="Nouveau tarif"
                color="primary"
            />
        </div>

        <!-- Liste des tarifs -->
        <UTable :rows="filteredPricings" :columns="[
            { key: 'city', label: 'Ville' },
            { key: 'from_zone', label: 'De' },
            { key: 'to_zone', label: 'Vers' },
            { key: 'price', label: 'Prix' },
            { key: 'actions', label: 'Actions' }
        ]">
            <template #city-data="{ row }">
                <UBadge color="blue" variant="subtle">
                    {{ row.city?.name }}
                </UBadge>
            </template>

            <template #from_zone-data="{ row }">
                <span class="font-medium">{{ row.from_zone?.name }}</span>
            </template>

            <template #to_zone-data="{ row }">
                <span class="font-medium">{{ row.to_zone?.name }}</span>
            </template>

            <template #price-data="{ row }">
                <UBadge color="green" variant="subtle">
                    {{ formatPrice(row.price) }}
                </UBadge>
            </template>

            <template #actions-data="{ row }">
                <div class="flex gap-2">
                    <UButton
                        @click="openEditModal(row)"
                        icon="i-heroicons-pencil"
                        size="sm"
                        color="primary"
                        variant="ghost"
                    />
                    <UButton
                        @click="deletePricing(row)"
                        icon="i-heroicons-trash"
                        size="sm"
                        color="red"
                        variant="ghost"
                    />
                </div>
            </template>
        </UTable>

        <!-- Modal -->
        <UModal v-model="showModal">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">
                        {{ isEditing ? 'Modifier' : 'Nouveau' }} tarif de livraison
                    </h3>
                </template>

                <UForm :state="currentPricing" :schema="deliveryPricingSchema" @submit="savePricing" class="space-y-4">
                    <UFormGroup label="Ville" name="city_id" required>
                        <USelectMenu
                            v-model="currentPricing.city_id"
                            :options="cityOptions"
                            placeholder="Sélectionner une ville"
                            value-attribute="value"
                        />
                    </UFormGroup>

                    <UFormGroup label="Zone de départ" name="from_zone_id" required>
                        <USelectMenu
                            v-model="currentPricing.from_zone_id"
                            :options="zoneOptions"
                            placeholder="Sélectionner la zone de départ"
                            :disabled="!currentPricing.city_id"
                            value-attribute="value"
                        />
                    </UFormGroup>

                    <UFormGroup label="Zone d'arrivée" name="to_zone_id" required>
                        <USelectMenu
                            v-model="currentPricing.to_zone_id"
                            :options="zoneOptions"
                            placeholder="Sélectionner la zone d'arrivée"
                            :disabled="!currentPricing.city_id"
                            value-attribute="value"
                        />
                    </UFormGroup>

                    <UFormGroup label="Prix (XAF)" name="price" required>
                        <UInput
                            v-model.number="currentPricing.price"
                            type="number"
                            placeholder="Ex: 1000"
                            min="0"
                        />
                    </UFormGroup>

                    <div class="flex justify-end gap-2">
                        <UButton @click="showModal = false" color="gray" variant="outline">
                            Annuler
                        </UButton>
                        <UButton type="submit" :loading="zoneStore.loading">
                            {{ isEditing ? 'Modifier' : 'Créer' }}
                        </UButton>
                    </div>
                </UForm>
            </UCard>
        </UModal>
    </div>
</template>
