<script setup lang="ts">
const feeStore = useFeeStore()
const toast = useToast()

onMounted(() => {
  feeStore.getFees()
  feeStore.getFeeRules()
})

const { fees, feeRules } = storeToRefs(feeStore)

const searchQuery = ref('')
const selectedFeeFilter = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const currentRule = ref<FeeRule>({
  fee_id: '',
  applies_to_type: 'order',
  applies_to_id: undefined,
  min_value: undefined,
  max_value: undefined,
  amount: undefined,
  percentage: undefined,
  priority: 10,
  is_active: true,
})

const filteredRules = computed(() => {
  let filtered = feeRules.value

  if (selectedFeeFilter.value) {
    filtered = filtered.filter(rule => rule.fee_id === selectedFeeFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(rule =>
      rule.fee?.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return filtered
})

const feeOptions = computed(() => fees.value.map(fee => ({ label: fee.name, value: fee.id })))

const appliesTypeOptions = [
  { label: 'Commande', value: 'order' },
  { label: 'Produit', value: 'product' },
  { label: 'Vendeur', value: 'seller' },
  { label: 'Catégorie', value: 'category' },
]

function openCreateModal() {
  isEditing.value = false
  currentRule.value = {
    fee_id: '',
    applies_to_type: 'order',
    min_value: undefined,
    max_value: undefined,
    amount: undefined,
    percentage: undefined,
    priority: 10,
    is_active: true,
  }
  showModal.value = true
}

function openEditModal(rule: FeeRule) {
  isEditing.value = true
  currentRule.value = { ...rule }
  showModal.value = true
}

async function saveRule() {
  const result = isEditing.value
    ? await feeStore.updateFeeRule(currentRule.value.id!, currentRule.value)
    : await feeStore.storeFeeRule(currentRule.value)

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: `Règle ${isEditing.value ? 'modifiée' : 'créée'} avec succès`,
      color: 'green',
    })
    showModal.value = false
    await feeStore.getFeeRules()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deleteRule(rule: FeeRule) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return

  const result = await feeStore.destroyFeeRule(rule.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Règle supprimée avec succès',
      color: 'green',
    })
    await feeStore.getFeeRules()
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
          placeholder="Rechercher..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
        />
        <USelectMenu
          v-model="selectedFeeFilter"
          :options="[{ label: 'Tous les frais', value: null }, ...feeOptions]"
          placeholder="Filtrer par frais"
          class="w-64"
        />
      </div>
      <UButton
        icon="i-heroicons-plus"
        label="Nouvelle règle"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Liste des règles -->
    <UTable
      :rows="filteredRules"
      :columns="[
        { key: 'fee', label: 'Frais' },
        { key: 'applies_to_type', label: 'Appliqué à' },
        { key: 'range', label: 'Plage' },
        { key: 'value', label: 'Valeur' },
        { key: 'priority', label: 'Priorité' },
        { key: 'is_active', label: 'Actif' },
        { key: 'actions', label: 'Actions' },
      ]"
    >
      <template #fee-data="{ row }">
        <span class="font-medium">{{ row.fee?.name }}</span>
      </template>

      <template #applies_to_type-data="{ row }">
        <UBadge
          color="blue"
          variant="subtle"
        >
          {{ row.applies_to_type }}
        </UBadge>
      </template>

      <template #range-data="{ row }">
        <span
          v-if="row.min_value || row.max_value"
          class="text-sm"
        >
          {{ row.min_value || 0 }} - {{ row.max_value || '∞' }}
        </span>
        <span
          v-else
          class="text-gray-400"
        >-</span>
      </template>

      <template #value-data="{ row }">
        <span v-if="row.percentage">{{ row.percentage }}%</span>
        <span v-else-if="row.amount">{{ row.amount }} XAF</span>
        <span
          v-else
          class="text-gray-400"
        >-</span>
      </template>

      <template #is_active-data="{ row }">
        <UIcon
          :name="row.is_active ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
          :class="row.is_active ? 'text-green-500' : 'text-gray-400'"
        />
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
            @click="deleteRule(row)"
          />
        </div>
      </template>
    </UTable>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Modifier' : 'Nouvelle' }} règle de frais
          </h3>
        </template>

        <UForm
          :state="currentRule"
          :schema="feeRuleSchema"
          class="space-y-4"
          @submit="saveRule"
        >
          <UFormGroup
            label="Frais"
            name="fee_id"
            required
          >
            <USelectMenu
              v-model="currentRule.fee_id"
              :options="feeOptions"
              placeholder="Sélectionner un frais"
              value-attribute="value"
            />
          </UFormGroup>

          <UFormGroup
            label="S'applique à"
            name="applies_to_type"
            required
          >
            <USelectMenu
              v-model="currentRule.applies_to_type"
              :options="appliesTypeOptions"
              placeholder="Type d'application"
              value-attribute="value"
            />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup
              label="Valeur minimale"
              name="min_value"
            >
              <UInput
                v-model.number="currentRule.min_value"
                type="number"
                placeholder="0"
                min="0"
              />
            </UFormGroup>

            <UFormGroup
              label="Valeur maximale"
              name="max_value"
            >
              <UInput
                v-model.number="currentRule.max_value"
                type="number"
                placeholder="∞"
                min="0"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup
              label="Montant (XAF)"
              name="amount"
            >
              <UInput
                v-model.number="currentRule.amount"
                type="number"
                placeholder="0"
                min="0"
              />
            </UFormGroup>

            <UFormGroup
              label="Pourcentage (%)"
              name="percentage"
            >
              <UInput
                v-model.number="currentRule.percentage"
                type="number"
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
            </UFormGroup>
          </div>

          <UFormGroup
            label="Priorité"
            name="priority"
          >
            <UInput
              v-model.number="currentRule.priority"
              type="number"
              placeholder="10"
              min="0"
            />
          </UFormGroup>

          <UFormGroup
            label="Active"
            name="is_active"
          >
            <UToggle v-model="currentRule.is_active" />
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
              :loading="feeStore.loading"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
