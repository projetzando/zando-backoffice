<script setup lang="ts">
const zoneStore = useDeliveryZoneStore()
const cityStore = useCityStore()
const toast = useToast()

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  createPricing: [route: any]
}>()

const { pricings, zones } = storeToRefs(zoneStore)
const { cities } = storeToRefs(cityStore)

const selectedCityFilter = ref<string | undefined>(undefined)
const showOnlyBidirectional = ref(false)
const bulkCreateMode = ref(false)
const defaultPrice = ref<number>(0)
const isCreatingBulk = ref(false)

// Générer le rapport des tarifs manquants
const missingReport = computed(() => {
  return zoneStore.getMissingPricingsReport(selectedCityFilter.value || undefined)
})

// Filtrer le rapport selon les options
const filteredReport = computed(() => {
  if (!showOnlyBidirectional.value) return missingReport.value

  return missingReport.value.map(city => ({
    ...city,
    missing_routes: city.missing_routes.filter((route: any) => route.is_bidirectional),
    total_missing: city.missing_routes.filter((route: any) => route.is_bidirectional).length,
  })).filter(city => city.total_missing > 0)
})

const cityOptions = computed(() => [
  { label: 'Toutes les villes', value: undefined },
  ...cities.value.map(city => ({ label: city.name, value: city.id })),
])

// Statistiques globales
const globalStats = computed(() => {
  const totalMissing = filteredReport.value.reduce((sum, city) => sum + city.total_missing, 0)
  const totalBidirectional = filteredReport.value.reduce(
    (sum, city) => sum + city.missing_routes.filter((r: any) => r.is_bidirectional).length,
    0,
  )
  const totalCities = filteredReport.value.length

  return { totalMissing, totalBidirectional, totalCities }
})

function handleCreatePricing(route: any) {
  emit('createPricing', route)
  emit('close')
}

function formatRouteName(route: any) {
  return `${route.from_zone_name} → ${route.to_zone_name}`
}

async function handleBulkCreate() {
  if (!defaultPrice.value || defaultPrice.value <= 0) {
    toast.add({
      title: 'Erreur',
      description: 'Veuillez entrer un montant valide',
      color: 'red',
    })
    return
  }

  isCreatingBulk.value = true

  try {
    // Préparer tous les tarifs à créer
    const routesToCreate = filteredReport.value.flatMap((city: any) =>
      city.missing_routes.map((route: any) => ({
        city_id: route.city_id,
        from_zone_id: route.from_zone_id,
        to_zone_id: route.to_zone_id,
        price: defaultPrice.value,
      })),
    )

    // Insertion en masse optimisée par batches de 500 lignes
    const result = await zoneStore.storeBulkPricings(routesToCreate)

    if (result.count > 0) {
      const color = result.errors ? 'orange' : 'green'
      const title = result.errors ? 'Création partielle' : 'Succès'
      const description = result.message
        || `${result.count} tarif(s) créé(s) avec succès`

      toast.add({
        title,
        description,
        color,
      })

      // Recharger les tarifs pour mettre à jour le rapport
      await zoneStore.getPricings(selectedCityFilter.value || undefined)
    }
    else if (result.message) {
      // Aucun tarif à créer
      toast.add({
        title: 'Information',
        description: result.message,
        color: 'blue',
      })
    }
    else {
      toast.add({
        title: 'Erreur',
        description: result.error?.message || 'Erreur lors de la création en masse',
        color: 'red',
      })
    }
  }
  catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.message || 'Erreur lors de la création en masse',
      color: 'red',
    })
  }
  finally {
    isCreatingBulk.value = false
    bulkCreateMode.value = false
    defaultPrice.value = 0
  }
}
</script>

