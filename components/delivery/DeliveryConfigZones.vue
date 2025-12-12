<script setup lang="ts">
const zoneStore = useDeliveryZoneStore()
const cityStore = useCityStore()
const toast = useToast()

// Pagination
const page = ref(1)
const pageSize = ref(12)
const totalItems = ref(0)
const totalPages = ref(0)

const searchQuery = ref('')
const selectedCityFilter = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const currentZone = ref<DeliveryZone>({ name: '', city_id: '', description: '' })

const { zones } = storeToRefs(zoneStore)
const { cities } = storeToRefs(cityStore)

async function loadZones() {
  const result = await zoneStore.getZonesPaginated(
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
  await loadZones()
})

watch([page, selectedCityFilter], () => {
  loadZones()
})

const filteredZones = computed(() => {
  let filtered = zones.value

  if (searchQuery.value) {
    filtered = filtered.filter(zone =>
      zone.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return filtered
})

const cityOptions = computed(() =>
  cities.value.map(city => ({ label: city.name, value: city.id })),
)

function openCreateModal() {
  isEditing.value = false
  currentZone.value = { name: '', city_id: '', description: '' }
  showModal.value = true
}

function openEditModal(zone: DeliveryZone) {
  isEditing.value = true
  currentZone.value = { ...zone }
  showModal.value = true
}

async function saveZone() {
  const result = isEditing.value
    ? await zoneStore.updateZone(currentZone.value.id!, currentZone.value)
    : await zoneStore.storeZone(currentZone.value)

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: `Zone ${isEditing.value ? 'modifiée' : 'créée'} avec succès`,
      color: 'green',
    })
    showModal.value = false
    await loadZones()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deleteZone(zone: DeliveryZone) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${zone.name} ?`)) return

  const result = await zoneStore.destroyZone(zone.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Zone supprimée avec succès',
      color: 'green',
    })
    await loadZones()
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
          placeholder="Rechercher une zone..."
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
        label="Nouvelle zone"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Liste des zones -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard
        v-for="zone in filteredZones"
        :key="zone.id"
      >
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-lg">
                {{ zone.name }}
              </h3>
              <UBadge
                color="blue"
                variant="subtle"
                class="mt-1"
              >
                {{ zone.city?.name }}
              </UBadge>
            </div>
            <div class="flex gap-2">
              <UButton
                icon="i-heroicons-pencil"
                size="sm"
                color="primary"
                variant="ghost"
                @click="openEditModal(zone)"
              />
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="ghost"
                @click="deleteZone(zone)"
              />
            </div>
          </div>
          <p
            v-if="zone.description"
            class="text-sm text-gray-600"
          >
            {{ zone.description }}
          </p>
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
        zone(s)
      </div>

      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        :total="totalItems"
        :page-size="pageSize"
        :loading="zoneStore.loading"
        @update:current-page="page = $event"
      />
    </div>

    <!-- Message si aucune donnée -->
    <div
      v-else
      class="text-center py-12 text-gray-500"
    >
      Aucune zone trouvée
    </div>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Modifier' : 'Nouvelle' }} zone de livraison
          </h3>
        </template>

        <UForm
          :state="currentZone"
          :schema="deliveryZoneSchema"
          class="space-y-4"
          @submit="saveZone"
        >
          <UFormGroup
            label="Ville"
            name="city_id"
            required
          >
            <USelectMenu
              v-model="currentZone.city_id"
              :options="cityOptions"
              placeholder="Sélectionner une ville"
              value-attribute="value"
            />
          </UFormGroup>

          <UFormGroup
            label="Nom de la zone"
            name="name"
            required
          >
            <UInput
              v-model="currentZone.name"
              placeholder="Ex: Zone Nord"
            />
          </UFormGroup>

          <UFormGroup
            label="Description"
            name="description"
          >
            <UTextarea
              v-model="currentZone.description"
              placeholder="Description de la zone (optionnel)"
              :rows="3"
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
              :loading="zoneStore.loading"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
