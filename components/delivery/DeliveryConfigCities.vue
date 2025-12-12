<script setup lang="ts">
const cityStore = useCityStore()
const toast = useToast()

// Pagination
const page = ref(1)
const pageSize = ref(12)
const totalItems = ref(0)
const totalPages = ref(0)

const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentCity = ref<City>({ name: '' })

const { cities } = storeToRefs(cityStore)

async function loadCities() {
  const result = await cityStore.getPaginated({
    page: page.value,
    pageSize: pageSize.value,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  if (result.success && result.pagination) {
    totalItems.value = result.pagination.total
    totalPages.value = result.pagination.totalPages
  }
}

onMounted(async () => {
  await loadCities()
})

watch(page, () => {
  loadCities()
})

const filteredCities = computed(() => {
  let filtered = cities.value

  if (searchQuery.value) {
    filtered = filtered.filter(city =>
      city.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return filtered
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
      color: 'green',
    })
    showModal.value = false
    await loadCities()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
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
      color: 'green',
    })
    await loadCities()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Impossible de supprimer',
      color: 'red',
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
        icon="i-heroicons-plus"
        label="Nouvelle ville"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Liste des villes -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="city in filteredCities"
        :key="city.id"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold text-lg">
              {{ city.name }}
            </h3>
            <p class="text-sm text-gray-500">
              Créée le {{ new Date(city.created_at!).toLocaleDateString('fr-FR') }}
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-pencil"
              size="sm"
              color="primary"
              variant="ghost"
              @click="openEditModal(city)"
            />
            <UButton
              icon="i-heroicons-trash"
              size="sm"
              color="red"
              variant="ghost"
              @click="deleteCity(city)"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalItems > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t"
    >
      <div class="text-sm text-gray-700 text-center sm:text-left">
        Affichage de
        <span class="font-medium">{{ (page - 1) * pageSize + 1 }}</span>
        à
        <span class="font-medium">{{ Math.min(page * pageSize, totalItems) }}</span>
        sur
        <span class="font-medium">{{ totalItems }}</span>
        ville(s)
      </div>

      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        :total="totalItems"
        :page-size="pageSize"
        :loading="cityStore.loading"
        @update:current-page="page = $event"
      />
    </div>

    <!-- Message si aucune donnée -->
    <div
      v-else
      class="text-center py-12 text-gray-500"
    >
      Aucune ville trouvée
    </div>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Modifier' : 'Nouvelle' }} ville
          </h3>
        </template>

        <UForm
          :state="currentCity"
          :schema="citySchema"
          class="space-y-4"
          @submit="saveCity"
        >
          <UFormGroup
            label="Nom de la ville"
            name="name"
            required
          >
            <UInput
              v-model="currentCity.name"
              placeholder="Ex: Pointe-Noire"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="outline"
              @click="showModal = false"
            >
              Annuler
            </UButton>
            <UButton
              type="submit"
              :loading="cityStore.loading"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
