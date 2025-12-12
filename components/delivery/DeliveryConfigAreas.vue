<script setup lang="ts">
const areaStore = useAreaStore()
const cityStore = useCityStore()
const toast = useToast()

// Pagination
const page = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

const searchQuery = ref('')
const selectedCityFilter = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const currentArea = ref<Area>({ name: '', city_id: '' })

const { areas } = storeToRefs(areaStore)
const { cities } = storeToRefs(cityStore)

async function loadAreas() {
  const result = await areaStore.getPaginated(
    {
      page: page.value,
      pageSize: pageSize.value,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    selectedCityFilter.value || undefined,
  )

  if (result.success && result.pagination) {
    totalItems.value = result.pagination.total
    totalPages.value = result.pagination.totalPages
  }
}

onMounted(async () => {
  await cityStore.get()
  await loadAreas()
})

watch([page, selectedCityFilter], () => {
  loadAreas()
})

const filteredAreas = computed(() => {
  let filtered = areas.value

  if (searchQuery.value) {
    filtered = filtered.filter(area =>
      area.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return filtered
})

const cityOptions = computed(() =>
  cities.value.map(city => ({ label: city.name, value: city.id })),
)

function openCreateModal() {
  isEditing.value = false
  currentArea.value = { name: '', city_id: '' }
  showModal.value = true
}

function openEditModal(area: Area) {
  isEditing.value = true
  currentArea.value = { ...area }
  showModal.value = true
}

async function saveArea() {
  const result = isEditing.value
    ? await areaStore.update(currentArea.value.id!, currentArea.value)
    : await areaStore.store(currentArea.value)

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: `Quartier ${isEditing.value ? 'modifié' : 'créé'} avec succès`,
      color: 'green',
    })
    showModal.value = false
    await loadAreas()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deleteArea(area: Area) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${area.name} ?`)) return

  const result = await areaStore.destroy(area.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Quartier supprimé avec succès',
      color: 'green',
    })
    await loadAreas()
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
    <div class="flex justify-between items-center gap-4">
      <div class="flex gap-2 flex-1">
        <UInput
          v-model="searchQuery"
          placeholder="Rechercher un quartier..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
        />
        <USelectMenu
          v-model="selectedCityFilter"
          :options="[{ label: 'Toutes les villes', value: null }, ...cityOptions]"
          placeholder="Filtrer par ville"
          class="w-64"
        />
      </div>
      <UButton
        icon="i-heroicons-plus"
        label="Nouveau quartier"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Liste des quartiers -->
    <UTable
      :rows="filteredAreas"
      :columns="[
        { key: 'name', label: 'Nom' },
        { key: 'city', label: 'Ville' },
        { key: 'actions', label: 'Actions' },
      ]"
      :loading="areaStore.loading"
    >
      <template #city-data="{ row }">
        <UBadge
          color="blue"
          variant="subtle"
        >
          {{ row.city?.name }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-pencil"
            size="sm"
            color="primary"
            variant="ghost"
            @click="openEditModal(row)"
          />
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            color="red"
            variant="ghost"
            @click="deleteArea(row)"
          />
        </div>
      </template>
    </UTable>

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
        quartier(s)
      </div>

      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        :total="totalItems"
        :page-size="pageSize"
        :loading="areaStore.loading"
        @update:current-page="page = $event"
      />
    </div>

    <!-- Message si aucune donnée -->
    <div
      v-else
      class="text-center py-12 text-gray-500"
    >
      Aucun quartier trouvé
    </div>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Modifier' : 'Nouveau' }} quartier
          </h3>
        </template>

        <UForm
          :state="currentArea"
          :schema="areaSchema"
          class="space-y-4"
          @submit="saveArea"
        >
          <UFormGroup
            label="Ville"
            name="city_id"
            required
          >
            <USelectMenu
              v-model="currentArea.city_id"
              :options="cityOptions"
              placeholder="Sélectionner une ville"
              value-attribute="value"
            />
          </UFormGroup>

          <UFormGroup
            label="Nom du quartier"
            name="name"
            required
          >
            <UInput
              v-model="currentArea.name"
              placeholder="Ex: Centre-ville"
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
              :loading="areaStore.loading"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
