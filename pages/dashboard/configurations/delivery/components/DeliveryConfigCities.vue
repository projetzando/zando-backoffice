<script setup lang="ts">
const cityStore = useCityStore()
const toast = useToast()

onMounted(() => {
    cityStore.get()
})

const { cities } = storeToRefs(cityStore)

const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentCity = ref<City>({ name: '' })

const filteredCities = computed(() => {
    if (!searchQuery.value) return cities.value
    return cities.value.filter(city =>
        city.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

function openCreateModal() {
    isEditing.value = false
    currentCity.value = { name: '' }
    showModal.value = true
}

function openEditModal(city: City) {
    isEditing.value = true
    currentCity.value = { ...city }
    showModal.value = true
}

async function saveCity() {
    const result = isEditing.value
        ? await cityStore.update(currentCity.value.id!, currentCity.value)
        : await cityStore.store(currentCity.value)

    if (result.success) {
        toast.add({
            title: 'Succès',
            description: `Ville ${isEditing.value ? 'modifiée' : 'créée'} avec succès`,
            color: 'green'
        })
        showModal.value = false
        await cityStore.get()
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Une erreur est survenue',
            color: 'red'
        })
    }
}

async function deleteCity(city: City) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${city.name} ?`)) return

    const result = await cityStore.destroy(city.id!)

    if (result.success) {
        toast.add({
            title: 'Supprimé',
            description: 'Ville supprimée avec succès',
            color: 'green'
        })
        await cityStore.get()
    } else {
        toast.add({
            title: 'Erreur',
            description: result.error?.message || 'Impossible de supprimer',
            color: 'red'
        })
    }
}
</script>

<template>
    <div class="space-y-4">
        <!-- Actions -->
        <div class="flex justify-between items-center">
            <UInput
                v-model="searchQuery"
                placeholder="Rechercher une ville..."
                icon="i-heroicons-magnifying-glass"
                class="w-64"
            />
            <UButton
                @click="openCreateModal"
                icon="i-heroicons-plus"
                label="Nouvelle ville"
                color="primary"
            />
        </div>

        <!-- Liste des villes -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard v-for="city in filteredCities" :key="city.id">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-lg">{{ city.name }}</h3>
                        <p class="text-sm text-gray-500">
                            Créée le {{ new Date(city.created_at!).toLocaleDateString('fr-FR') }}
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <UButton
                            @click="openEditModal(city)"
                            icon="i-heroicons-pencil"
                            size="sm"
                            color="primary"
                            variant="ghost"
                        />
                        <UButton
                            @click="deleteCity(city)"
                            icon="i-heroicons-trash"
                            size="sm"
                            color="red"
                            variant="ghost"
                        />
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Modal -->
        <UModal v-model="showModal">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">
                        {{ isEditing ? 'Modifier' : 'Nouvelle' }} ville
                    </h3>
                </template>

                <UForm :state="currentCity" :schema="citySchema" @submit="saveCity" class="space-y-4">
                    <UFormGroup label="Nom de la ville" name="name" required>
                        <UInput v-model="currentCity.name" placeholder="Ex: Pointe-Noire" />
                    </UFormGroup>

                    <div class="flex justify-end gap-2">
                        <UButton @click="showModal = false" color="gray" variant="outline">
                            Annuler
                        </UButton>
                        <UButton type="submit" :loading="cityStore.loading">
                            {{ isEditing ? 'Modifier' : 'Créer' }}
                        </UButton>
                    </div>
                </UForm>
            </UCard>
        </UModal>
    </div>
</template>