<template>
  <UModal
    v-model="props.show"
    :ui="{ width: 'sm:max-w-4xl' }"
    @close="emit('close')"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Rapport des tarifs manquants
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Identifiez toutes les routes sans tarif configuré
            </p>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="emit('close')"
          />
        </div>
      </template>

      <!-- Filtres -->
      <div class="space-y-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Filtrer par ville">
            <USelectMenu
              v-model="selectedCityFilter"
              :options="cityOptions"
              placeholder="Sélectionner une ville"
            />
          </UFormGroup>

          <UFormGroup label="Options d'affichage">
            <UCheckbox
              v-model="showOnlyBidirectional"
              label="Afficher uniquement les routes bidirectionnelles manquantes"
            />
          </UFormGroup>
        </div>

        <!-- Statistiques globales -->
        <UAlert
          v-if="globalStats.totalMissing > 0"
          icon="i-heroicons-exclamation-triangle"
          color="orange"
          variant="subtle"
          :title="`${globalStats.totalMissing} route(s) sans tarif`"
          :description="`${globalStats.totalBidirectional} route(s) bidirectionnelles • ${globalStats.totalCities} ville(s) concernée(s)`"
        />

        <UAlert
          v-else
          icon="i-heroicons-check-circle"
          color="green"
          variant="subtle"
          title="Tous les tarifs sont configurés"
          description="Toutes les combinaisons de zones ont un tarif défini"
        />

        <!-- Section de création en masse -->
        <div
          v-if="globalStats.totalMissing > 0"
          class="border border-primary-200 bg-primary-50 rounded-lg p-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <UIcon
                  name="i-heroicons-bolt"
                  class="w-5 h-5 text-primary-600"
                />
                Création rapide en masse
              </h4>
              <p class="text-sm text-gray-600 mb-3">
                Créez tous les tarifs manquants avec un montant par défaut. Vous pourrez les ajuster individuellement après.
              </p>

              <div
                v-if="!bulkCreateMode"
                class="flex gap-2"
              >
                <UButton
                  icon="i-heroicons-plus-circle"
                  color="primary"
                  @click="bulkCreateMode = true"
                >
                  Configurer la création en masse
                </UButton>
              </div>

              <div
                v-else
                class="space-y-3"
              >
                <UFormGroup
                  label="Montant par défaut (XAF)"
                  help="Ce montant sera appliqué à toutes les routes manquantes"
                >
                  <UInput
                    v-model.number="defaultPrice"
                    type="number"
                    placeholder="Ex: 1000"
                    min="0"
                    icon="i-heroicons-currency-dollar"
                  />
                </UFormGroup>

                <div class="flex gap-2">
                  <UButton
                    icon="i-heroicons-check"
                    color="primary"
                    :loading="isCreatingBulk"
                    :disabled="!defaultPrice || defaultPrice <= 0"
                    @click="handleBulkCreate"
                  >
                    Créer {{ globalStats.totalMissing }} tarif(s)
                  </UButton>
                  <UButton
                    color="gray"
                    variant="outline"
                    :disabled="isCreatingBulk"
                    @click="bulkCreateMode = false; defaultPrice = 0"
                  >
                    Annuler
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rapport par ville -->
      <div
        v-if="globalStats.totalMissing > 0"
        class="space-y-6 max-h-[500px] overflow-y-auto"
      >
        <div
          v-for="cityReport in filteredReport"
          :key="cityReport.city_id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <!-- En-tête de ville -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-map-pin"
                class="w-5 h-5 text-primary-600"
              />
              <h4 class="font-semibold text-gray-900">
                {{ cityReport.city_name }}
              </h4>
              <UBadge
                color="orange"
                variant="subtle"
              >
                {{ cityReport.total_missing }} route(s) manquante(s)
              </UBadge>
            </div>
          </div>

          <!-- Liste des routes manquantes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="(route, index) in cityReport.missing_routes"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-2 flex-1">
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="w-4 h-4 text-gray-400"
                />
                <span class="text-sm font-medium text-gray-900">
                  {{ formatRouteName(route) }}
                </span>
                <UBadge
                  v-if="route.is_bidirectional"
                  color="red"
                  variant="subtle"
                  size="xs"
                >
                  Aller-retour manquant
                </UBadge>
              </div>

              <UButton
                icon="i-heroicons-plus"
                size="xs"
                color="primary"
                @click="handleCreatePricing(route)"
              >
                Créer
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-600">
            Conseil : Configurez les tarifs pour toutes les routes (A→B et B→A) pour assurer une couverture complète
          </p>
          <UButton
            color="gray"
            @click="emit('close')"
          >
            Fermer
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
